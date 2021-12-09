const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription(
			"Vérifie si le bot est en vie."
		),

	async execute(interaction, config) {

		if (config.advancedCorePing) {
			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Ping")
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription(
					`Pong!\n\nLa latence du bot est de ${Date.now() - interaction.createdTimestamp}ms.\nLa latence de l'API est de ${Math.round(interaction.client.ws.ping)}ms.`
				);
		} else {
			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Ping")
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription(
					`Pong!`
				);
		};

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	},
};
