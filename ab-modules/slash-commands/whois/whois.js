/*
 * Whois command
 * By GoudronViande24
 * Uses Node WHOIS module to get infos about a domain
*/

const whois = require('whois');
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("whois")
		.setDescription("Obtenir des informations sur un nom de domaine")
		.addStringOption(option =>
			option.setName("domaine")
				.setDescription("Le domaine à vérifier")
				.setRequired(true)
		),

	async execute(interaction, config) {
		const domain = interaction.options.getString("domaine");

		if (!domain.endsWith(".com") && !domain.endsWith(".net") && !domain.endsWith(".edu")) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setTitle(`WHOIS - ${domain}`)
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription(`\`${domain}\` n'est pas un domaine valide.\nCe WHOIS ne supporte que les \`.com\`, \`.net\` et \`.edu.\``);

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
					.setFooter(config.botName, config.botIcon)
					.setTimestamp()
					.setDescription("Une erreur est survenue.");

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
							obj[key] = obj[key].push(value);
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
					.setFooter(config.botName, config.botIcon)
					.setTimestamp()
					.setDescription(`Impossible de trouver le domaine ${domain}`);

				return await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});
			};

			const embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle(`WHOIS - ${domain}`)
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription(`Voici les résultats pour ${domain}\n[Voir la fiche complète en ligne](https://who.is/whois/${domain})`)
				.addField("Registraire", `[${results.registrar}](${results.registrarURL})`, true)
				.addField("Serveur WHOIS du registraire", results.registrarWHOISServer, true)
				.addField("Date d'enregistrement du domaine", results.creationDate, true)
				.addField("Courriel pour le signalement d'abus", results.registrarAbuseContactEmail, true)
				.addField(
					"Statut du domain (ICANN)",
					`[${results.domainStatus.split("#")[1]}](http://www.icann.org/epp#${results.domainStatus.split("#")[1]})`,
					true
				)
				.addField("Nom du propriétaire", results.registrantName, true);

			if (results.reseller) {
				embed.addField("Revendeur", results.reseller, true);
			};

			return await interaction.reply({
				embeds: [embed]
			});

		});
	}
};