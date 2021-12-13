const moment = require('moment');
const tz = require('moment-timezone');
const { Client, Intents } = require("discord.js");

function updateActivity(client, config, clock, i) {
	const timeNowUpdate = moment().tz(clock.timezone).format(config.module.format);
	client.user.setActivity(`🕒 ${timeNowUpdate}`);
}

function startClock(clock, config, i) {
	// Since discord.js v13, intents are mandatory
	const client = new Client({
		intents: [Intents.FLAGS.GUILDS]
	});
	client.once("ready", client => {
		if (client.user.username !== clock.botName) {
			client.user.setUsername(clock.botName);
			console.log(`[Clocks] Horloge #${i}: Nom changé pour ${clock.botName}`);
		};
		//set the interval
		setInterval(() => updateActivity(client, config, clock, i), config.module.updateinterval);
		updateActivity(client, config, clock, i);
		//tells when it's ready
		console.log(`[Clocks] Horloge #${i}: Connecté en tant que ${client.user.tag} (${client.user.id}) le ${moment().format("DD MMMM YYYY, HH:mm:ss")}`);
	});
	client.login(config.module.tokens[i]);
}

module.exports = {
	name: "Clocks",

	execute(client, config) {
		config.module = require("./config.json");
		try { config.module.tokens = require("./private.json"); } catch (error) {
			if (error.code !== 'MODULE_NOT_FOUND') {
				// Re-throw not "Module not found" errors 
				throw error;
			} else {
				console.error("[Clocks] Erreur de configuration: Le fichier private.json est introuvable.");
				process.exit(1);
			}
		}

		if (!config.module.tokens) {
			console.error("[Clocks] Erreur de configuration: Le fichier private.json est invalide.");
			process.exit(1);
		}

		if (config.module.tokens.length != config.module.clocks.length) {
			console.error("[Clocks] Erreur de configuration: Le nombre de tokens n'est pas équivalent au nombre d'horloges.");
			process.exit(1);
		}

		console.log("[Clocks] Chargement...");

		for (var i = 0, len = config.module.clocks.length; i < len; i++) {
			startClock(config.module.clocks[i], config, i);
		}
	}
}