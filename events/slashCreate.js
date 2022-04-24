import { Interaction } from "discord.js";
import Artibot from "../index.js";

export const name = "interactionCreate";

/**
 * Slash command listener
 * @param {Interaction} interaction 
 * @param {Artibot} artibot 
 */
export async function execute(interaction, artibot) {
	// Deconstructed client from interaction object.
	const { client } = interaction;
	const { log, localizer } = artibot;

	// Checks if the interaction is a command (to prevent weird bugs)
	if (!interaction.isCommand())
		return;

	const data = client.slashCommands.get(interaction.commandName);

	// If the interaction is not a command in cache.
	if (!data)
		return;

	const { command } = data;

	// A try to executes the interaction.
	try {
		await command.execute(interaction, commons);
	} catch (err) {
		log("SlashManager", err, "warn", true);
		await interaction.reply({
			content: localizer._("An error occured while executing this command."),
			ephemeral: true
		});
	};
}
