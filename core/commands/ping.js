import { Message } from "discord.js";
import Artibot from "../../index.js";

/**
 * Ping command
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Artibot} artibot
 */
export default function execute(message, args, { config, createEmbed, localizer }) {
	if (config.advancedCorePing) {
		var embed = createEmbed()
			.setTitle("Ping")
			.setDescription(
				localizer.__("Pong!\n\nThe bot's latency is [[0]]ms.\nThe API's latency is [[1]]ms.", {
					placeholders: [
						message.createdTimestamp - Date.now(),
						Math.round(message.client.ws.ping)
					]
				})
			);
	} else {
		var embed = createEmbed()
			.setTitle("Ping")
			.setDescription(`Pong!`);
	};

	message.channel.send({ embeds: [embed] });
}