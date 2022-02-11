// Manifest file for documentation module

const config = require("./config.json");

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "1.1.0",
		name: "Documentation",
		supportedLocales: "any",
		parts: [
			{
				id: config.commandName,
				type: "slashcommand",
				path: "documentation.js"
			}
		]
	}
};