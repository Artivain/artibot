// Manifest file for moderation module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "1.1.0",
		name: "Moderation",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "mute",
				type: "slashcommand",
				path: "mute.js"
			},

			{
				id: "unmute",
				type: "slashcommand",
				path: "unmute.js"
			}
		]
	}
};