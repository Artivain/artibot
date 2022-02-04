const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const humanizeDuration = require("humanize-duration");
const { ownerId } = require("../../../config.json");
const contributors = require("../../../contributors.json");

module.exports = {
	data: {
		name: "Informations",
		type: 2 // 2 is for user context menus
	},

	async execute(interaction, config) {

		const infos = interaction.options._hoistedOptions[0].member;
		var type = "Utilisateur";
		const now = moment();
		const since = humanizeDuration(now - moment(infos.joinedTimestamp), {
			language: "fr",
			delimiter: ", ",
			largest: 2,
			round: true,
			units: ["y", "mo", "w", "d", "h", "m"]
		});

		if (infos.user.bot) {
			type = "Bot";
		} else if (infos.user.system) {
			type = "Système";
		};

		var more = "";
		if (infos.guild.ownerId === infos.user.id) {
			more += "\nEst le propriétaire de ce serveur.";
		}
		if (ownerId === infos.user.id) {
			more += "\nEst le propriétaire de ce bot.";
		}
		if (contributors.devs.find(element => element.discordId === infos.user.id)) {
			more += "\n**Est un des supers développeurs de ce bot!**";
		}
		if (contributors.donators.find(element => element.discordId === infos.user.id)) {
			more += "\n**Est un des supers donateurs de ce bot!**";
		}

		const embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTimestamp()
			.setFooter({text: config.botName, iconURL: config.botIcon})
			.setTitle("Informations sur l'utilisateur")
			.setDescription(
				"Nom sur le serveur: " + (infos.nickname ? infos.nickname : infos.user.username) + "\n" +
				"Tag: `" + infos.user.username + "#" + infos.user.discriminator + "`\n" +
				"ID: `" + infos.user.id + "`" +
				more
			)
			.addField("Type", type)
			.addField("Sur le serveur depuis", since);

		await interaction.reply({
			embeds: [embed]
		});
		return;
	},
};