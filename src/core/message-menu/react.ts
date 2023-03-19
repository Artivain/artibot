import { MessageContextMenuCommandInteraction, PermissionsBitField } from "discord.js";
import Artibot from "../..";

/** Add reaction to message */
export default async function execute(interaction: MessageContextMenuCommandInteraction, { localizer }: Artibot): Promise<void> {
	if (interaction.inGuild() && !interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) {
		await interaction.reply({
			content: localizer._("You do not have the permission to execute this command!"),
			ephemeral: true
		});
		return;
	}

	await interaction.targetMessage.react("✅");

	await interaction.reply({
		content: localizer._("Reaction added"),
		ephemeral: true
	});
}
