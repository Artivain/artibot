// Manifest file for moderation module

module.exports = {
	manifest: {

		manifestVersion: 1,
		moduleVersion: "1.2.0",
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
			},

			{
				id: "purge",
				type: "slashcommand",
				path: "purge.js"
			},

			{
				id: "purge-*",
				type: "button",
				path: "purgebutton.js"
			}
		]
	}
};