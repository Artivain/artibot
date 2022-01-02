const { log } = require("../logger");

module.exports = {
	name: "guildDelete",
	
	async execute(guild) {
		log("Artibot", "Retiré du serveur:" + guild.name, "log", true);
	}
};