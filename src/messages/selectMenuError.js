import { SelectMenuInteraction } from "discord.js";
import Artibot from "../index.js";

/**
 * Error message for select menu interaction
 * @param {SelectMenuInteraction} interaction 
 * @param {Artibot} artibot 
 */
export default function execute(interaction, { localizer }) {
	interaction.reply({
		content: localizer._("There was an error with this menu option!"),
		ephemeral: true,
	});
}
