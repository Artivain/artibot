import { Client } from "discord.js";
import Artibot from "../index.js";
import log from "../logger.js";

export const name = "ready";
export const once = true;

/** Modules initializer */
export function execute(client: Client, artibot: Artibot): void {
	artibot.modules.forEach(async (module) => {
		module.parts.forEach(async (part) => {
			if (part.init && typeof part.init == "function") {
				try {
					await part.init(artibot);
				} catch (err) {
					log("Artibot", artibot.localizer.__("An error occured when trying to run initializing script for [[0]]: ", { placeholders: [part.id] }) + err, "warn", true);
				}
			}
		});
	});
}