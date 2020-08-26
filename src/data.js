import $ from 'jquery';

import mockFile from './status.real';
import parseFile from './parser'

// TODO: do not show alert upon error here. App.js takes care of UI stuff
// TODO: polish error handling when the input file is wrong (check production mode)

async function getMockData() {
	try {
		const result = await $.ajax({ url: mockFile });
		return processFile(result);
	}
	catch (error) {
		alert(`${error.status}: ${error.statusText}`);
		return new Map();
	}
}

async function getFileData(file) {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (event) => resolve(processFile(event.target.result));
		reader.onerror = () => {
			alert("Error reading file data.");
			resolve(new Map());
		};
		reader.readAsText(file);
	});
}

function processFile(fileContent) {
	const packages = parseFile(fileContent);
	const packagesWithRevDeps = computeReverseDependencies(packages);
	const packagesWithRevDepsAndDepObjs = generateDependencyObjects(packagesWithRevDeps);
	return packagesWithRevDepsAndDepObjs;
}

function computeReverseDependencies(packages) {
	for (let [packageName, packageData] of packages) {
		for (const depAlts of packageData.dependencies) {
			for (const depName of depAlts) {
				if (packages.has(depName)) {
					let depData = packages.get(depName);
					if (!depData.reverseDependencies) {
						depData.reverseDependencies = [];
					}
					depData.reverseDependencies.push([packageName]);
					packages.set(depName, depData);
				}
			}
		}
	}
	return packages;
}

function generateDependencyObjects(packages) {
	for (let [packageName, packageData] of packages) {
		const depObjs = packageData.dependencies.map((depAlts) => depAlts.map(
			(dep) => ({ name: dep, listed: packages.has(dep) })
		));
		packageData.dependencies = depObjs;
		if (packageData.reverseDependencies) {
			const revDepObjs = packageData.reverseDependencies.map((revDepAlts) => revDepAlts.map(
				(revDep) => ({ name: revDep, listed: true })
			));
			packageData.reverseDependencies = revDepObjs;
		} else {
			packageData.reverseDependencies = [];
		}
		packages.set(packageName, packageData);
	}
	return packages;
}

export {
	getMockData,
	getFileData
};
