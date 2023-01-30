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

	const { log } = artibot;

	for (const [, module] of artibot.modules) {
		for (const part of module.parts) {
			if (part.type != "trigger") continue;
			for (const trigger of part.triggers) {
				if (typeof trigger == "string" && message.content.includes(trigger) || typeof trigger == "object" && trigger.test(message.content)) {
					(async () => {
						try {
							await part.execute(message, trigger, artibot);
						} catch (e) {
							if (artibot.config.debug) log("TriggerHandler", e, "debug", true);
						}
					})();
				}
			}
		}
	}
}
