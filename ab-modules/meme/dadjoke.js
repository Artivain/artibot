const { MessageEmbed } = require("discord.js");
const axios = require("axios").default;
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

const options = {
	url: "https://icanhazdadjoke.com/",
	method: "get",
	headers: {
		"User-Agent": "Artibot (https://github.com/Artivain/artibot)",
		"Accept": "application/json"
	}
};

module.exports = {
	name: "dadjoke",
	description: localizer._("Tells a dad joke."),

	async execute(message, args, { config }) {
		const reponse = await axios(options);
		const joke = reponse.data.joke;

		let embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTitle(localizer._("Dad joke"))
			.setDescription(joke)
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setTimestamp();

		await message.reply({
			embeds: [embed]
		});
	}
};