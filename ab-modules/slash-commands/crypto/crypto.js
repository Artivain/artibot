/*
 * Crypto market value
 * By GoudronViande24
 * Uses Coinbase's API to get current value
*/

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require('axios');
const config = require("./config.json");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("crypto")
		.setDescription(
			"Voir la valeur de certaines cryptomonaies."
		)
		.addStringOption(option =>
			option.setName("cryptomonaie")
				.setDescription("Le code court de la cryptomonaie")
				.setRequired(true)
				.addChoice("BTC", "BTC")
				.addChoice("ETH", "ETH")
		),

	async execute(interaction, params) {
		const crypto = interaction.options.getString("cryptomonaie");
		var costs = "";

		for (const currency of config.currencies) {
			let url = `https://api.coinbase.com/v2/prices/${crypto}-${currency}/spot`;
			let data = (await axios.get(url)).data.data;
			costs += `**${data.currency}**: ${parseFloat(data.amount).toFixed(2)}\n`;
		};

		var embed = new MessageEmbed()
				.setColor(params.embedColor)
				.setTitle(`Valeur actuelle - ${crypto}`)
				.setFooter(params.botName, params.botIcon)
				.setTimestamp()
				.setDescription(costs + "\n`Données fournies par Coinbase`");

			await interaction.reply({
				embeds: [embed]
			});
	}
};