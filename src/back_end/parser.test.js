/* 
  written according to:
  https://www.debian.org/doc/debian-policy/ch-controlfields.html#syntax-of-control-files 
*/

import {
	splitIntoParagraphs,
  splitIntoFields,
  parseField,
  parseDependencies,
  verifyStructure
} from './parser';

/* ----------------------------------------------------------------------- */

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
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Package: foo\nDescription: bar";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Package: foo", "Description: bar"]);
});

test("split into fields: multi-line fields", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Package: foo\nDescription: bar\n .\n bar";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Package: foo", "Description: bar\n .\n bar"]);
});

test("split into fields: ignore #", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Package: foo\n#Description: bar";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Package: foo"]);
});

test("split into fields: ignore -", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Package: foo\n-Description: bar";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Package: foo"]);
});

test("split into fields: empty paragraph", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "";
  expect(() => splitIntoFields(paragraph, relevantFieldNames)).toThrow();
});

test("split into fields: paragraph with no fields (colon missing)", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Hello\nworld!";
  expect(() => splitIntoFields(paragraph, relevantFieldNames)).toThrow();
});

test("split into fields: ignore colons in values", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Description: foo\n bar:";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Description: foo\n bar:"]);
});

test("split into fields: 2 extra fields", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Package: foo\nScore: 500\nFeelings: mixed";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Package: foo"]);
});

test("split into fields: weird case", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Package: foo\ndesCRiption: bar\nDEPENDS: pre_foo";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Package: foo", "desCRiption: bar", "DEPENDS: pre_foo"]);
});

test("split into fields: handle colons in values", () => {
  const relevantFieldNames = ['package', 'description', 'depends'];
  const paragraph = "Description: :bar";
  const fields = splitIntoFields(paragraph, relevantFieldNames);
  expect(fields).toEqual(["Description: :bar"]);
});

/* ----------------------------------------------------------------------- */

test("parse field: normal package field", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "package: foo";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.package).toEqual("foo");
});

test("parse field: normal description field", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "description: foo";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.description).toEqual(["foo"]);
});

test("parse field: normal dependens field", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "depends: foo";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.depends).toEqual([["foo"]]);
});

test("parse field: weird case", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "PaCKage: foo";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.package).toEqual("foo");
});

test("parse field: alternate dependencies", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "depends: foo | foo2";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.depends[0]).toContain("foo");
  expect(parsedField.depends[0]).toContain("foo2");
});

test("parse field: mixed dependencies", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "depends: bar, foo | foo2";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.depends[0]).toEqual(["bar"])
  expect(parsedField.depends[1]).toContain("foo");
  expect(parsedField.depends[1]).toContain("foo2");
});

test("parse field: multiline description field", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "description: foo\n bar";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.description).toEqual(["foo", " bar"]);
});

test("parse field: multiline description field - blank line", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "description: foo\n .\n bar";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.description).toEqual(["foo", " .", " bar"]);
});

test("parse field: multiline description field - comment", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "description: foo\n#comment\n bar";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.description).toEqual(["foo", " bar"]);
});

test("parse field: multiline description field - comment after whitespace", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "description: foo\n  #comment\n bar";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.description).toEqual(["foo", " bar"]);
});

test("parse field: value field - comment in the middle", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "description: foo#bar";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.description).toEqual(["foo"]);
});

test("parse field: ignore colons in values", () => {
  const depFieldName = "depends";
  const packFieldName = "package";
  const field = "package: :foo";
  const parsedField = parseField(field, depFieldName, packFieldName);
  expect(parsedField.package).toEqual(":foo");
});

/* ----------------------------------------------------------------------- */

test("parse dependencies: simple dependency", () => {
  const depString = "foo";
  const deps = parseDependencies(depString);
  expect(deps).toEqual([["foo"]]);
});

test("parse dependencies: alternate dependencies", () => {
  const depString = "foo | bar";
  const deps = parseDependencies(depString);
  expect(deps[0]).toContain("foo");
  expect(deps[0]).toContain("bar");
});

