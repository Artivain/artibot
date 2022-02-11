// Manifest file for crypto module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "1.0.1",
		name: "Crypto",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "crypto",
				type: "slashcommand",
				path: "crypto.js"
			}
		]
	}
};