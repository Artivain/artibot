import { EmbedBuilder, Message } from "discord.js";
import Artibot from "../../index.js";

/** Ping command */
export default async function execute(message: Message, args: string[], { config, createEmbed, localizer }: Artibot): Promise<void> {
	const embed: EmbedBuilder = createEmbed()
		.setTitle("Ping");

	if (config.advancedCorePing) {
		embed.setDescription(
			localizer.__("Pong!\n\nThe bot's latency is [[0]]ms.\nThe API's latency is [[1]]ms.", {
				placeholders: [
					Math.abs(Date.now() - message.createdTimestamp).toString(),
					Math.round(message.client.ws.ping).toString()
				]
			})
		);
	} else {
		embed.setDescription(`Pong!`);
	}

	await message.channel.send({ embeds: [embed] });
}