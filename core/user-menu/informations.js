const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const humanizeDuration = require("humanize-duration");
const { localizer } = require("../../index");

module.exports = {
	data: {
		name: localizer._("Informations"),
		type: 2 // 2 is for user context menus
	},

	async execute(interaction, { config, contributors }) {

		const infos = interaction.options._hoistedOptions[0].member;
		var type = localizer._("User");
		const now = moment();
		const since = humanizeDuration(now - moment(infos.joinedTimestamp), {
			language: config.locale,
			delimiter: ", ",
			largest: 2,
			round: true,
			units: ["y", "mo", "w", "d", "h", "m"]
		});

		if (infos.user.bot) {
			type = localizer._("Bot");
		} else if (infos.user.system) {
			type = localizer._("System");
		};

		var more = "";
		if (infos.guild.ownerId === infos.user.id) {
			more += localizer._("\nIs the owner of this server.");
		};
		if (config.ownerId === infos.user.id) {
			more += localizer._("\nIs the owner of this bot.");
		};
		if (contributors.devs.find(element => element.discordId === infos.user.id)) {
			more += localizer._("\n**Is one of the super devs of this bot!**");
		};
		if (contributors.donators.find(element => element.discordId === infos.user.id)) {
			more += localizer._("\n**Is one of the super donators of this bot!**");
		};

		const embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTimestamp()
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setTitle(localizer._("Information on the user"))
			.setDescription(
				localizer._("Name on the server: ") + (infos.nickname ? infos.nickname : infos.user.username) + "\n" +
				localizer._("Tag:") + " `" + infos.user.username + "#" + infos.user.discriminator + "`\n" +
				localizer._("ID:") + " `" + infos.user.id + "`" +
				more
			)
			.addField(localizer._("Type"), type)
			.addField(localizer._("On this server since"), since);

		await interaction.reply({ embeds: [embed] });
		return
	}
};