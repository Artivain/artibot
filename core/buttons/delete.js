import { ButtonInteraction } from "discord.js";

/**
 * Simple button to delete the message it is attached to
 * @param {ButtonInteraction} interaction 
 */
export default function execute(interaction) {
	interaction.message.delete();
}