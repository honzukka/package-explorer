class Data {
	constructor() {
		this.packages = new Map();
		this.packages.set(
			"package1",
			{
				description: "This one is the first and always will be.",
				dependencies: [],
				reverseDependencies: [
					{name: "package2", listed: true},
					{name: "package3", listed: true},
				]
			}
		)
		this.packages.set(
			"package2",
			{
				description: "The underdog!",
				dependencies: [
					{name: "package1", listed: true},
					{name: "package3", listed: true},
					{name: "package5", listed: false},
					{name: "package6", listed: false},
					{name: "package4", listed: true},
				],
				reverseDependencies: []
			}
		)
		this.packages.set(
			"package3",
			{
				description: (
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean dictum diam purus, vitae feugiat neque porttitor sit amet. Aenean et placerat sem. Vivamus vel nulla arcu. Quisque non luctus sapien, nec egestas ante. Maecenas ultrices nunc id metus rhoncus sollicitudin. Integer ipsum justo, porttitor sed fringilla sed, congue sed ex. Donec eget lectus tellus. Ut in dolor consequat justo fringilla malesuada ut sit amet quam. Praesent interdum ex erat, non efficitur lorem tempor at. " +
					"Duis hendrerit a felis nec fermentum. In nec justo accumsan, viverra nibh a, blandit justo. Aenean non dolor felis. Donec ac tortor nibh. Vestibulum sed tellus iaculis, lacinia lectus et, dictum velit. Praesent vitae eros purus. Vestibulum molestie faucibus velit. Vestibulum erat leo, molestie vel sodales et, fringilla sit amet leo. " +
					"Cras sollicitudin vitae leo id fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin auctor in metus dapibus dapibus. Nulla pharetra, ante ac semper tincidunt, lectus est ultricies ligula, quis iaculis est odio at lorem. Nam ut dolor ac turpis efficitur viverra. Quisque pharetra blandit nisl, et laoreet nisi pretium id. Ut eu lectus vel odio efficitur tincidunt non varius est. Nulla eget sapien est. In hac habitasse platea dictumst. " +
					"Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc ac aliquam dolor, eu faucibus sem. Fusce varius nisl ut mi tincidunt, aliquam egestas lorem sagittis. Cras lobortis eros vitae ipsum tincidunt imperdiet sit amet in tortor. Vivamus ac odio nec lectus mattis eleifend. Cras eget purus quis justo vehicula molestie. Aenean et est auctor, consequat sapien aliquet, feugiat eros. Praesent vitae elit et massa sagittis facilisis vel ut turpis. Donec consectetur at turpis eget ultrices. " +
					"Nullam sit amet luctus eros, eu consectetur metus. Quisque eu posuere velit, lacinia mollis justo. Suspendisse potenti. Donec erat ante, blandit sit amet placerat sit amet, facilisis elementum tortor. Praesent in massa at elit commodo egestas non vitae nunc. Nunc sapien purus, rutrum vitae egestas nec, porttitor id elit. Pellentesque sollicitudin, nisl in hendrerit tincidunt, lacus dolor fringilla tellus, nec ornare mi dui id ex. "
				),
				dependencies: [
					{name: "package1", listed: true}
				],
				reverseDependencies: [
					{name: "package2", listed: true}
				]
			}
		)
		this.packages.set(
			"package4",
			{
				description: "I'm just here so that the underdog has something to depend on.",
				dependencies: [],
				reverseDependencies: [
					{name: "package2", listed: true}
				]
			}
		)
	}
}

export default Data;
