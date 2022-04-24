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
	artibot.modules.forEach(module => {
		module.parts.forEach(part => {
			if (part.init && typeof part.init == "function") part.init(artibot);
		});
	});
}