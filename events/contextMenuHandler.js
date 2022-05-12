import { MessageContextMenuInteraction, UserContextMenuInteraction } from "discord.js";
import Artibot from "../index.js";

export const name = "interactionCreate";

/**
 * Context interaction listener
 * @param {MessageContextMenuInteraction|UserContextMenuInteraction} interaction 
 * @param {Artibot} artibot 
 */
export async function execute(interaction, artibot) {
	// Checks if the interaction is a button interaction
	if (!interaction.isContextMenu()) return;

	const { log, localizer, modules } = artibot;

	// Don't execute interactions in DM channels
	if (!interaction.channel) return interaction.reply({
		content: localizer._("This is disabled in DM channels."),
		ephemeral: true
	});

	if (interaction.targetType === "USER") {

		let command;

		for (const [, module] of modules) {
			if (command) break;
			for (const part of module.parts) {
				if (command) break;
				if (part.type == "usermenu" && part.data.name == interaction.commandName) command = part;
			}
		}

		// A try to execute the interaction.
		try {
			await command.execute(interaction, artibot);
		} catch (err) {
			log("ContextMenuHandler", err, "warn", true);
			interaction.reply({
				content: localizer._("An error occured when executing this interaction..."),
				ephemeral: true,
			});
		}

	} else if (interaction.targetType === "MESSAGE") {

		let command;

		for (const [, module] of modules) {
			if (command) break;
			for (const part of module.parts) {
				if (command) break;
				if (part.type == "messagemenu" && part.data.name == interaction.commandName) command = part;
			}
		}

		// A try to execute the interaction.
		try {
			await command.execute(interaction, artibot);
		} catch (err) {
			log("ContextMenuHandler", err, "warn", true);
			interaction.reply({
				content: localizer._("An error occured when executing this interaction..."),
				ephemeral: true,
			});
		}
		
	} else { // Almost impossible, but we are still catching the bug.
		return log("InteractionManager", localizer._("Something weird happened with the menu. Received an unknown menu type."), "warn", true);
	};
}
