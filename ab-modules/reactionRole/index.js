/**
 * Reaction Roles module for Artibot
 * Based on Node.js module discordjs-reaction-role
 * @author GoudronViande24
 */

module.exports = {
	name: "ReactionRoles",

	manifest: {
		manifestVersion: 1,
		moduleVersion: "1.1.0",
		name: "ReactionRoles",
		supportedLocales: "any",
		parts: [
			{
				id: "reactionrole",
				type: "global",
				path: "index.js"
			}
		]
	},

	async execute({ client }) {
		const ReactionRole = require("discordjs-reaction-role").default;
		const config = require("./config.json");

		new ReactionRole(client, config);
	}
};