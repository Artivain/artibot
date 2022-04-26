import { Client } from "discord.js";
import Artibot from "../index.js";

export const name = "ready";
export const once = true;

/**
 * Make sure the bot has the good name on startup
 * @param {Client} client 
 * @param {Artibot} artibot 
 */
export function execute(client, artibot) {
	const { log, localizer, config } = artibot;
	if (client.user.username != config.botName) {
		client.user.setUsername(config.botName)
			.then(log("Artibot", localizer.__("Bot name updated to [[0]].", { placeholders: [config.botName] }), "log", true));
	};
}