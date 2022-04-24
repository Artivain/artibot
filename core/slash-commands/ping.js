import { CommandInteraction } from "discord.js";
import Artibot from "../../index.js";

/**
 * Ping slash command
 * @param {CommandInteraction} interaction 
 * @param {Artibot} artibot 
 */
export default async function execute(interaction, { config, localizer, createEmbed }) {
	if (config.advancedCorePing) {
		var embed = createEmbed()
			.setTitle("Ping")
			.setDescription(
				localizer.__("Pong!\n\nThe bot's latency is [[0]]ms.\nThe API's latency is [[1]]ms.", {
					placeholders: [
						Math.abs(Date.now() - interaction.createdTimestamp),
						Math.round(interaction.client.ws.ping)
					]
				})
			);
	} else {
		var embed = createEmbed()
			.setTitle("Ping")
			.setDescription(`Pong!`);
	}

	await interaction.reply({
		embeds: [embed],
		ephemeral: true
	});
}
