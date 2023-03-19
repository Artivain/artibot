import { Collection, ContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import Artibot from "../index.js";
import log from "../logger";
import { MessageContextMenuOption, Module, UserContextMenuOption } from "../modules.js";

export const name = "interactionCreate";

/** Context interaction listener */
export async function execute(interaction: ContextMenuCommandInteraction | UserContextMenuCommandInteraction, artibot: Artibot) {
	// Checks if the interaction is a button interaction
	if (!interaction.isContextMenuCommand()) return;

	const { localizer, modules } = artibot;

	// Don't execute interactions in DM channels
	if (!interaction.channel) return interaction.reply({
		content: localizer._("This is disabled in DM channels."),
		ephemeral: true
	});

	if (interaction.isUserContextMenuCommand()) {

		let command: UserContextMenuOption | void = findUserCommand(interaction.commandName, modules);

		if (!command) return;

		// A try to execute the interaction.
		try {
			await command.execute(interaction, artibot);
		} catch (err) {
			log("ContextMenuHandler", (err as Error).message, "warn", true);
			interaction.reply({
				content: localizer._("An error occured when executing this interaction..."),
				ephemeral: true,
			});
		}

	} else if (interaction.isMessageContextMenuCommand()) {

		let command: MessageContextMenuOption | void = findMessageCommand(interaction.commandName, modules);

		if (!command) return;

		// A try to execute the interaction.
		try {
			await command.execute(interaction, artibot);
		} catch (err) {
			log("ContextMenuHandler", (err as Error).message, "warn", true);
			interaction.reply({
				content: localizer._("An error occured when executing this interaction..."),
				ephemeral: true,
			});
		}

	} else { // Almost impossible, but we are still catching the bug.
		log("InteractionManager", localizer._("Something weird happened with the menu. Received an unknown menu type."), "warn", true);
	}
}

function findUserCommand(name: string, modules: Collection<string, Module>): UserContextMenuOption | void {
	for (const [, { parts }] of modules) {
		for (const part of parts) {
			if ((part instanceof UserContextMenuOption) && part.data.name == name) return part;
		}
	}
}

function findMessageCommand(name: string, modules: Collection<string, Module>): MessageContextMenuOption | void {
	for (const [, { parts }] of modules) {
		for (const part of parts) {
			if ((part instanceof MessageContextMenuOption) && part.data.name == name) return part;
		}
	}
}