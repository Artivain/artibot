import { Client } from "discord.js";
import Artibot from "../index.js";
import log from "../logger";

export const name = "ready";
export const once = true;

/** Make sure the bot has the good name on startup */
export function execute(client: Client<true>, artibot: Artibot): void {
	const { localizer, config } = artibot;
	if (client.user.username != config.botName) {
		client.user.setUsername(config.botName)
			.then(() =>
				log("Artibot", localizer.__("Bot name updated to [[0]].", { placeholders: [config.botName] }), "info", true)
			)
			.catch(() =>
				log("Artibot", localizer._("An error occured when trying to change the bot name. Try again later."), "warn", true)
			);
	}
}