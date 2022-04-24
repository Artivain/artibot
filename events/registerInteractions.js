import { Client } from "discord.js";
import Artibot from "../index.js";
import InteractionManager from "../interactionManager.js";

export const name = "ready";

/**
 * Register interactions into Discord API
 * @param {Client} client 
 * @param {Artibot} artibot 
 */
export async function execute(client, artibot) {
	artibot.interactionManager = new InteractionManager({
		token: client.token,
		artibot
	});

	artibot.interactionManager.generateData(artibot.modules);
	await artibot.interactionManager.register();
}