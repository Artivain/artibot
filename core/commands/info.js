/*
 * Warning!
 * Before editing this file, please read this notice:
 * https://github.com/Artivain/artibot#licence
 * ---
 * Attention!
 * Avant de modifier ce fichier, merci de lire cette notice:
 * https://github.com/Artivain/artibot#licence
*/

import { MessageActionRow, MessageButton, Message } from "discord.js";
import Artibot from "../../index.js";

/**
 * 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Artibot} artibot 
 */
export default function execute(message, args, { localizer, contributors, config, createEmbed, version }) {
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

	if (config.botName == "Artibot" || config.botName == "Artibot [DEV]") {
		var description = localizer._("Artibot is a modern and open-source Discord bot maintained by Artivain and it's community.\n") +
			"[GitHub](https://github.com/Artivain/artibot)";
	} else {
		var description = localizer.__("[[0]] is based on Artibot, a modern and open-source Discord bot maintained by Artivain and it's community.\n", { placeholders: [config.botName] }) + "[GitHub](https://github.com/Artivain/artibot)";
	};

	var memberCount = 0;
	message.client.guilds.cache.forEach((guild) => {
		memberCount += guild.memberCount;
	});

	let embed = createEmbed()
		.setTitle(localizer.__("About [[0]]", { placeholders: [config.botName] }))
		.setDescription(description)
		.addField(localizer._("Number of servers"), message.client.guilds.cache.size + " " + localizer._("servers"), true)
		.addField(localizer._("Number of users"), memberCount + " " + localizer._("users"), true)
		.addField(localizer._("Version"), version)
		.addField(localizer._("Developers"), devs, true)
		.addField(localizer._("Donators"), donators, true);

	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setLabel(localizer._("Learn more"))
				.setStyle("LINK")
				.setURL("https://github.com/Artivain/artibot")
		);

	message.channel.send({
		embeds: [embed],
		components: [row]
	});
}