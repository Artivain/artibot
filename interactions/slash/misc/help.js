/**
 * @file Sample help command with slash command.
 * @author Naman Vrati
 * @since 3.0.0
 */

// Deconstructed the constants we need in this file.

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

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
	 * @author Naman Vrati
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
			.setColor(0x4286f4)
			.setTitle("Liste de toutes les commandes slash")
			.setDescription(
				"`" + commands.map((command) => command.data.name).join("`, `") + "`"
			);

		// Replies to the interaction!

		await interaction.reply({
			embeds: [helpEmbed],
		});
	},
};
