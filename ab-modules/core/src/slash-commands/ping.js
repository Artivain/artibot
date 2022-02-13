const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { localizer } = require("../../index");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription(localizer._("Check if the bot is alive.")),

	async execute(interaction, { config }) {

		if (config.advancedCorePing) {
			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Ping")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(
					localizer.__("Pong!\n\nThe bot's latency is [[0]]ms.\nThe API's latency is [[1]]ms.", {
						placeholders: [
							Date.now() - interaction.createdTimestamp,
							Math.round(interaction.client.ws.ping)
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

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	},
};
