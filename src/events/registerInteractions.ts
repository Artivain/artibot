import { Client } from "discord.js";
import Artibot from "../index.js";
import InteractionManager from "../interactionManager.js";

export const name = "ready";

/** Register interactions into Discord API */
export async function execute(client: Client<true>, artibot: Artibot): Promise<void> {
	artibot.interactionManager = new InteractionManager({
		token: client.token,
		artibot
	});

	artibot.interactionManager.generateData(artibot.modules);
	await artibot.interactionManager.register();
}