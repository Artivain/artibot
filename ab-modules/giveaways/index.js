// Manifest file for giveaways module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "2.1.0",
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