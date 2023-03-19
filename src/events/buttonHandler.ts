import Artibot from "../index";
import { ButtonInteraction, Collection } from "discord.js";
import buttonErrorMessage from "../messages/defaultButtonError.js";
import { Button, Module } from "../modules.js";
import log from "../logger.js";

export const name: string = "interactionCreate";

/** Event listener for button interactions */
export async function execute(interaction: ButtonInteraction, artibot: Artibot): Promise<void> {
	const { modules, localizer } = artibot;
	// Checks if the interaction is a button interaction
	if (!interaction.isButton()) return;

	const button: Button | void = findButton(interaction.customId, modules);

	// If the interaction is not a registered button, return error message.
	if (!button) return await buttonErrorMessage(interaction, artibot);

	// A try to execute the button.
	try {
		await button.execute(interaction, artibot);
	} catch (err) {
		log("ButtonHandler", (err as Error).message, "warn", true);
		if (artibot.config.debug) console.error(err);
		try {
			await interaction.reply({
				content: localizer._("An error occured when executing this button..."),
				ephemeral: true,
			});
		} catch {
			log("ButtonHandler", localizer._("Additionally, an error occured when sending the error message to the user. Maybe the interaction already has been replied to."), "warn", true);
		}
	}
}

function findButton(interactionId: string, modules: Collection<string, Module>): Button | void {
	for (const [, module] of modules) {
		for (const part of module.parts) {
			if ((part instanceof Button) && (part.id == interactionId || interactionId.startsWith(part.id.split("*")[0]))) {
				return part;
			}
		}
	}
}