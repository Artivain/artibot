import { Message } from "discord.js";
import Artibot from "../index.js";

/**
 * Send the message when mentionned
 * @param {Message} message 
 * @param {Artibot} artibot
 */
export default async function execute(message, artibot) {
	const { localizer, config } = artibot;
	return message.channel.send(
		localizer.__("Hello [[0]]! My prefix is `[[1]]`, you can get help with the `[[1]]help` command.", { placeholders: [message.author, config.prefix] })
	);
}