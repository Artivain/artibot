const { ownerId } = require("../../../config.json");
const slashManager = require("../../../ab-core/slashManager");
const { MessageEmbed } = require('discord.js');

module.exports = {
	id: "registerslashcommands",

	async execute(interaction, config) {
		if (interaction.member.user.id != ownerId) {
			await interaction.reply({
				content: "Vous n'avez pas l'autorisation de faire ceci.",
				ephemeral: true
			});
			return
		};

		await interaction.deferUpdate();
		const waitingEmbed = new MessageEmbed()
			.setColor("YELLOW")
			.setTitle("SlashManager")
			.setFooter({text: config.botName, iconURL: config.botIcon})
			.setTimestamp()
			.setDescription("Initialisation des commandes slash...\nCeci peut prendre du temps.");

		await interaction.editReply({
			embeds: [waitingEmbed],
			components: []
		});
		await interaction.editReply()

		slashManager.generateData(interaction.client);
		let success = await slashManager.register();

		if (success) {
			const embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("SlashManager")
				.setFooter({text: config.botName, iconURL: config.botIcon})
				.setTimestamp()
				.setDescription("Les commandes slash ont bien été initialisées auprès de Discord.");

			await interaction.editReply({
				embeds: [embed]
			});
		} else {
			const embed = new MessageEmbed()
				.setColor("RED")
				.setTitle("SlashManager")
				.setFooter({text: config.botName, iconURL: config.botIcon})
				.setTimestamp()
				.setDescription("Une erreur est survenue avec l'initialisation des commandes slash auprès de Discord.\nConsulter la console pour plus de détails.");

			await interaction.editReply({
				embeds: [embed]
			});
		};

		return
	}
};