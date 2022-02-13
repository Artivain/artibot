// Manifest file for clocks module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "3.0.0",
		name: "Clocks",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "clocks",
				type: "global",
				path: "clocks.js"
			}
		]
	}
};