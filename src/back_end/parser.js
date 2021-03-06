/**
 * Takes a string with file contents and returns
 * a list of lists of relevant package fields:[[{ fieldName: fieldValue }, ...], ...].
 */
function parseFile(fileContent) {
  const relevantFieldNames = ["package", "description", "depends"]
  const [packFieldName, , depFieldName] = relevantFieldNames;
  try {
    return (
      splitIntoParagraphs(fileContent)
      .map((paragraph) => splitIntoFields(paragraph, relevantFieldNames))
      .map((fields) => fields.map((field) => parseField(field, depFieldName, packFieldName)))
      .map((fields) => verifyStructure(fields, packFieldName, relevantFieldNames.length))
    );
  } catch (error) {
    return { e: error };
  }
}

function splitIntoParagraphs(fileContent) {
  const paragraphs = fileContent.split(/\n\s*\n/);
  const nonEmptyParagraphs = paragraphs.filter(paragraph => paragraph.match(/\w/) !== null);
  if (nonEmptyParagraphs.length > 0) {
    return nonEmptyParagraphs;
  } else {
    throw new Error("No paragraphs found in the input file.");
  }
}

function splitIntoFields(paragraph, relevantFieldNames) {
  const fieldNamesPattern = relevantFieldNames.reduce((acc, val) => acc + '|' + val);
  const fieldStartRegex = new RegExp("^(?:" + fieldNamesPattern + "):", "gmi");
  const fieldEndRegex = /(\n\S|\s*$)/g;
  let fields = [];
  let i = 0;
  do {
    const fieldStart = paragraph.slice(i).search(fieldStartRegex);
    if (fieldStart === -1) break;
    const fieldEnd = paragraph.slice(i + fieldStart).search(fieldEndRegex);
    if (fieldEnd === -1) throw new Error("Bad field formatting.");
    fields.push(paragraph.slice(i + fieldStart, i + fieldStart + fieldEnd));
    i += fieldStart + fieldEnd + 1;
  } while (i < paragraph.length);

  if (fields.length > 0) {
    return fields;
  } else {
    throw Error("No control file fields found.");
  }
}

/**
 * Takes a field string, extracts lowercase field name,
 * splits field value into lines and removes comments.
 * For package name field, value is package name,
 * For description field, value is an array of lines.
 * For depends fields, value are parsed dependencies.
 * Returns an object { name: value }.
 */
function parseField(field, depFieldName, packFieldName) {
  const nameEnd = field.search(":");
  const fieldName = field.slice(0, nameEnd).toLowerCase();
  const fieldValue = field.slice(nameEnd + 1).trim();
  const valueLines = fieldValue.split("\n").map((line) => {
    const hashInd = line.search("#");
    if (hashInd === -1) return line;                // remove comments
    else return line.slice(0, hashInd);
  }).filter((line) => line.match(/\S/) !== null);   // filter out lines containing only whitespace

  let result = {};
  if (fieldName === depFieldName)
    result[fieldName] = valueLines.map((line) => parseDependencies(line)).flat(1);
  else if (fieldName === packFieldName)
    result[fieldName] = valueLines[0];
  else
    result[fieldName] = valueLines;
  return result;
}

/**
 * For "foo, bar | bar (>0.3), bar | bar", returns [["foo"], ["bar"]]
 * (i.e. nests alternate dependencies into groups,
 * strips version numbers and removes duplicates
 * on both alternate dependency level and group level).
 */
function parseDependencies(depString) {
  const depGroups = depString.split(",").map((depGroup) => depGroup.trim());
  const deps = depGroups.map((depGroup) => depGroup.split("|").sort().map((dep) => dep.trim()));
  const depsNoVersion = deps.map((depGroup) => depGroup.map((dep) => dep.replace(/\([^(]*\)/g, "").trim()));
  const depsUniqInGroups = depsNoVersion.map((depGroup) => [...new Set(depGroup)].reduce((acc, val) => acc + "|" + val));
  const depsUniqGroups = [...new Set(depsUniqInGroups)].map((depGroup) => depGroup.split("|"));
  return depsUniqGroups;
}

function verifyStructure(fields, packFieldName, fieldCount) {
  const packageFieldNames = fields.map((field) => Object.keys(field)[0]);
  if (!packageFieldNames.includes(packFieldName)) throw Error("Package name field missing.");
  if (packageFieldNames.length > fieldCount) throw Error("Too many fields.");
  if ([...new Set(packageFieldNames)].length !== packageFieldNames.length)
    throw Error("Duplicate field names.");
  return fields;
}

export default parseFile;
export {
	splitIntoParagraphs,
  splitIntoFields,
  parseField,
  parseDependencies,
  verifyStructure
};