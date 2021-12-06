module.exports = {
	name: "TwitchMonitor",

	async execute(client, config) {
		config.twitch = require("./config.json");
		const twitchAPI = require("./twitchApi");
		console.log("[TwitchMonitor] Prêt.");
	}
}