import $ from 'jquery';

import mockFile from '../status.real';
import parseFile from './parser'

async function getMockData() {
	try {
		const result = await $.ajax({ url: mockFile });
		return processFile(result);
	}
	catch (error) {
		return new Map([["#error", `${error.status}: ${error.statusText}`]]);
	}
}

async function getFileData(file) {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (event) => resolve(processFile(event.target.result));
		reader.onerror = () => {
			resolve(new Map([["#error", "Error reading file data."]]));
		};
		reader.readAsText(file);
	});
}

function processFile(fileContent) {
	const parsedFile = parseFile(fileContent);
	if (parsedFile.e) return new Map([["#error", parsedFile.e]]);
	const packages = structureData(parsedFile);
	const sortedPackages = sortAlphabetically(packages);
	const sortedPackagesWithRevDeps = computeReverseDependencies(sortedPackages);
	return sortedPackagesWithRevDeps;
}

function structureData(parsedFile) {
	let packages = new Map();
	parsedFile.forEach(packageFields => {
		const packageObj = packageFields.reduce((acc, val) => Object.assign(acc, val));
		packages.set(packageObj.package, {
			description: packageObj.description ? packageObj.description : "",
			dependencies: packageObj.depends ? packageObj.depends : [],
			reverseDependencies: []
		})
	});
	Array.from(packages).forEach(([packageName, packageData]) => {
		packageData.dependencies = packageData.dependencies.map((depGroup) =>
			depGroup.map((dep) => ({ name: dep, installed: packages.has(dep) }))
		);
	});
	return packages;
}

function sortAlphabetically(packages) {
	return new Map(Array.from(packages).sort());
}

function computeReverseDependencies(packages) {
	Array.from(packages).forEach(([packageName, packageData]) => {
		packageData.dependencies.forEach((depGroup) => {
			depGroup.forEach((dep) => {
				if (packages.has(dep.name)) {
					let depData = packages.get(dep.name);
					depData.reverseDependencies.push([{ name: packageName, installed: true }]);
					packages.set(dep.name, depData);
				}
			});
		});
	});
	return packages;
}

export {
	getMockData,
	getFileData
};
