const { MessageEmbed } = require("discord.js");
const axios = require("axios").default;

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
	description: "Dit une blague de Chuck Norris.",

	async execute(message, args, config) {
		const reponse = await axios(options);
		const joke = reponse.data.joke;

		let embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTitle("Dad joke")
			.setDescription(joke)
			.setFooter(config.botName, config.botIcon)
			.setTimestamp();

		await message.reply({
			embeds: [embed]
		});
	}
};