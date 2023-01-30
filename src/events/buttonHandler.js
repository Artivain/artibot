import Artibot, { Button } from "../index.js";
import { ButtonInteraction } from "discord.js";
import buttonErrorMessage from "../messages/defaultButtonError.js";

export const name = "interactionCreate";

/**
 * Event listener for button interactions
 * @param {ButtonInteraction} interaction 
 * @param {Artibot} artibot 
 */
export async function execute(interaction, artibot) {
	const { modules, log } = artibot;
	// Checks if the interaction is a button interaction
	if (!interaction.isButton()) return;

	/** @type {Button} */
	let button;

	for (const [, module] of modules) {
		if (button) break;
		for (const part of module.parts) {
			if (button) break;
			if (part.type == "button" && (part.id == interaction.customId || interaction.customId.startsWith(part.id.split("*")[0]))) {
				button = part;
			}
		}
	}

	// If the interaction is not a registered button, return error message.
	if (!button) return await buttonErrorMessage(interaction, artibot);

	// A try to execute the button.
	try {
		await button.execute(interaction, artibot);
	} catch (err) {
		log("ButtonHandler", err, "warn", true);
		interaction.reply({
			content: localizer._("An error occured when executing this button..."),
			ephemeral: true,
		});
	}
}
