import { SelectMenuInteraction } from "discord.js";
import Artibot from "../index.js";
import selectMenuError from "../messages/selectMenuError.js";

export const name = "interactionCreate";

/**
 * 
 * @param {SelectMenuInteraction} interaction 
 * @param {Artibot} artibot
 */
export async function execute(interaction, artibot) {
	// Checks if the interaction is a select menu interaction
	if (!interaction.isSelectMenu()) return;

	const { client } = interaction;
	const { log, localizer, modules } = artibot;

	let command;

	for (const module of modules) {
		if (command) break;
		for (const part of module.parts) {
			if (command) break;
			if (part.type == "selectmenu" && part.id == interaction.customId) command = part;
		}
	}

	// If the interaction is not a registered dropdown, return error message.
	if (!command) return selectMenuError(interaction, artibot);

	// A try to execute the interaction.
	try {
		await command.execute(interaction, artibot);
	} catch (err) {
		log("SelectMenuHandler", err, "warn", true);
		interaction.reply({
			content: localizer._("An error occured while executing this menu option."),
			ephemeral: true
		});
	}
}
