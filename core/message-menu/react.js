import { MessageContextMenuCommandInteraction, PermissionsBitField } from "discord.js";

/**
 * Add reaction to message
 * @param {MessageContextMenuCommandInteraction} interaction 
 */
export default async function execute(interaction, { localizer }) {
	if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({
		content: localizer._("You do not have the permission to execute this command!"),
		ephemeral: true
	});

	await interaction.targetMessage.react("✅");

	await interaction.reply({
		content: localizer._("Reaction added"),
		ephemeral: true
	});
}
