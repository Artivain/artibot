module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		const config = require("../../config.json").params;
		if (client.user.username != config.botName) {
			client.user.setUsername(config.botName)
				.then(
					console.log("[Artibot] Nom du bot mis à jour pour", config.botName)
				);
		}
	},
};