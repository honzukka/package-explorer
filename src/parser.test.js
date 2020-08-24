/* 
written according to:
https://www.debian.org/doc/debian-policy/ch-controlfields.html#syntax-of-control-files 
*/

import {
	splitIntoParagraphs,
	splitIntoFields,
	filterFields,
  normalizeField,
  convertFieldsToPackage,
  insertPackagesIntoMap
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

test("split into fields: empty paragraph", () => {
  const paragraph = "";
  expect(() => splitIntoFields(paragraph)).toThrow();
});

test("split into fields: paragraph with no fields (colon missing)", () => {
  const paragraph = "Hello\nworld!";
  expect(() => splitIntoFields(paragraph)).toThrow();
});

test("split into fields: ignore colons in values", () => {
  const paragraph = "Description: foo\n bar:";
  const fields = splitIntoFields(paragraph);
  expect(fields).toEqual(["Description: foo\n bar:"]);
});

/* ----------------------------------------------------------------------- */

test("filter fields: nothing to be filtered out", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const fields = ["Package: foo", "Description: bar", "Depends: pre_foo"];
  const filteredFields = filterFields(fields, relevantFieldNames);
  expect(filteredFields).toEqual(["Package: foo", "Description: bar", "Depends: pre_foo"]);
});

test("filter fields: 2 extra fields", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const fields = ["Package: foo", "Weight: 500", "Feelings: mixed"];
  const filteredFields = filterFields(fields, relevantFieldNames);
  expect(filteredFields).toEqual(["Package: foo"]);
});

test("filter fields: weird capitalization in field names", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const fields = ["package: foo", "deSCription: bar", "DEPENDS: pre_foo"];
  const filteredFields = filterFields(fields, relevantFieldNames);
  expect(filteredFields).toEqual(["package: foo", "deSCription: bar", "DEPENDS: pre_foo"]);
});

test("filter fields: all extra fields", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const fields = ["Weight: 500", "Feelings: mixed"];
  const filteredFields = filterFields(fields, relevantFieldNames);
  expect(filteredFields).toEqual([]);
});

test("filter fields: ignore field with no value", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const fields = ["Package: foo", "Description: "];
  const filteredFields = filterFields(fields, relevantFieldNames);
  expect(filteredFields).toEqual(["Package: foo"]);
});

test("filter fields: ignore colons in values", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const fields = ["Description: :bar"];
  const filteredFields = filterFields(fields, relevantFieldNames);
  expect(filteredFields).toEqual(["Description: :bar"])
});

/* ----------------------------------------------------------------------- */

test("normalize and verify field: correct, single-line", () => {
  const field = "Package: foo";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("package:foo");
});

test("normalize and verify field: correct, single-line, weird capitalization", () => {
  const field = "DeSCription: bar";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:bar");
});

test("normalize and verify field: remove spaces between dependencies", () => {
  const field = "depends: foo, bar | bar2";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("depends:foo,bar|bar2");
});

test("normalize and verify field: keep spaces inside dependency names", () => {
  const field = "depends: foo, bar bar2";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("depends:foo,bar bar2");
});

test("normalize and verify field: strip dependency version numbers", () => {
  const field = "depends: foo, bar (>=0.0.5)";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("depends:foo,bar");
});

test("normalize and verify field: correct, multi-line", () => {
  const field = "description: foo\n bar";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo\nbar");
});

test("normalize and verify field: correct, multi-line - blank line", () => {
  const field = "description: foo\n .\n bar";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo\n\nbar");
});

test("normalize and verify field: correct, multi-line - with a comment", () => {
  const field = "description: foo\n#comment\n bar";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo\nbar");
});

test("normalize and verify field: correct, single-line - extra whitespace", () => {
  const field = "package: \tfoo  \t";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("package:foo");
});

test("normalize and verify field: correct, multi-line - extra new line", () => {
  const field = "description: foo\n";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo");
});

test("normalize and verify field: wrong, multi-line - missing space on a continuation line", () => {
  const field = "Description: foo\nbar";
  expect(() => normalizeField(field)).toThrow();
});

test("normalize and verify field: weird capitalization in the depends field", () => {
  const field = "Depends: bar, foo";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("depends:bar,foo");
});

test("normalize and verify field: multiple blank lines", () => {
  const field = "description: foo\n .\n bar\n .\n bar";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo\n\nbar\n\nbar");
});

test("normalize and verify field: do not remove all the dots", () => {
  const field = "description: foo. bar bar.\n .\n bar";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo. bar bar.\n\nbar");
});

test("normalize and verify field: trim only 1 space/tab from continuation lines", () => {
  const field = "description: foo\n  * bar\n  * bar2";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo\n * bar\n * bar2");
});

