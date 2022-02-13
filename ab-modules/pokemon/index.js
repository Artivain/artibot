// Manifest file for pokemon module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "1.1.0",
		name: "Pokemon",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "pokedex",
				type: "slashcommand",
				path: "pokedex.js"
			}
		]
	}
};