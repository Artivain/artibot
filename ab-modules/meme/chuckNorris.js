const { MessageEmbed } = require("discord.js");
const https = require('https');
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	name: "chucknorris",
	description: localizer._("Tells a Chuck Norris joke."),
	aliases: ["cn"],

	execute(message, args, { config, log }) {
		const options = {
			hostname: 'api.chucknorris.io',
			port: 443,
			path: '/jokes/random',
			method: 'GET'
		};

		const req = https.request(options, res => {
			res.on('data', data => {
				let embed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle(localizer._("Chuck Norris joke"))
					.setDescription(JSON.parse(data).value)
					.setThumbnail(JSON.parse(data).icon_url)
					.setFooter({ text: config.botName, iconURL: config.botIcon })
					.setTimestamp();

				message.reply({
					embeds: [embed]
				});
			});
		});

		req.on('error', error => {
			message.reply(localizer._("An error occured while executing this command."));
			log("Meme", error);
		});

		req.end();
	}
}