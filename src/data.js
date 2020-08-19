class Data {
	constructor() {
		this.packages = new Map();
		this.packages.set(
			"package1",
			{
				description: "This one is the first and always will be.",
				dependencies: [],
				reverseDependencies: ["package2"]
			}
		)
		this.packages.set(
			"package2",
			{
				description: "The underdog!",
				dependencies: ["package1"],
				reverseDependencies: []
			}
		)
	}
}

export default Data;
