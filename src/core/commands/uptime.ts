import { Message } from "discord.js";
import Artibot from "../../index.js";

/** Uptime command */
export default async function execute(message: Message, args: string[], { createEmbed, localizer }: Artibot): Promise<void> {
	const uptime: string = ((Date.now() - message.client.uptime) / 1000).toFixed(0);
	await message.reply({
		embeds: [
			createEmbed()
				.setTitle("Uptime")
				.setDescription(localizer.__("Online since <t:[[0]]:f> (<t:[[0]]:R>)", { placeholders: [uptime] }))
		]
	})
}