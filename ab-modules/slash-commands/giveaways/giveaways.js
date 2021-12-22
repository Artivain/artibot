/*
 * Module Giveaways par GoudronViande24
 * Basé sur le module discord-giveaways par @androz2091
*/

const { MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { GiveawaysManager } = require('discord-giveaways');
const fs = require("fs");
const path = require("path");
const ms = require('ms');
var manager;

module.exports = {
	// ########################################
	// Create the command with all the options
	// ########################################

	data: new SlashCommandBuilder()
		.setName("giveaway")
		.setDescription(
			"Créer et gérer des giveaways."
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Créer un giveaway')
				.addStringOption(option =>
					option
						.setName("prix")
						.setDescription("Le prix qui sera à gagner dans le giveaway.")
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName("durée")
						.setDescription("Le temps avant la fin du giveaway. Exemples: '5h', '2d'")
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName("gagnants")
						.setDescription("Nombre de gagnants.")
						.setRequired(true)
				)
				.addUserOption(option =>
					option
						.setName("créateur")
						.setDescription("Utilisateur qui héberge le giveaway (sponsor, donateur, etc.). Par défaut, c'est toi.")
				)
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("Le salon dans lequel le giveaway sera publié.")
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('create-drop')
				.setDescription('Créer un drop')
				.addStringOption(option =>
					option
						.setName("prix")
						.setDescription("Le prix qui sera à gagner dans le drop.")
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName("gagnants")
						.setDescription("Nombre de gagnants.")
						.setRequired(true)
				)
				.addUserOption(option =>
					option
						.setName("créateur")
						.setDescription("Utilisateur qui héberge le drop (sponsor, donateur, etc.). Par défaut, c'est toi.")
				)
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("Le salon dans lequel le drop sera lancé.")
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('reroll')
				.setDescription('Trouver un ou plusieurs nouveau(x) gagnant(s) pour un giveaway terminé')
				.addStringOption(option =>
					option
						.setName("id")
						.setDescription("Le ID du message du giveaway.")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription('Modifier un giveaway.')
				.addStringOption(option =>
					option
						.setName("id")
						.setDescription("Le ID du message du giveaway.")
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName("option")
						.setDescription("Quelle option modifier dans le giveaway?")
						.addChoice("Nombre de gagnants", "winnerCount")
						.addChoice("Prix à gagner", "prize")
						.addChoice("Ajouter du temps", "time")
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName("valeur")
						.setDescription("La valeur de la modification.")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('end')
				.setDescription('Termine immédiatement un giveaway.')
				.addStringOption(option =>
					option
						.setName("id")
						.setDescription("Le ID du message du giveaway.")
						.setRequired(true)
				)
		),

	// ########################################
	// Initialize the manager on bot statup
	// ########################################

	async init(client, config) {
		// Verify that the data directory exists
		if (!fs.existsSync(path.resolve(__dirname, "data", "giveaways.json"))) {
			if (!fs.existsSync(path.resolve(__dirname, "data"))) {
				console.log("[Giveaways] Création du dossier pour le stockage des données");
				fs.mkdirSync(path.resolve(__dirname, "data"));
			};
		};

		// Karens are gonna ask for this
		manager = new GiveawaysManager(client, {
			storage: path.resolve(__dirname, "data", "giveaways.json"),
			default: {
				botsCanWin: false,
				embedColor: config.embedColor,
				embedColorEnd: '#000000',
				reaction: '🎉'
			}
		});

		console.log("[Giveaways] Prêt.");
	},

	async execute(interaction, config) {
		const command = interaction.options.getSubcommand();

		// ########################################
		// End subcommand
		// ########################################

		if (command == "end") {
			const messageId = interaction.options.getString("id");
			const giveaway = manager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === messageId);

			if (!giveaway) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Giveaway introuvable.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			const isGiveawayOwner = giveaway.hostedBy.slice(0, -1).substring(2) == interaction.member.id;
			const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);

			if (!isAdmin && !isGiveawayOwner) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("**Vous ne pouvez pas exécuter cette commande.**\nVous devez avoir les permissions administrateur ou être celui qui héberge le giveaway.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			if (giveaway.ended) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Le giveaway est déjà terminé.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			var embed = await manager.end(messageId).then(() => {
				return new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Le giveaway a bien été terminé.");
			})
				.catch(() => {
					return new MessageEmbed()
						.setColor("RED")
						.setTitle("Giveaways")
						.setTimestamp()
						.setFooter(config.botName, config.botIcon)
						.setDescription("Une erreur est survenue.");
				});
		};

		// ########################################
		// Edit subcommand
		// ########################################

		if (command == "edit") {
			const messageId = interaction.options.getString("id");
			const giveaway = manager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === messageId);

			if (!giveaway) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Giveaway introuvable.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			const isGiveawayOwner = giveaway.hostedBy.slice(0, -1).substring(2) == interaction.member.id;
			const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);

			if (!isAdmin && !isGiveawayOwner) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("**Vous ne pouvez pas exécuter cette commande.**\nVous devez avoir les permissions administrateur ou être celui qui héberge le giveaway.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			if (giveaway.ended) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Impossible de modifier un giveaway terminé.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			const option = interaction.options.getString("option");
			const value = interaction.options.getString("valeur");

			if (option == "winnerCount") {
				if (!isNaN(value) && parseInt(value) > 0) {
					var settings = { newWinnerCount: parseInt(value) };
				} else {
					const errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Giveaways")
						.setTimestamp()
						.setFooter(config.botName, config.botIcon)
						.setDescription("La valeur entrée est invalide.");

					await interaction.reply({
						embeds: [errorEmbed],
						ephemeral: true
					});

					return
				};
			};

			if (option == "prize") {
				var settings = { newPrize: value };
			};

			if (option == "time") {
				var settings = { addTime: ms(value) };
			};

			var embed = await manager.edit(messageId, settings).then(() => {
				return new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Le giveaway a bien été modifié.");
			})
				.catch(() => {
					return new MessageEmbed()
						.setColor("RED")
						.setTitle("Giveaways")
						.setTimestamp()
						.setFooter(config.botName, config.botIcon)
						.setDescription("Une erreur est survenue.");
				});
		};

		// ########################################
		// Reroll subcommand
		// ########################################

		if (command == "reroll") {
			const messageId = interaction.options.getString("id");
			const giveaway = manager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === messageId);

			if (!giveaway) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Giveaway introuvable.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			const isGiveawayOwner = giveaway.hostedBy.slice(0, -1).substring(2) == interaction.member.id;
			const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);

			if (!isAdmin && !isGiveawayOwner) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("**Vous ne pouvez pas exécuter cette commande.**\nVous devez avoir les permissions administrateur ou être celui qui héberge le giveaway.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			var embed = await manager.reroll(messageId, {
				winnerCount: 1,
				messages: {
					congrat: "🎉 Félicitations, {winners}! 🎉\nVous avez gagné **{this.prize}**!",
					error: "Aucun participant valide, impossible de désigner un gagnant pour **{this.prize}**."
				}
			}).then(() => {
				return new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("Le reroll a été effectué.");
			})
				.catch(() => {
					return new MessageEmbed()
						.setColor("RED")
						.setTitle("Giveaways")
						.setTimestamp()
						.setFooter(config.botName, config.botIcon)
						.setDescription("Une erreur est survenue.");
				});
		};

		// ########################################
		// Create subcommand
		// ########################################

		if (command == "create") {
			if (interaction.options.getChannel("channel")) {
				var isSameGuild = interaction.channel.guild.id == interaction.options.getChannel("channel").guild.id;
			} else var isSameGuild = true;

			if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && isSameGuild) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("**Vous ne pouvez pas exécuter cette commande.**\nVous devez avoir les permissions administrateur.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			const duration = interaction.options.getString("durée"),
				winnerCount = interaction.options.getInteger('gagnants'),
				prize = interaction.options.getString('prix');

			if (interaction.options.getChannel("channel")) {
				var channel = interaction.options.getChannel("channel");
				if (channel.type !== "GUILD_TEXT") {
					return interaction.reply({
						content: "Impossible de créer le giveaway dans ce channel.",
						ephemeral: true
					});
				};
			} else {
				var channel = interaction.channel;
			}

			if (interaction.options.getUser("créateur")) {
				var hostedBy = interaction.options.getUser("créateur");
			} else {
				var hostedBy = interaction.member.user;
			};

			await manager.start(channel, {
				duration: ms(duration),
				winnerCount,
				prize,
				hostedBy,
				messages: {
					giveawayEnded: "Giveaway terminé.",
					inviteToParticipate: "Réagis avec 🎉 pour participer!",
					winMessage: "🎉 Félicitations, {winners}! 🎉\nVous avez gagné **{this.prize}**!",
					drawing: "Tirage ({this.winnerCount} gagnant(s)): {timestamp}.",
					embedFooter: {
						text: config.botName,
						iconURL: config.botIcon
					},
					noWinner: "Giveaway annulé, aucun participant n'est éligible.",
					winners: "Gagnant(s):",
					endedAt: "Terminait le",
					hostedBy: "Présenté par {this.hostedBy}"
				}
			});

			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Giveaways")
				.setTimestamp()
				.setFooter(config.botName, config.botIcon)
				.setDescription("Le giveaway a bien été créé!");
		};

		// ########################################
		// Create drop subcommand
		// ########################################

		if (command == "create-drop") {
			if (interaction.options.getChannel("channel")) {
				var isSameGuild = interaction.channel.guild.id == interaction.options.getChannel("channel").guild.id;
			} else var isSameGuild = true;

			if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && isSameGuild) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle("Giveaways")
					.setTimestamp()
					.setFooter(config.botName, config.botIcon)
					.setDescription("**Vous ne pouvez pas exécuter cette commande.**\nVous devez avoir les permissions administrateur.");

				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});

				return
			};

			const winnerCount = interaction.options.getInteger('gagnants'),
				prize = interaction.options.getString('prix');

			if (interaction.options.getChannel("channel")) {
				var channel = interaction.options.getChannel("channel");
				if (channel.type !== "GUILD_TEXT") {
					return interaction.reply({
						content: "Impossible de créer le drop dans ce channel.",
						ephemeral: true
					});
				};
			} else {
				var channel = interaction.channel;
			}

			if (interaction.options.getUser("créateur")) {
				var hostedBy = interaction.options.getUser("créateur");
			} else {
				var hostedBy = interaction.member.user;
			};

			await manager.start(channel, {
				duration: ms("1d"),
				winnerCount,
				prize,
				hostedBy,
				messages: {
					dropMessage: "Soyez le premier à réagir avec 🎉 pour gagner!\n{this.winnerCount} gagnant(s)",
					giveawayEnded: "Drop terminé.",
					winMessage: "🎉 Félicitations, {winners}! 🎉\nVous avez gagné **{this.prize}**!",
					embedFooter: {
						text: config.botName,
						iconURL: config.botIcon
					},
					noWinner: "Giveaway annulé, aucun participant n'est éligible.",
					winners: "Gagnant(s):",
					endedAt: "Terminait le",
					hostedBy: "Présenté par {this.hostedBy}"
				},
				isDrop: true
			});

			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Giveaways")
				.setTimestamp()
				.setFooter(config.botName, config.botIcon)
				.setDescription("Le drop a bien été lancé!");
		};

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};
