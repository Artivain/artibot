/**
 * @file Sample help command with slash command.
 * @author Artivain
 * @since 3.1.0
 */

// Deconstructed the constants we need in this file.

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { prefix, params } = require("../../../config.json");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription(
			"Donne une liste des commandes ou de l'information sur une commande spécifique."
		)
		.addStringOption((option) =>
			option
				.setName("commande")
				.setDescription("Le nom de la commande à obtenir de l'information.")
				.setRequired(false)
		),

	/**
	 * @description Executes when the interaction is called by interaction handler.
	 * @author Artivain
	 * @param {*} interaction The interaction object of the command.
	 */

	async execute(interaction) {
		/**
		 * @type {Object[]}
		 * @description Array of all slash commands objects earlier registered.
		 */

		const commands = interaction.client.slashCommands;

		/**
		 * @type {Object[]}
		 * @description Help command's embed
		 */

		const helpEmbed = new MessageEmbed()
			.setColor(params.embedColor)
			.setTitle("Liste de toutes les commandes slash")
			.setTimestamp()
			.setFooter(params.botName, params.botIcon)
			.setDescription(
				"`" + commands.map((command) => command.data.name).join("`, `") + "`\n\nTu peux aussi avoir la liste des commandes normales avec `" + prefix + "help`."
			);

		// Replies to the interaction!

		await interaction.reply({
			embeds: [helpEmbed],
		});
	},
};