test("normalize and verify field: ignore colons in values", () => {
  const field = "description: foo:\n  * bar\n  * bar2";
  const normalizedField = normalizeField(field);
  expect(normalizedField).toEqual("description:foo:\n * bar\n * bar2");
});

/* ----------------------------------------------------------------------- */

test("convert fields to package: no fields missing", () => {
  const fields = ["package:foo", "description:bar", "depends:pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", depends: [["pre_foo"]]}
  );
});

test("convert fields to package: package field missing", () => {
  const fields = ["description:bar", "depends:pre_foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: description field missing", () => {
  const fields = ["package:foo", "depends:pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual({package: "foo", description: "", depends: [["pre_foo"]]});
});

test("convert fields to package: depends field missing", () => {
  const fields = ["package:foo", "description:bar"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual({package: "foo", description: "bar", depends: []});
});

test("convert fields to package: repeated field name", () => {
  const fields = ["package:foo", "description:bar", "description:bar2", "depends:pre_foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: package name contains whitespace", () => {
  const fields = ["package:fo o", "description:bar", "depends:pre_foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: dependency name contains whitespace", () => {
  const fields = ["package:foo", "description:bar", "depends:pre foo"];
  expect(() => convertFieldsToPackage(fields)).toThrow();
});

test("convert fields to package: 2 dependencies", () => {
  const fields = ["package:foo", "description:bar", "depends:pre_foo,pre_pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", depends: [["pre_foo"], ["pre_pre_foo"]]}
  );
});

test("convert fields to package: optional dependency", () => {
  const fields = ["package:foo", "description:bar", "depends:pre_foo|pre_foo2"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", depends: [["pre_foo", "pre_foo2"]]}
  );
});

test("convert fields to package: mixed dependencies", () => {
  const fields = ["package:foo", "description:bar", "depends:pre_foo|pre_foo2,pre_pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {
      package: "foo",
      description: "bar",
      depends: [["pre_foo", "pre_foo2"], ["pre_pre_foo"]]}
  );
});

test("convert fields to package: repeated dependency (after stripping version numbers)", () => {
  const fields = ["package:foo", "description:bar", "depends:pre_foo,pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", depends: [["pre_foo"]]}
  );
});

test("convert fields to package: repeated optional dependency (after stripping version numbers)", () => {
  const fields = ["package:foo", "description:bar", "depends:pre_foo|pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar", depends: [["pre_foo"]]}
  );
});

test("convert fields to package: ignore colons in values", () => {
  const fields = ["package:foo", "description:bar: 50", "depends:pre_foo"];
  const packageResult = convertFieldsToPackage(fields);
  expect(packageResult).toEqual(
    {package: "foo", description: "bar: 50", depends: [["pre_foo"]]}
  );
});

/* ----------------------------------------------------------------------- */

test("insert packages into map: all fields available", () => {
  const packages = [
    { package: "foo", description: "lorem ipsum", depends: [["bar"]] },
    { package: "foo2", description: "lorem ipsum2", depends: [["bar2"]] }
  ];
  const packageMap = insertPackagesIntoMap(packages);
  expect(packageMap.get("foo")).toEqual({ description: "lorem ipsum", dependencies: [["bar"]] });
  expect(packageMap.get("foo2")).toEqual({ description: "lorem ipsum2", dependencies: [["bar2"]] });
});

test("insert packages into map: description missing", () => {
  const packages = [
    { package: "foo", depends: [["bar"]] },
    { package: "foo2", depends: [["bar2"]] }
  ];
  const packageMap = insertPackagesIntoMap(packages);
  expect(packageMap.get("foo")).toEqual({ dependencies: [["bar"]] });
  expect(packageMap.get("foo2")).toEqual({ dependencies: [["bar2"]] });
});

test("insert packages into map: depends missing", () => {
  const packages = [
    { package: "foo", description: "lorem ipsum" },
    { package: "foo2", description: "lorem ipsum2" }
  ];
  const packageMap = insertPackagesIntoMap(packages);
  expect(packageMap.get("foo")).toEqual({ description: "lorem ipsum" });
  expect(packageMap.get("foo2")).toEqual({ description: "lorem ipsum2" });
});

test("insert packages into map: alphabetical ordering", () => {
  const packages = [
    { package: "cfoo", description: "lorem ipsum2" },
    { package: "afoo2", description: "lorem ipsum" }
  ];
  const packageMap = insertPackagesIntoMap(packages);
  const packageMapValIt = packageMap.values();
  expect(packageMapValIt.next().value).toEqual({ description: "lorem ipsum" });
  expect(packageMapValIt.next().value).toEqual({ description: "lorem ipsum2" });
});