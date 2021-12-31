const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { testGuildId } = require("../../../config.json");

module.exports = {
	name: "resetslashcmd",
	description: "Supprime le cache des commandes slash auprès de L'API Discord.",
	ownerOnly: true,

	async execute(message, args, config) {
		const waitingEmbed = new MessageEmbed()
			.setColor("YELLOW")
			.setTitle("SlashManager")
			.setFooter(config.botName, config.botIcon)
			.setTimestamp()
			.setDescription("Suppression des commandes slash du bot et du serveur de test en cours...\nCeci peut prendre du temps.");
		const response = await message.reply({
			embeds: [waitingEmbed]
		});

		console.log("[SlashManager] Suppression des commandes slash du bot et du serveur de test en cours...");

		// Fetch test guild
		message.client.guilds.fetch(testGuildId)
			.then(guild => {
				// Remove all commands from test guild
				guild.commands.set([])
					.then(() => {
						console.log("[SlashManager] Les commandes ont bien étés supprimées du serveur de test.");

						// Remove all commands from the client (so in all servers)
						message.client.application.commands.set([])
							.then(() => {
								console.log("[SlashManager] Les commandes ont bien étés supprimées du bot.");

								const embed = new MessageEmbed()
									.setColor(config.embedColor)
									.setTitle("Réinitialisation terminée")
									.setFooter(config.botName, config.botIcon)
									.setTimestamp()
									.setDescription("Les commandes ont bien été supprimées du serveur de test et du bot.\nVous pouvez décider de réenregistrer les commandes maintenant, ou le faire plus tard en redémarrant le bot.");

								const row = new MessageActionRow()
									.addComponents(
										new MessageButton()
											.setCustomId("registerslashcommands")
											.setLabel("Maintenant")
											.setStyle("PRIMARY")
											.setEmoji("✅"),
										new MessageButton()
											.setCustomId("delete")
											.setLabel("Plus tard")
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
									.setFooter(config.botName, config.botIcon)
									.setTimestamp()
									.setDescription("Une erreur est survenue avec la suppression des commandes du bot.\nConsulter la console pour en savoir plus.");
								response.edit({
									embeds: [errorEmbed]
								});
								console.log("[SlashManager] Erreur avec la suppression des commandes slash du bot: " + e);
							});
					})
					.catch(e => {
						const errorEmbed = new MessageEmbed()
							.setColor("RED")
							.setTitle("SlashManager")
							.setFooter(config.botName, config.botIcon)
							.setTimestamp()
							.setDescription("Une erreur est survenue avec la suppression des commandes du serveur de test.\nConsulter la console pour en savoir plus.");
						response.edit({
							embeds: [errorEmbed]
						});
						console.log("[SlashManager] Erreur avec la suppression des commandes dans le serveur de test: " + e);
					});
			});
	}
};