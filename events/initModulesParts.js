import { Client } from "discord.js";
import Artibot from "../index.js";

export const name = "ready";
export const once = true;

/**
 * Modules initializer
 * @param {Client} client 
 * @param {Artibot} artibot 
 */
export function execute(client, artibot) {
	artibot.modules.forEach(async (module) => {
		module.parts.forEach(async (part) => {
			if (part.init && typeof part.init == "function") {
				try {
					await part.init(artibot);
				} catch (err) {
					artibot.log("Artibot", artibot.localizer.__("An error occured when trying to run initializing script for [[0]]: ", { placeholders: [part.id] }) + err, "warn", true);
				}
			}
		});
	});
}