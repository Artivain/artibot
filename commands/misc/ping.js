/**
 * @file Simple commande de ping
 * @author Artivain
 * @since 1.0.0
 */

const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "ping",

	/** You need to uncomment below properties if you need them. */
	description: 'Vérifie si le bot est en vie.',
	aliases: ["latence", "latency"],
	cooldown: 3,
	//usage: 'put usage here',
	//permissions: 'SEND_MESSAGES',
	//guildOnly: true,

	/**
	 * @description Executes when the command is called by command handler.
	 * @author Naman Vrati
	 * @param {Object} message The Message Object of the command.
	 * @param {String[]} args The Message Content of the received message seperated by spaces (' ') in an array, this excludes prefix and command/alias itself.
	 */

	execute(message, args) {
		let embed = new MessageEmbed()
			.setColor(0x4286f4)
			.setTitle("Ping")
			.setDescription(
				`Pong!\nLa latence est de ${Date.now() - message.createdTimestamp}ms.\nLa latence de l'API est de ${Math.round(client.ws.ping)}ms.`
			);

		message.channel.send({ embeds: [embed] });
	},
};