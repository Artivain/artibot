/**
 * WHOIS slash command
 * Uses Node.js WHOIS module to get info about a domain
 * @author GoudronViande24
 */

const whois = require('whois');
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Localizer = require("artibot-localizer");
const { locale } = require("../../config.json");
const path = require('path');

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("whois")
		.setDescription(localizer._("Get info on a domain"))
		.addStringOption(option =>
			option.setName("domain")
				.setDescription(localizer._("The domain to verify"))
				.setRequired(true)
		),

	async execute(interaction, { config }) {
		const domain = interaction.options.getString("domain");

		if (!domain.endsWith(".com") && !domain.endsWith(".net") && !domain.endsWith(".edu")) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setTitle(`WHOIS - ${domain}`)
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer.__("`[[0]]` is not a valid domain.\nThis WHOIS only supports `.com`, `.net` and `.edu` TLDs.", { placeholders: [domain] }));

			return await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true
			});
		};

		whois.lookup(domain, async (err, data) => {

			if (err) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle(`WHOIS - ${domain}`)
					.setFooter({ text: config.botName, iconURL: config.botIcon })
					.setTimestamp()
					.setDescription(localizer._("An error occured."));

				return await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});
			};

			// Delete the extra stuff at the end of the response
			data = data.substring(0, (data.indexOf("\nURL of the ICANN WHOIS Data Problem Reporting System:") - 1));

			let results = data.split("\n").reduce((obj, str, index) => {
				let strParts = str.split(":");

				if (strParts[0] && strParts[1]) {
					let [key, ...rest] = str.split(':');
					key = key.replace(/\s+/g, '');
					if (key !== key.toUpperCase()) key = key.charAt(0).toLowerCase() + key.slice(1) // Make first letter lowercase
					else key = key.toLowerCase(); // Make the key all lowercase if it's an acronym
					let value = rest.join(':').trim();

					// Check if key already exists
					if (key in obj) {
						// Check if value is a string
						if (typeof obj[key] == "string") {
							obj[key] = [obj[key], value];
						} else { // Else add value to the array
							obj[key].push(value);
						};
					} else {
						obj[key] = value;
					};
				};

				return obj;
			}, {});

			// Check if no data is returned (domain not found)
			if (Object.keys(results).length === 0) {
				const errorEmbed = new MessageEmbed()
					.setColor("RED")
					.setTitle(`WHOIS - ${domain}`)
					.setFooter({ text: config.botName, iconURL: config.botIcon })
					.setTimestamp()
					.setDescription(localizer.__("Domain `[[0]]` not found.", { placeholders: [domain] }));

				return await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});
			};

			if (typeof results.domainStatus == "string") {
				let code = results.domainStatus.split("#")[1].split(/[^A-Za-z]/)[0];
				var status = `[${code}](http://www.icann.org/epp#${code})`;
			} else {
				var status = "";
				results.domainStatus.forEach(value => {
					let code = value.split("#")[1].split(/[^A-Za-z]/)[0];
					status += `[${code}](http://www.icann.org/epp#${code})\n`;
				});
				status = status.trim();
			};

			if (typeof results.nameServer == "string") {
				var ns = results.nameServer;
			} else {
				var ns = "";
				results.nameServer.forEach(value => {
					ns += `${value}\n`;
				});
				ns = ns.trim();
			};

			if (results.registrantOrganization) {
				var name = results.registrantOrganization;
			} else if (results.registrantName) {
				var name = results.registrantName;
			} else {
				var name = localizer._("Name not found");
			};

			const embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle(`WHOIS - ${domain}`)
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(`${localizer.__("Here are the results for [[0]]", { placeholders: [domain] })}\n[${localizer._("See complete list online")}](https://who.is/whois/${domain})`)
				.addField(localizer._("Registrar"), `[${results.registrar}](${results.registrarURL})`, true)
				.addField(localizer._("Registrar WHOIS server"), results.registrarWHOISServer, true)
				.addField(localizer._("Domain registration date"), results.creationDate, true)
				.addField(localizer._("Email for abuse report"), results.registrarAbuseContactEmail, true)
				.addField(localizer._("Domain status (ICANN)"), status, true)
				.addField(localizer._("Owner's name"), name, true)
				.addField(localizer._("DNSSEC status"), results.dnssec, true)
				.addField(localizer._("DNS server(s)"), ns, true);

			if (results.reseller) {
				embed.addField(localizer._("Reseller"), results.reseller, true);
			};

			return await interaction.reply({
				embeds: [embed]
			});

		});
	}
};