const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { localizer } = require("../../index");

module.exports = {
	name: "resetinteractions",
	description: localizer._("Deletes the cache of the interactions and slash commands in Discord's API."),
	ownerOnly: true,

	async execute(message, args, { config, log }) {
		const waitingEmbed = new MessageEmbed()
			.setColor("YELLOW")
			.setTitle("SlashManager")
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setTimestamp()
			.setDescription(localizer._("Deleting saved slash commands from the bot and test server...\nThis can take some time."));
		const response = await message.reply({
			embeds: [waitingEmbed]
		});

		log("SlashManager", localizer._("Deleting saved slash commands from the bot and test server..."), "log", true);

		// Fetch test guild
		message.client.guilds.fetch(config.testGuildId)
			.then(guild => {
				// Remove all commands from test guild
				guild.commands.set([])
					.then(() => {
						log("SlashManager", localizer._("Slash commands have been deleted from test server."), "log", true);

						// Remove all commands from the client (so in all servers)
						message.client.application.commands.set([])
							.then(() => {
								log("SlashManager", localizer._("Slash commands have been deleted from the bot."), "log", true);

								const embed = new MessageEmbed()
									.setColor(config.embedColor)
									.setTitle(localizer._("Purge finished"))
									.setFooter({ text: config.botName, iconURL: config.botIcon })
									.setTimestamp()
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
							})
							.catch(e => {
								const errorEmbed = new MessageEmbed()
									.setColor("RED")
									.setTitle("SlashManager")
									.setFooter({ text: config.botName, iconURL: config.botIcon })
									.setTimestamp()
									.setDescription(localizer._("An error occured while deleting slash commands from the bot.\nCheck the console for more details."));
								response.edit({ embeds: [errorEmbed] });
								log("SlashManager", localizer._("An error occured while deleting slash commands from the bot: ") + e, "warn", true);
							});
					})
					.catch(e => {
						const errorEmbed = new MessageEmbed()
							.setColor("RED")
							.setTitle("SlashManager")
							.setFooter({ text: config.botName, iconURL: config.botIcon })
							.setTimestamp()
							.setDescription(localizer._("An error occured while deleting slash commands from test server.\nCheck the console for more details."));
						response.edit({ embeds: [errorEmbed] });
						log("SlashManager", localizer._("An error occured while deleting slash commands from test server: ") + e, "warn", true);
					});
			});
	}
};