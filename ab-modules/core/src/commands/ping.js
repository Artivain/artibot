const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "ping",
	description: 'Vérifie si le bot est en vie.',
	aliases: ["latence", "latency"],
	cooldown: 3,

	execute(message, args, config) {
		if (config.advancedCorePing) {
			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Ping")
				.setFooter({text: config.botName, iconURL: config.botIcon})
				.setTimestamp()
				.setDescription(
					`Pong!\n\nLa latence du bot est de ${Date.now() - message.createdTimestamp}ms.\nLa latence de l'API est de ${Math.round(message.client.ws.ping)}ms.`
				);
		} else {
			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Ping")
				.setFooter({text: config.botName, iconURL: config.botIcon})
				.setTimestamp()
				.setDescription(
					`Pong!`
				);
		};

		message.channel.send({ embeds: [embed] });
	},
};