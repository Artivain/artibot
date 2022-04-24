const interactionManager = require("../../../../ab-core/interactionManager");
const { MessageEmbed } = require('discord.js');
const { localizer } = require("../../index");

module.exports = {
	id: "registerinteractions",

	async execute(interaction, { config }) {
		if (interaction.member.user.id != config.ownerId) {
			await interaction.reply({
				content: localizer._("You do not have the authorization to do this."),
				ephemeral: true
			});
			return
		};

		await interaction.deferUpdate();
		const waitingEmbed = new MessageEmbed()
			.setColor("YELLOW")
			.setTitle("InteractionManager")
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setTimestamp()
			.setDescription(localizer._("Initializing interactions...\nThis can take some time."));

		await interaction.editReply({
			embeds: [waitingEmbed],
			components: []
		});
		await interaction.editReply()

		interactionManager.generateData(interaction.client);
		let success = await interactionManager.register();

		if (success) {
			const embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("InteractionManager")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer._("The interactions have been initialized in Discord API."));

			await interaction.editReply({ embeds: [embed] });
		} else {
			const embed = new MessageEmbed()
				.setColor("RED")
				.setTitle("InteractionManager")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer._("An error occured while initializing interactions in Discord API.\nCheck the console for more details."));

			await interaction.editReply({ embeds: [embed] });
		};

		return
	}
};