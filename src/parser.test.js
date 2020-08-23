/* 
written according to:
https://www.debian.org/doc/debian-policy/ch-controlfields.html#syntax-of-control-files 
*/

import {
	splitIntoParagraphs,
	splitIntoFields,
	filterFields,
  normalizeAndVerifyField,
  convertFieldsToPackage
} from './parser';

test("split into paragraphs: empty line separator", () => {
  const fileContent = "Hello\n\nworld\n!";
  const paragraphs = splitIntoParagraphs(fileContent);
  expect(paragraphs).toEqual(["Hello", "world\n!"]);
});

test("split into paragraphs: whitespace separator", () => {
  const fileContent = "Hello\n  \t \nworld\n!";
  const paragraphs = splitIntoParagraphs(fileContent);
  expect(paragraphs).toEqual(["Hello", "world\n!"]);
});

test("split into paragraphs: 1 paragraph", () => {
  const fileContent = "Hello";
  const paragraphs = splitIntoParagraphs(fileContent);
  expect(paragraphs).toEqual(["Hello"]);
});

test("split into paragraphs: 1 paragraph with a separator", () => {
  const fileContent = "Hello\n\n";
  const paragraphs = splitIntoParagraphs(fileContent);
  expect(paragraphs).toEqual(["Hello"]);
});

test("split into paragraphs: 1 empty paragraph", () => {
  const fileContent = "";
  expect(() => splitIntoParagraphs(fileContent)).toThrow();
});

test("split into paragraphs: 1 empty paragraph with separator", () => {
  const fileContent = "  \t  \n";
  expect(() => splitIntoParagraphs(fileContent)).toThrow();
});

test("split into paragraphs: 1 empty paragraph with 2 separators", () => {
  const fileContent = "\n\n  \t  \n";
  expect(() => splitIntoParagraphs(fileContent)).toThrow();
});

/* ----------------------------------------------------------------------- */

test("split into fields: single-line fields", () => {
  const paragraph = "Package: foo\nDescription: bar";
  const fields = splitIntoFields(paragraph);
  expect(fields).toEqual(["Package: foo", "Description: bar"]);
});

test("split into fields: multi-line fields", () => {
  const paragraph = "Package: foo\nDescription: bar\n .\n bar";
  const fields = splitIntoFields(paragraph);
  expect(fields).toEqual(["Package: foo", "Description: bar\n .\n bar"]);
});

test("split into fields: ignore #", () => {
  const paragraph = "Package: foo\n#Description: bar";
  const fields = splitIntoFields(paragraph);
  expect(fields).toEqual(["Package: foo"]);
});

test("split into fields: ignore -", () => {
  const paragraph = "Package: foo\n-Description: bar";
  const fields = splitIntoFields(paragraph);
  expect(fields).toEqual(["Package: foo"]);
});

test("split into fields: ignore field with no value", () => {
  const paragraph = "Package: foo\nDescription: ";
  const fields = splitIntoFields(paragraph);
  expect(fields).toEqual(["Package: foo"]);
});

test("split into fields: empty paragraph", () => {
  const paragraph = "";
  expect(() => splitIntoFields(paragraph)).toThrow();
});

test("split into fields: paragraph with no fields (colon missing)", () => {
  const paragraph = "Hello\nworld!";
  expect(() => splitIntoFields(paragraph)).toThrow();
});

/* ----------------------------------------------------------------------- */

test("filter fields: 2 extra fields", () => {
  const fields = ["Package: foo", "Weight: 500", "Feelings: mixed"];
  const filteredFields = filterFields(fields);
  expect(filteredFields).toEqual(["Package: foo"]);
});

test("filter fields: weird capitalization in field names", () => {
  const fields = ["package: foo", "deSCription: bar", "DEPENDS: pre_foo"];
  const filteredFields = filterFields(fields);
  expect(filteredFields).toEqual(["package: foo", "deSCription: bar", "DEPENDS: pre_foo"]);
});

test("filter fields: all extra fields", () => {
  const fields = ["Weight: 500", "Feelings: mixed"];
  const filteredFields = filterFields(fields);
  expect(filteredFields).toEqual([]);
});

/* ----------------------------------------------------------------------- */

test("normalize and verify fields: correct, single-line", () => {
  const field = "Package: foo";
  const normalizedField = normalizeAndVerifyField(field);
  expect(normalizedField).toEqual("Package:foo");
});

test("normalize and verify fields: correct, multi-line", () => {
  const field = "Description: foo\n bar";
  const normalizedField = normalizeAndVerifyField(field);
  expect(normalizedField).toEqual("Package:foo\nbar");
});

test("normalize and verify fields: correct, multi-line - blank line", () => {
  const field = "Description: foo\n .\n bar";
  const normalizedField = normalizeAndVerifyField(field);
  expect(normalizedField).toEqual("Package:foo\n\nbar");
});

test("normalize and verify fields: correct, multi-line - with a comment", () => {
  const field = "Description: foo\n#comment\n bar";
  const normalizedField = normalizeAndVerifyField(field);
  expect(normalizedField).toEqual("Package:foo\nbar");
});

test("normalize and verify fields: correct, single-line - extra whitespace", () => {
  const field = "Package: \tfoo  \t";
  const normalizedField = normalizeAndVerifyField(field);
  expect(normalizedField).toEqual("Package:foo");
});

test("normalize and verify fields: correct, multi-line - extra new line", () => {
  const field = "Description: foo\n";
  const normalizedField = normalizeAndVerifyField(field);
  expect(normalizedField).toEqual("Package:foo");
});

test("normalize and verify fields: wrong, multi-line - missing space on a continuation line", () => {
  const field = "Description: foo\nbar";
  expect(() => normalizeAndVerifyField(field)).toThrow();
});

/* ----------------------------------------------------------------------- */

test("convert fields to package: no fields missing", () => {
  const fields = ["Package: foo", "Description: bar", "Depends: pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", dependencies: [["pre_foo"]]}
  );
});

test("convert fields to package: weird capitalization in field names", () => {
  const fields = ["package: foo", "deSCription: bar", "DEPENDS: pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", dependencies: [["pre_foo"]]}
  );
});

test("convert fields to package: package field missing", () => {
  const fields = ["Description: bar", "Depends: pre_foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: description field missing", () => {
  const fields = ["Package: foo", "Depends: pre_foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: depends field missing", () => {
  const fields = ["Package: foo", "Description: bar"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: repeated field name", () => {
  const fields = ["Package: foo", "Description: bar, Description: bar2", "Depends: pre_foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: package name contains whitespace", () => {
  const fields = ["Package: fo o", "Description: bar", "Depends: pre_foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: dependency name contains whitespace", () => {
  const fields = ["Package: foo", "Description: bar", "Depends: pre foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: 2 dependencies", () => {
  const fields = ["Package: foo", "Description: bar", "Depends: pre_foo, pre_pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", dependencies: [["pre_foo"], ["pre_pre_foo"]]}
  );
});

test("convert fields to package: optional dependency", () => {
  const fields = ["Package: foo", "Description: bar", "Depends: pre_foo | pre_foo2"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", dependencies: [["pre_foo", "pre_foo2"]]}
  );
});

test("convert fields to package: mixed dependencies", () => {
  const fields = ["Package: foo", "Description: bar", "Depends: pre_foo | pre_foo2, pre_pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {
      package: "foo",
      description: "bar",
      dependencies: [["pre_foo", "pre_foo2"], ["pre_pre_foo"]]}
  );
});