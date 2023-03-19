import { Message } from "discord.js";
import Artibot from "../index.js";

/** Send the message when mentionned */
export default async function execute(message: Message, artibot: Artibot): Promise<void> {
	const { localizer, config } = artibot;
	await message.channel.send(
		localizer.__("Hello [[0]]! My prefix is `[[1]]`, you can get help with the `[[1]]help` command.", { placeholders: [message.author.toString(), config.prefix] })
	);
}