test("parse dependencies: mixed dependencies", () => {
  const depString = "foo, foo2 | bar";
  const deps = parseDependencies(depString);
  expect(deps[0]).toEqual(["foo"]);
  expect(deps[1]).toContain("foo2");
  expect(deps[1]).toContain("bar");
});

test("parse dependencies: keep space in dependency name", () => {
  const depString = "foo bar";
  const deps = parseDependencies(depString);
  expect(deps).toEqual([["foo bar"]]);
});

test("parse dependencies: strip version numbers", () => {
  const depString = "foo, bar (>=0.0.5)";
  const deps = parseDependencies(depString);
  expect(deps[0]).toContain("foo");
  expect(deps[1]).toContain("bar");
});

test("parse dependencies: remove duplicate dependencies", () => {
  const depString = "foo, foo";
  const deps = parseDependencies(depString);
  expect(deps).toEqual([["foo"]]);
});

test("parse dependencies: remove duplicate dependencies with versions", () => {
  const depString = "foo, foo (>=0.0.5)";
  const deps = parseDependencies(depString);
  expect(deps).toEqual([["foo"]]);
});

test("parse dependencies: remove duplicate alternate dependencies", () => {
  const depString = "foo, bar | bar";
  const deps = parseDependencies(depString);
  expect(deps).toEqual([["foo"], ["bar"]]);
});

test("parse dependencies: remove duplicate dependency groups", () => {
  const depString = "foo, bar1 | bar2, bar1 | bar2";
  const deps = parseDependencies(depString);
  expect(deps[0]).toEqual(["foo"]);
  expect(deps[1]).toContain("bar1");
  expect(deps[1]).toContain("bar2");
  expect(deps.length).toEqual(2);
  expect(deps[1].length).toEqual(2);
});

test("parse dependencies: remove all duplicates", () => {
  const depString = "foo, bar | bar, bar | bar";
  const deps = parseDependencies(depString);
  expect(deps).toEqual([["foo"], ["bar"]]);
});

/* ----------------------------------------------------------------------- */

test("verify structure: everything ok", () => {
  const packFieldName = "package";
  const fieldCount = 3;
  const fields = [{package: "foo"}, {description: "bar"}, {depends: "pre_foo"}];
  expect(verifyStructure(fields, packFieldName, fieldCount)).toEqual(fields);
});

test("verify structure: depends field missing", () => {
  const packFieldName = "package";
  const fieldCount = 3;
  const fields = [{package: "foo"}, {description: "bar"}];
  expect(verifyStructure(fields, packFieldName, fieldCount)).toEqual(fields);
});

test("verify structure: package field missing", () => {
  const packFieldName = "package";
  const fieldCount = 3;
  const fields = [{description: "bar"}, {depends: "pre_foo"}];
  expect(() => verifyStructure(fields, packFieldName, fieldCount)).toThrow();
});

test("verify structure: description field missing", () => {
  const packFieldName = "package";
  const fieldCount = 3;
  const fields = [{package: "foo"}, {depends: "pre_foo"}];
  expect(verifyStructure(fields, packFieldName, fieldCount)).toEqual(fields);
});

test("verify structure: too many fields", () => {
  const packFieldName = "package";
  const fieldCount = 3;
  const fields = [
    {package: "foo"}, {description: "bar"}, {depends: "pre_foo"}, {depends2: "pre_pre_foo"}
  ];
  expect(() => verifyStructure(fields, packFieldName, fieldCount)).toThrow();
});

test("verify structure: duplicate field names", () => {
  const packFieldName = "package";
  const fieldCount = 3;
  const fields = [{package: "foo"}, {description: "bar"}, {description: "bar2"}];
  expect(() => verifyStructure(fields, packFieldName, fieldCount)).toThrow();
});

/* ----------------------------------------------------------------------- */