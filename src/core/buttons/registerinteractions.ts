import { ButtonInteraction, Embed, EmbedBuilder } from 'discord.js';
import Artibot from "../../index.js";

export default async function execute(interaction: ButtonInteraction, { config, modules, localizer, createEmbed, interactionManager }: Artibot): Promise<void> {
	const { generateData, register, resetData } = interactionManager!;

	if (interaction.user.id != config.ownerId) {
		await interaction.reply({
			content: localizer._("You do not have the authorization to do this."),
			ephemeral: true
		});
		return;
	}

	await interaction.deferUpdate();
	const waitingEmbed: EmbedBuilder = createEmbed()
		.setColor("Yellow")
		.setTitle("InteractionManager")
		.setDescription(localizer._("Initializing interactions...\nThis can take some time."));

	await interaction.editReply({
		embeds: [waitingEmbed],
		components: []
	});

	resetData();
	generateData(modules);
	const success = await register();

	if (success) {
		const embed: EmbedBuilder = createEmbed()
			.setTitle("InteractionManager")
			.setDescription(localizer._("The interactions have been initialized in Discord API."));

		await interaction.editReply({ embeds: [embed] });
	} else {
		const embed: EmbedBuilder = createEmbed()
			.setColor("Red")
			.setTitle("InteractionManager")
			.setDescription(localizer._("An error occured while initializing interactions in Discord API.\nCheck the console for more details."));

		await interaction.editReply({ embeds: [embed] });
	}
}
