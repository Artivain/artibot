// Manifest file for giveaways module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "2.1.1",
		name: "Giveaways",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "giveaways",
				type: "slashcommand",
				path: "giveaways.js"
			}
		]
	}
};