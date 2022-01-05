/*
 * Commande pokedex par GoudronViande24
 * Basé sur le module discord-giveaways par @androz2091
*/

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios").default;
const { log } = require("../../../ab-core/logger");

const icon = "https://cdn.pixabay.com/photo/2019/11/27/14/06/pokemon-4657023_960_720.png";
const apiBase = "https://pokeapi.co/api/v2";

/**
 * Get lenght in feets and inches
 * @param {number} n Length in centimeters
 * @returns {string} Feets and inches (example: 5'8")
 */

function toFeet(n) {
	var realFeet = ((n * 0.393700) / 12);
	var feet = Math.floor(realFeet);
	var inches = Math.round((realFeet - feet) * 12);
	return `${feet}'${inches}"`;
};

/**
 * Remove line breaks from a string
 * @param {string} str String to remove line breaks
 * @returns {string} Same string without line breaks
 */

function removeLineBreaks(str) {
	return str.replace(/(\r\n|\n|\r)/gm, " ");
};

module.exports = {
	// ########################################
	// Create the command with all the options
	// ########################################

	data: new SlashCommandBuilder()
		.setName("pokedex")
		.setDescription("Obtenir des informations sur un Pokémon.")
		.addStringOption(option =>
			option
				.setName("id")
				.setDescription("Le ID (ou le nom en anglais) du Pokémon à chercher.")
				.setRequired(true)
		),

	async execute(interaction, config) {
		try {
			// Send "Loading" embed
		let waitEmbed = new MessageEmbed()
		.setColor("#e3350d")
		.setTitle("Pokédex")
		.setImage(icon)
		.setTimestamp()
		.setFooter(config.botName, config.botIcon)
		.setDescription("Recherche en cours...");

	const message = await interaction.reply({
		embeds: [waitEmbed],
		fetchReply: true
	});

	const input = interaction.options.getString("id").toLowerCase();

	try {
		var response = await axios.get(apiBase + "/pokemon-species/" + input);
		var response2 = await axios.get(apiBase + "/pokemon/" + input);
	} catch (error) {
		if (error.response.status == 404) {
			var content = `**Erreur:**\nImpossible de trouver le Pokémon avec le ID ou le nom \`${input}\`.`;
		} else {
			var content = `Une erreur est survenue.`;
		};

		let errorEmbed = new MessageEmbed()
			.setColor("#e3350d")
			.setTitle("Pokédex")
			.setTimestamp()
			.setFooter(config.botName, config.botIcon)
			.setDescription(content);

		await message.edit({
			embeds: [errorEmbed]
		});

		return
	};

	const data = response.data;
	const data2 = response2.data;

	let types = "";
	data2.types.forEach(i => types += i.type.name + "\n");
	types = types.trim();

	let forms = "";
	data2.forms.forEach(form => forms += form.name + "\n");
	forms = forms.trim();

	let abilities = "";
	data2.abilities.forEach(i => abilities += i.ability.name + "\n");
	abilities = abilities.trim();

	let special = "";
	if (data.is_legendary) special += "Pokémon légendaire\n";
	if (data.is_mythical) special += "Pokémon mythique\n";
	special = special.trim();

	const flavorText = removeLineBreaks(data.flavor_text_entries.find(i => i.language.name == "fr").flavor_text);
	const name = data.names.find(i => i.language.name == "fr").name;
	const id = data.id;
	const generation = data.generation.name.split("-")[1].toUpperCase();
	const category = data.genera.find(i => i.language.name == "fr").genus;
	const image = data2.sprites.other["official-artwork"].front_default;
	const height = `${data2.height * 10} cm\n${toFeet(data2.height * 10)}`;
	const weight = `${data2.weight / 10} kg\n${Math.round(data2.weight / 10 * 2.205 * 10) / 10} lb`;

	let embed = new MessageEmbed()
		.setColor("#e3350d")
		.setTitle("Pokédex")
		.setTimestamp()
		.setFooter(config.botName, config.botIcon)
		.setDescription(`**${name}** - #${id}\n${category}\n${flavorText}`)
		.setImage(image)
		.addField("Type(s)", types, true)
		.addField("Grandeur", height, true)
		.addField("Poid", weight, true)
		.addField("Génération", generation, true)
		.addField("Formes", forms, true)
		.addField("Capacité(s)", abilities, true);

	if (special) {
		embed.addField("Attribut spécial", special, true);
	};

	if (data.evolves_from_species) {
		const response3 = await axios.get(data.evolves_from_species.url);
		const data3 = response3.data;
		const evolvesFromName = data3.names.find(i => i.language.name == "fr").name;
		embed.addField("Est l'évolution de", evolvesFromName, true);
	};

	await message.edit({
		embeds: [embed]
	});
		} catch (e) {console.log(e)};
	}
};
