import { ButtonInteraction } from "discord.js";

/** Simple button to delete the message it is attached to */
export default async function execute(interaction: ButtonInteraction): Promise<void> {
	await interaction.message.delete();
}