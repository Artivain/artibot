// Manifest file for meme module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "1.2.0",
		name: "Meme",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "69",
				type: "trigger",
				path: "69.js"
			},

			{
				id: "sus",
				type: "trigger",
				path: "sus.js"
			},

			{
				id: "chucknorris",
				type: "command",
				path: "chucknorris.js"
			},

			{
				id: "dadjoke",
				type: "command",
				path: "dadjoke.js"
			}
		]
	}
};