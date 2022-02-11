/**
 * Documentation module
 * Allows to create a custom help command from a simple json file.
 * @author GoudronViande24
 * @since 1.0.0
 */

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { name, commandName, commandDescription, argName, argDescription, pages } = require("./config.json");

var choices = [];
pages.forEach(page => choices.push([page.name, page.name]));

module.exports = {
	// Create command data to register it in Discord's API
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription(commandDescription)
		.addStringOption(option =>
			option
				.setName(argName)
				.setDescription(argDescription)
				.setRequired(true)
				.addChoices(choices)
		),

	async execute(interaction, { config }) {
		const page = pages.find(page => page.name == interaction.options.getString(argName));

		var embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTitle(`${name} | ${page.name}`)
			.setTimestamp()
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setDescription(page.content);

		if (page.icon) embed.setThumbnail(page.icon);
		if (page.image) embed.setImage(page.image);
		if (page.author) embed.setAuthor(page.author);

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};
