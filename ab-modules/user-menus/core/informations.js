/**
 * @file Bouton pour obtenir des informations sur un utilisateur.
 * @author Krish Garg
 * @since 3.0.0
 */

const { MessageEmbed } = require("discord.js");
const { params } = require("../../../config.json");

module.exports = {
	data: {
		name: "Informations",
		type: 2 // 2 is for user context menus
	},

	/**
	 * @description Executes when the context option with name "sample" is clicked.
	 * @author Krish Garg
	 * @param {Object} interaction The Interaction Object of the command.
	 */

	async execute(interaction) {

		const embed = new MessageEmbed()
			.setColor(params.embedColor)
			.setTitle("Informations sur l'utilisateur")
			.setDescription(
				"asd"
			);

		await interaction.reply({
			embeds: [embed]
		});
		return;
	},
};
