const { MessageEmbed } = require("discord.js");
const { localizer } = require("../../index");

module.exports = {
	name: "ping",
	description: localizer._("Check if the bot is alive."),
	aliases: ["latence", "latency"],
	cooldown: 3,

	execute(message, args, { config }) {
		if (config.advancedCorePing) {
			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Ping")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(
					localizer.__("Pong!\n\nThe bot's latency is [[0]]ms.\nThe API's latency is [[1]]ms.", {
						placeholders: [
							Date.now() - message.createdTimestamp,
							Math.round(message.client.ws.ping)
						]
					})
				);
		} else {
			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Ping")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(`Pong!`);
		};

		message.channel.send({ embeds: [embed] });
	},
};