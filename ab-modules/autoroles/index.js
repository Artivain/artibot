/**
 * Autoroles module for Artibot
 * Partly based on Node.js module discordjs-reaction-role
 * @author GoudronViande24
 */

module.exports = {
	manifest: {
		manifestVersion: 1,
		moduleVersion: "2.0.0",
		name: "Auto roles",
		supportedLocales: ["en", "fr"],
		parts: [
			{
				id: "reactionrole",
				type: "global",
				path: "reactionroles.js"
			},

			{
				id: "autorole-*",
				type: "button",
				path: "rolebutton.js"
			},

			{
				id: "createrolepicker",
				type: "command",
				path: "createrolepicker.js"
			}
		]
	}
};