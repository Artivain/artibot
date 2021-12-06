const { prefix } = require("../config.json");

module.exports = {
	async execute(message) {
		return message.channel.send(
			`Bonjour ${message.author}! Mon préfixe est \`${prefix}\`, tu peux obtenir de l'aide en faisait \`${prefix}help\`.`
		);
	},
};
