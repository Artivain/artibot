// Manifest file for whois module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "1.3.0",
		name: "WHOIS",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "whois",
				type: "slashcommand",
				path: "whois.js"
			}
		]
	}
};