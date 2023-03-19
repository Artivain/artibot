import { Collection, CommandInteraction, InteractionType } from "discord.js";
import Artibot from "../index.js";
import log from "../logger.js";
import { Module, SlashCommand } from "../modules.js";

export const name = "interactionCreate";

/** Slash command listener*/
export async function execute(interaction: CommandInteraction, artibot: Artibot): Promise<void> {
	const { localizer, modules } = artibot;

	// Checks if the interaction is a command
	if (interaction.type !== InteractionType.ApplicationCommand) return;

	const command: SlashCommand | void = findCommand(interaction.commandName, modules);

	// If the interaction is not a command in cache.
	if (!command) return;

	// A try to executes the interaction.
	try {
		await command.execute(interaction, artibot);
	} catch (err) {
		log("SlashHandler", (err as Error).message, "warn", true);
		try {
			await interaction.reply({
				content: localizer._("An error occured while executing this command."),
				ephemeral: true
			});
		} catch (err) {
			log("SlashHandler", localizer._("Additionally, an error occured when sending the error message to the user. Maybe the interaction already has been replied to."), "warn", true);
		}
	}
}

function findCommand(name: string, modules: Collection<string, Module>): SlashCommand | void {
	for (const [, module] of modules) {
		for (const part of module.parts) {
			if ((part instanceof SlashCommand) && part.data.name == name) return part;
		}
	}
}