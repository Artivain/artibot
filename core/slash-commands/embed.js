const { MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { localizer } = require("../../index");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("embed")
		.setDescription(localizer._("Make an embed and send it in the channel."))
		.addStringOption(option =>
			option.setName("title")
				.setDescription(localizer._("The title for the embed"))
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("content")
				.setDescription(localizer._("The content for the embed (message, rules, infos, etc...)"))
				.setRequired(true)
		)
		.addBooleanOption(option =>
			option.setName("date")
				.setDescription(localizer._("To show or not the date in the footer"))
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("footer")
				.setDescription(localizer._("The text for the footer of the embed"))
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("color")
				.setDescription(localizer._("The color at the left of the embed (in hexadecimal notation, ex.: #ffffff)"))
				.setRequired(false)
		),

	async execute(interaction, { config }) {

		if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {

			const title = interaction.options.getString("title"),
				color = interaction.options.getString("color"),
				content = interaction.options.getString("content"),
				footerText = interaction.options.getString("footer"),
				date = interaction.options.getBoolean("date");

			var embed = new MessageEmbed()
				.setColor((color ? color : config.embedColor))
				.setTitle(title)
				.setDescription(content);

			if (footerText) embed.setFooter({ text: footerText });
			if (date) embed.setTimestamp();

			interaction.channel.send({ embeds: [embed] });

			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle(localizer._("Create an embed"))
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer.__("The embed *[[0]]* should have been created.", { placeholders: [title] }));
		} else {
			var embed = new MessageEmbed()
				.setColor("RED")
				.setTitle(localizer._("Create an embed"))
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer._("Error: you don't have admin perms!"));
		}

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};
