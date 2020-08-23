// TODO: on incorrect input...
//    a) do not break, but do not guarantee the shown result
//    b) inform the user that the input is badly formatted

function parseFile(fileContent) {
	const packages = (
		splitIntoParagraphs(fileContent)
		.map((paragraph) => splitIntoFields(paragraph))
    .map((fields) => filterFields(fields))
    .map((fields) => fields.map((field) => normalizeAndVerifyField(field)))
    .map((fields) => convertFieldsToPackage(fields))
  );
  return insertPackagesIntoMap(packages);
}

function splitIntoParagraphs(file) {
}

function splitIntoFields(paragraph) {

}

function filterFields(fields, relevantFields=['Package', 'Depends', 'Description']) {
	
}

function normalizeAndVerifyField(field) {

}

function convertFieldsToPackage(listsOfFields) {

}

function insertPackagesIntoMap(packages) {

}

export default parseFile;
export {
	splitIntoParagraphs,
	splitIntoFields,
	filterFields,
  normalizeAndVerifyField,
  convertFieldsToPackage
};