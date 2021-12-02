/**
 * @file Simple commande de ping
 * @author Artivain
 * @since 1.1.0
 */

const { MessageEmbed } = require("discord.js");
const { params } = require("../../config.json");

module.exports = {
	name: "ping",

	/** You need to uncomment below properties if you need them. */
	description: 'Vérifie si le bot est en vie.',
	aliases: ["latence", "latency"],
	cooldown: 3,

	/**
	 * @description Executes when the command is called by command handler.
	 * @author Artivain
	 * @param {Object} message The Message Object of the command.
	 * @param {String[]} args The Message Content of the received message seperated by spaces (' ') in an array, this excludes prefix and command/alias itself.
	 */

	execute(message, args) {
		if (params.advancedCorePing) {
			var embed = new MessageEmbed()
				.setColor(params.embedColor)
				.setTitle("Ping")
				.setFooter(params.botName, params.botIcon)
				.setTimestamp()
				.setDescription(
					`Pong!\n\nLa latence du bot est de ${Date.now() - message.createdTimestamp}ms.\nLa latence de l'API est de ${Math.round(message.client.ws.ping)}ms.`
				);
		} else {
			var embed = new MessageEmbed()
				.setColor(params.embedColor)
				.setTitle("Ping")
				.setFooter(params.botName, params.botIcon)
				.setTimestamp()
				.setDescription(
					`Pong!`
				);
		};

		message.channel.send({ embeds: [embed] });
	},
};