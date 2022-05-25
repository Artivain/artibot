import { MessageContextMenuInteraction, Permissions } from "discord.js";

/**
 * Add reaction to message
 * @param {MessageContextMenuInteraction} interaction 
 */
export default async function execute(interaction, { localizer }) {
	if (!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.reply({
		content: localizer._("You do not have the permission to execute this command!"),
		ephemeral: true
	});

	await interaction.targetMessage.react("✅");

	await interaction.reply({
		content: localizer._("Reaction added"),
		ephemeral: true
	});
}
