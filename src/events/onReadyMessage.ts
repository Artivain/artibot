import { Client } from "discord.js";
import Artibot from "../index.js";
import log from "../logger";

export const name = "ready";
export const once = true;

/** Send ready message*/
export function execute(client: Client<true>, artibot: Artibot): void {
	const { localizer } = artibot;
	log("Artibot", localizer.__("Ready! Connected as [[0]].", { placeholders: [client.user.tag] }), "info", true);
}