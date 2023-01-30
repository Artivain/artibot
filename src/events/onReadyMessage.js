import { Client } from "discord.js";
import Artibot from "../index.js";

export const name = "ready";
export const once = true;

/**
 * Send ready message
 * @param {Client} client 
 * @param {Artibot} artibot
 */
export function execute(client, artibot) {
	const { log, localizer } = artibot;
	log("Artibot", localizer.__("Ready! Connected as [[0]].", { placeholders: [client.user.tag] }), "info", true);
}