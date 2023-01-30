import { ButtonInteraction } from "discord.js";
import Artibot from "../index.js";

/**
 * Send button error message
 * @param {ButtonInteraction} interaction 
 * @param {Artibot} artibot 
 * @returns {Promise<void>}
 */
export default function execute(interaction, { localizer }) {
	return interaction.reply({
		content: localizer._("There was an error with this button!"),
		ephemeral: true,
	});
}
