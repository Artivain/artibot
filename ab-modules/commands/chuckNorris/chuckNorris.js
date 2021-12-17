const { MessageEmbed } = require("discord.js");
const https = require('https');

module.exports = {
	name: "chuckNorris",
	description: "Dit une blague de Chuck Norris.",
	aliases: ["cn"],

	execute(message, args, config) {
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
				.setTitle("Blague de Chuck Norris")
				.setDescription(JSON.parse(data).value)
				.setThumbnail(JSON.parse(data).icon_url)
				.setFooter(config.botName, config.botIcon)
				.setTimestamp();

				message.reply({
					embeds: [embed]
				});
			});
		});

		req.on('error', error => {
			message.reply("Une erreur est survenue pendant l'utilisation de cette commande.")
			console.error(error);
		});

		req.end();
	}
}