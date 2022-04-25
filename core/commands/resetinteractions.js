import { Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import Artibot from "../../index.js";

/**
 * 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Artibot} artibot 
 */
export default async function execute(message, args, { config, log, localizer, createEmbed }) {
	const waitingEmbed = createEmbed()
		.setColor("YELLOW")
		.setTitle("InteractionManager")
		.setDescription(localizer._("Deleting saved slash commands from the bot and test server...\nThis can take some time."));

	const response = await message.reply({
		embeds: [waitingEmbed]
	});

	log("InteractionManager", localizer._("Deleting saved slash commands and interactions from the bot and test server..."), "log", true);

	// Fetch test guild
	const testGuild = await message.client.guilds.fetch(config.testGuildId);
	// Remove all commands from test guild
	try {
		await testGuild.commands.set([]);
		log("InteractionManager", localizer._("Slash commands have been deleted from test server."), "log", true);
	} catch (e) {
		const errorEmbed = createEmbed()
			.setColor("RED")
			.setTitle("InteractionManager")
			.setDescription(localizer._("An error occured while deleting slash commands from test server.\nCheck the console for more details."));

		await response.edit({ embeds: [errorEmbed] });
		log("InteractionManager", localizer._("An error occured while deleting slash commands from test server: ") + e, "warn", true);
		return
	}

	// Remove all commands from the client (so in all servers)
	try {
		await message.client.application.commands.set([]);
		log("InteractionManager", localizer._("Slash commands have been deleted from the bot."), "log", true);
	} catch (e) {
		const errorEmbed = new MessageEmbed()
			.setColor("RED")
			.setTitle("InteractionManager")
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setTimestamp()
			.setDescription(localizer._("An error occured while deleting slash commands from the bot.\nCheck the console for more details."));
		await response.edit({ embeds: [errorEmbed] });
		log("InteractionManager", localizer._("An error occured while deleting slash commands from the bot: ") + e, "warn", true);
		return
	}

	const embed = createEmbed()
		.setTitle(localizer._("Purge finished"))
		.setDescription(localizer._("The commands have been deleted from the test server and the bot successfully.\nYou can decide to register them back right now, or later by restarting the bot."));

	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId("registerinteractions")
				.setLabel(localizer._("Now"))
				.setStyle("PRIMARY")
				.setEmoji("✅"),
			new MessageButton()
				.setCustomId("delete")
				.setLabel(localizer._("Later"))
				.setStyle("SECONDARY")
				.setEmoji("⌛")
		);

	response.edit({
		embeds: [embed],
		components: [row]
	});

}