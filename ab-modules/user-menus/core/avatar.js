const { MessageEmbed } = require("discord.js");

module.exports = {
	data: {
		name: "Avatar",
		type: 2 // 2 is for user context menus
	},

	async execute(interaction, config) {
		const infos = interaction.options._hoistedOptions[0].member;

		const embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTimestamp()
			.setFooter(config.botName, config.botIcon)
			.setTitle("Avatar")
			.setDescription("Voici la photo de profil de l'utilisateur:")
			.setImage(`https://cdn.discordapp.com/avatars/${infos.user.id}/${infos.user.avatar}.webp?size=512`);

		await interaction.reply({
			embeds: [embed]
		});
		return;
	}
};