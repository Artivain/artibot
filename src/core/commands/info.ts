/*
 * Warning!
 * Before editing this file, please read this notice:
 * https://github.com/Artivain/artibot#licence
 * ---
 * Attention!
 * Avant de modifier ce fichier, merci de lire ceci:
 * https://github.com/Artivain/artibot#licence
*/

import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, EmbedBuilder, Message, MessageActionRowComponentBuilder } from "discord.js";
import Artibot from "../../index.js";

export default async function execute(message: Message, args: string[], { localizer, contributors, config, createEmbed, version }: Artibot): Promise<void> {
	let devs: string = "";
	let donators: string = "";
	let description: string;

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

	if (config.botName == "Artibot" || config.botName == "Artibot [DEV]") {
		description = localizer._("Artibot is a modern and open-source Discord bot maintained by Artivain and it's community.\n") +
			"[GitHub](https://github.com/Artivain/artibot)";
	} else {
		description = localizer.__("[[0]] is based on Artibot, a modern and open-source Discord bot maintained by Artivain and it's community.\n", { placeholders: [config.botName] }) + "[GitHub](https://github.com/Artivain/artibot)";
	}

	let memberCount: number = 0;
	for (const [, guild] of message.client.guilds.cache) {
		memberCount += guild.memberCount;
	}

	const embed: EmbedBuilder = createEmbed()
		.setTitle(localizer.__("About [[0]]", { placeholders: [config.botName] }))
		.setDescription(description)
		.addFields(
			{ name: localizer._("Number of servers"), value: message.client.guilds.cache.size + " " + localizer._("servers"), inline: true },
			{ name: localizer._("Number of users"), value: memberCount + " " + localizer._("users"), inline: true },
			{ name: localizer._("Version"), value: version },
			{ name: localizer._("Developers"), value: devs, inline: true },
			{ name: localizer._("Donators"), value: donators, inline: true }
		);

	const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setLabel(localizer._("Learn more"))
				.setStyle(ButtonStyle.Link)
				.setURL("https://github.com/Artivain/artibot")
		);

	await message.channel.send({
		embeds: [embed],
		components: [row]
	});
}