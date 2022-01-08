const { log } = require("../logger");

module.exports = {
	name: "guildCreate",
	
	async execute(guild) {
		log("Artibot", "Ajouté à un nouveau serveur: " + guild.name, "log", true);
	}
};