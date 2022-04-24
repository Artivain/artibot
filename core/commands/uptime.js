import { Message } from "discord.js";
import Artibot from "../../index.js";

/**
 * Uptime command
 * @param {Message} message 
 * @param {string[]} args
 * @param {Artibot} artibot
 */
export default function execute(message, args, { createEmbed, localizer }) {
	const uptime = parseInt((Date.now() - message.client.uptime) / 1000);
	message.reply({
		embeds: [
			createEmbed()
				.setTitle("Uptime")
				.setDescription(localizer.__("Online since <t:[[0]]:f> (<t:[[0]]:R>)", { placeholders: [uptime] }))
		]
	})
}