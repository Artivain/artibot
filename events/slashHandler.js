import { Interaction } from "discord.js";
import Artibot from "../index.js";

export const name = "interactionCreate";

/**
 * Slash command listener
 * @param {Interaction} interaction 
 * @param {Artibot} artibot 
 */
export async function execute(interaction, artibot) {
	const { log, localizer, modules } = artibot;

	// Checks if the interaction is a command
	if (!interaction.isCommand()) return;

	let command;

	for (const module of modules) {
		if (command) break;
		for (const part of module.parts) {
			if (part.type == "slashcommand" && part.data.name == interaction.commandName) {
				command = part;
				break;
			}
		}
	}

	// If the interaction is not a command in cache.
	if (!command) return;

	// A try to executes the interaction.
	try {
		await command.execute(interaction, artibot);
	} catch (err) {
		log("SlashHandler", err, "warn", true);
		await interaction.reply({
			content: localizer._("An error occured while executing this command."),
			ephemeral: true
		});
	};
}
