// TODO: on incorrect input...
//    a) do not break, but do not guarantee the shown result
//    b) inform the user that the input is badly formatted
// TODO: make error messages more informative (include faulty input)

function parseFile(fileContent, relevantFieldNames=['package', 'description', 'depends']) {
	const packages = (
		splitIntoParagraphs(fileContent)
		.map((paragraph) => splitIntoFields(paragraph))
    .map((fields) => filterFields(fields, relevantFieldNames))
    .map((fields) => fields.map((field) => normalizeField(field)))
    .map((fields) => convertFieldsToPackage(fields, relevantFieldNames))
  );
  return insertPackagesIntoMap(packages);
}

function splitIntoParagraphs(fileContent) {
  const separatorRegex = /\n\s*\n/;
  const paragraphs = fileContent.split(separatorRegex);
  const nonEmptyParagraphs = paragraphs.filter(paragraph => paragraph.match(/\w/) !== null);
  if (nonEmptyParagraphs.length > 0) {
    return nonEmptyParagraphs;
  } else {
    throw new Error("No paragraphs found in the input file.");
  }
}

function splitIntoFields(paragraph) {
  const fieldNameRegex = /^[^ \t]*:/gm;
  const properFieldNameRegex = /^(?![#-])[\u0021-\u0039\u003b-\u007e]+:/m;
  const paragraphAnnotated = ("\n" + paragraph).replace(fieldNameRegex, '\n$&');
  const fields = paragraphAnnotated.split('\n\n');
  const properFields = fields.filter(field => field.match(properFieldNameRegex) !== null);
  if (properFields.length > 0) {
    return properFields;
  } else {
    throw Error("One of the paragraphs has no fields.");
  }
}

function filterFields(fields, relevantFieldNames) {
	return fields.filter(field => {
    const nameEndIndex = field.search(":");
    const fieldName = field.slice(0, nameEndIndex);
    const fieldValue = field.slice(nameEndIndex + 1);
    return (
      relevantFieldNames.includes(fieldName.toLowerCase()) &&
      fieldValue.trim().length > 0
    );
  });
}

function normalizeField(field) {
  const nameEndIndex = field.search(":");
  const fieldName = field.slice(0, nameEndIndex).toLowerCase();
  const fieldValue = field.slice(nameEndIndex + 1);
  let validValueLines = fieldValue.split("\n").filter((line) => line !== "" && line[0] !== "#");
  for (let i = 0; i < validValueLines.length; i++) {
    if (i > 0 && [" ", "\t"].includes(validValueLines[i][0]) === false) {
      throw Error("Continuation line doesn't start with a space or a tab.");
    } else if (i > 0) {
      validValueLines[i] = validValueLines[i].slice(1);
    } else {
      validValueLines[i] = validValueLines[i].trimStart();
    }
    validValueLines[i] = validValueLines[i].trimEnd().replace(/^[ \t]*\.[ \t]*$/g, "");
  }
  if (fieldName === "depends") {
    validValueLines = validValueLines.map((line) => line.replace(/\([^(]*\)/g, "").trim());
    validValueLines = validValueLines.map((line) => line.replace(/ *([,|]) +/g, "$1"));
  }
  return fieldName + ":" + validValueLines.reduce(
    (accumulator, valueLine) => accumulator + "\n" + valueLine
  );
}

function convertFieldsToPackage(fields) {
  let fieldNamesIncluded = [];
  let packageObj = {};
  for (const field of fields) {
    const nameEndIndex = field.search(":");
    const fieldName = field.slice(0, nameEndIndex);
    const fieldValue = field.slice(nameEndIndex + 1);

    if (fieldNamesIncluded.includes(fieldName)) {
      throw Error("Some field names are repeated.");
    }
    fieldNamesIncluded.push(fieldName);

    if (fieldName === "package" || fieldName === "depends") {
      if (fieldValue.includes(" ")) {
        throw Error(
          "Spaces inside package names are not allowed.\n" +
          "package: " + fieldValue
        );
      }
    }

    if (fieldName === "depends") {
      const deps = fieldValue.split(',');
      const depAlts = deps.map((dep) => dep.split("|"));
      packageObj[fieldName] = depAlts;
    } else {
      packageObj[fieldName] = fieldValue;
    }
  }

  if (fieldNamesIncluded.includes("package") === false) {
    throw Error("Package field missing.")
  }
  if (fieldNamesIncluded.includes("depends") === false) {
    packageObj["depends"] = [];
  }
  if (fieldNamesIncluded.includes("description") === false) {
    packageObj["description"] = "";
  }

  return packageObj;
}

function insertPackagesIntoMap(packages) {
  let packagesMap = new Map();
  packages.sort((p1, p2) => {
    if (p1.package < p2.package) {
      return -1;
    } else if (p1.package > p2.package) {
      return 1;
    } else {
      return 0;
    }
  }).map(
    (packageObj) => packagesMap.set(
      packageObj.package,
      {
        description: packageObj.description,
        dependencies: packageObj.depends
      }
    )
  );
  return packagesMap;
}

export default parseFile;
export {
	splitIntoParagraphs,
	splitIntoFields,
	filterFields,
  normalizeField,
  convertFieldsToPackage,
  insertPackagesIntoMap
};