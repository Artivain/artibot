const { log } = require("../logger");

module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		log("Artibot", `Prêt! Connecté en tant que ${client.user.tag}`, "log", true);
	}
};