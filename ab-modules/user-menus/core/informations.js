const { MessageEmbed } = require("discord.js");
const { params } = require("../../../config.json");
const util = require("util");

module.exports = {
	data: {
		name: "Informations",
		type: 2 // 2 is for user context menus
	},

	async execute(interaction, config) {

		const embed = new MessageEmbed()
			.setColor(params.embedColor)
			.setTimestamp()
			.setFooter(config.botName, config.botIcon)
			.setTitle("Informations sur l'utilisateur")
			.setDescription(interaction.options._hoistedOptions[0].member.user.username);

		await interaction.reply({
			embeds: [embed]
		});
		return;
	},
};
