/*
 * Warning!
 * Before editing this file, please read this notice:
 * https://github.com/Artivain/artibot#licence
 * ---
 * Attention!
 * Avant de modifier ce fichier, merci de lire cette notice:
 * https://github.com/Artivain/artibot#licence
*/

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } from "discord.js";
import Artibot from "../../index.js";

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {Artibot} artibot 
 */
export default function execute(interaction, { config, contributors, version, localizer, createEmbed }) {
	var devs = "", donators = "";
	contributors.devs.forEach(dev => {
		if (dev.discordTag) {
			devs += `[${dev.name}](${dev.github}) (${dev.discordTag})\n`;
		} else {
			devs += `[${dev.name}](${dev.github})\n`;
		}
	});
	contributors.donators.forEach(donator => {
		if (donator.discordTag) {
			donators += `[${donator.name}](${donator.github}) (${donator.discordTag})\n`;
		} else {
			donators += `[${donator.name}](${donator.github})\n`;
		}
	});

	if (config.botName == "Artibot" || config.botName == "Artibot [dev]") {
		var description = localizer._("Artibot is a modern and open-source Discord bot maintained by Artivain and it's community.\n") +
			"[GitHub](https://github.com/Artivain/artibot)";
	} else {
		var description = localizer.__("[[0]] is based on Artibot, a modern and open-source Discord bot maintained by Artivain and it's community.\n", { placeholders: [config.botName] }) + "[GitHub](https://github.com/Artivain/artibot)";
	};

	var memberCount = 0;
	interaction.client.guilds.cache.forEach((guild) => {
		memberCount += guild.memberCount;
	});

	let embed = createEmbed()
		.setTitle(localizer.__("About [[0]]", { placeholders: [config.botName] }))
		.setDescription(description)
		.addFields(
			{ name: localizer._("Number of servers"), value: interaction.client.guilds.cache.size + " " + localizer._("servers"), inline: true },
			{ name: localizer._("Number of users"), value: memberCount + " " + localizer._("users"), inline: true },
			{ name: localizer._("Version"), value: version },
			{ name: localizer._("Developers"), value: devs, inline: true },
			{ name: localizer._("Donators"), value: donators, inline: true }
		);

	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setLabel(localizer._("Learn more"))
				.setStyle(ButtonStyle.Link)
				.setURL("https://github.com/Artivain/artibot")
		);

	interaction.reply({
		embeds: [embed],
		components: [row]
	});
}