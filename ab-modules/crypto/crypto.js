/**
 * Cryptocurrencies market value
 * Uses Coinbase's API to get current values
 * @author GoudronViande24
 * @since 1.0.0
 */

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require('axios');
const { currencies } = require("./config.json");
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("crypto")
		.setDescription(localizer._("Get the current value of a cryptocurrency."))
		.addStringOption(option =>
			option.setName("crypto")
				.setDescription(localizer._("The cryptocurrency to look for"))
				.setRequired(true)
				.addChoice("Bitcoin", "BTC")
				.addChoice("Ethereum", "ETH")
		),

	async execute(interaction, { config }) {
		const crypto = interaction.options.getString("crypto");
		var costs = "";

		for (const currency of currencies) {
			let url = `https://api.coinbase.com/v2/prices/${crypto}-${currency}/spot`;
			let data = (await axios.get(url)).data.data;
			costs += `**${data.currency}**: ${parseFloat(data.amount).toFixed(2)}\n`;
		};

		var embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTitle(`${localizer._("Actual value")} - ${crypto}`)
			.setFooter({ text: config.botName, iconUR: config.botIcon })
			.setTimestamp()
			.setDescription(costs + "\n`"+ localizer._("Data fetched from Coinbase") + "`");

		await interaction.reply({
			embeds: [embed]
		});
	}
};