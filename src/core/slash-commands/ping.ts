import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Artibot from "../../index.js";

/** Ping slash command */
export default async function execute(interaction: ChatInputCommandInteraction, { config, localizer, createEmbed }: Artibot): Promise<void> {
	const embed: EmbedBuilder = createEmbed().setTitle("Ping");

	if (config.advancedCorePing) {
		embed.setDescription(
			localizer.__("Pong!\n\nThe bot's latency is [[0]]ms.\nThe API's latency is [[1]]ms.", {
				placeholders: [
					Math.abs(Date.now() - interaction.createdTimestamp).toString(),
					Math.round(interaction.client.ws.ping).toString()
				]
			})
		);
	} else {
		embed.setDescription(`Pong!`);
	}

	await interaction.reply({
		embeds: [embed],
		ephemeral: true
	});
}
