import { ButtonInteraction, MessageEmbed } from 'discord.js';
import Artibot from "../../index.js";

/**
 * 
 * @param {ButtonInteraction} interaction 
 * @param {Artibot} artibot 
 * @returns 
 */
export default async function execute(interaction, { config, modules, localizer, createEmbed, interactionManager: { generateData, register, resetData } }) {
	if (interaction.member.user.id != config.ownerId) {
		return interaction.reply({
			content: localizer._("You do not have the authorization to do this."),
			ephemeral: true
		});
	}

	await interaction.deferUpdate();
	const waitingEmbed = createEmbed()
		.setColor("YELLOW")
		.setTitle("InteractionManager")
		.setDescription(localizer._("Initializing interactions...\nThis can take some time."));

	await interaction.editReply({
		embeds: [waitingEmbed],
		components: []
	});

	resetData();
	generateData(modules);
	let success = await register();

	if (success) {
		const embed = createEmbed()
			.setTitle("InteractionManager")
			.setDescription(localizer._("The interactions have been initialized in Discord API."));

		await interaction.editReply({ embeds: [embed] });
	} else {
		const embed = createEmbed()
			.setColor("RED")
			.setTitle("InteractionManager")
			.setDescription(localizer._("An error occured while initializing interactions in Discord API.\nCheck the console for more details."));

		await interaction.editReply({ embeds: [embed] });
	}
}
