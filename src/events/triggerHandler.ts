import { Message } from "discord.js";
import Artibot from "../index.js";
import log from "../logger";
import { TriggerGroup } from "../modules.js";

export const name = "messageCreate";

/** Trigger event listener */
export async function execute(message: Message, artibot: Artibot): Promise<void> {
	// Ignore bots
	if (message.author.bot) return;

	for (const [, module] of artibot.modules) {
		for (const part of module.parts) {
			if (!(part instanceof TriggerGroup)) continue;
			for (const trigger of part.triggers) {
				if (typeof trigger == "string" && message.content.includes(trigger) || typeof trigger == "object" && trigger.test(message.content)) {
					(async () => {
						try {
							await part.execute(message, trigger, artibot);
						} catch (e) {
							if (artibot.config.debug) log("TriggerHandler", (e as Error).message, "debug", true);
						}
					})();
				}
			}
		}
	}
}