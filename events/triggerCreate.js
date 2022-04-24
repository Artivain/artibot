import { Message } from "discord.js";
import Artibot from "../index.js";

export const name = "messageCreate";

/**
 * Trigger event listener
 * @param {Message} message 
 * @param {Artibot} artibot
 */
export async function execute(message, artibot) {
	// Ignore bots
	if (message.author.bot) return;

	const { log, localizer } = artibot;

	// Checking ALL triggers using every function and breaking out if a trigger was found.
	let check = false;

	artibot.modules.forEach(async (module) => {
		if (check) return false;
		module.parts.forEach(async (part) => {
			if (check) return false;
			if (part.type != "trigger") return false;

			part.triggers.forEach(async(trigger) => {
				// If validated, it will try to execute the trigger.
				if (message.content.includes(trigger)) {
					try {
						command.execute(message, commons);
					} catch (error) {
						// If checks fail, reply back!
						log("TriggerManager", error, "warn", true);
						message.reply({
							content: localizer._("An error occured while trying to execute a trigger."),
						});
					};

					check = true;
					return false;
				};
			});
		});
	});
}
