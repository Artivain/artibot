const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { prefix } = require("../../../config.json");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription(
			"Donne une liste des commandes ou de l'information sur une commande spécifique."
		),

	async execute(interaction, config) {

		const commands = interaction.client.slashCommands;

		const helpEmbed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTitle("Liste de toutes les commandes slash")
			.setTimestamp()
			.setFooter(config.botName, config.botIcon)
			.setDescription(
				"`" + commands.map((command) => command.data.name).join("`, `") + "`\n\nTu peux aussi avoir la liste des commandes normales avec `" + prefix + "help`."
			);

		// Replies to the interaction!

		await interaction.reply({
			embeds: [helpEmbed],
		});
	},
};
