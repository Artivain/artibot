/* 
 * Module ReactionRoles pour Artibot
 * Par GoudronViande24 (https://github.com/GoudronViande24)
 * Basé sur le module Node.js discordjs-reaction-role
*/

module.exports = {
	name: "ReactionRoles",

	async execute(client, config) {
		const ReactionRole = require("discordjs-reaction-role").default;
		config.rr = require("./config.json");

		new ReactionRole(client, config.rr);
	}
}