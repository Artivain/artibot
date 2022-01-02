const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, testGuildId, devMode } = require("../config.json");
const { log } = require("./logger");

var rest = new REST({ version: "9" });
var commandJsonData = [];

module.exports = {
	init(token) {
		rest.setToken(token);
	},

	generateData(client) {
		commandJsonData = [
			...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
			...Array.from(client.contextCommands.values()).map((c) => c.data),
		];
	},

	async register() {
		try {
			log("SlashManager", "Initialisation des commandes slash...", "log", true);

			/**
				Ici on envoit à Discord les commandes slash.
				Il y a 2 types de commandes, les "guild" et les "global".
				"Guild" pour les commandes par serveur et "global" pour les commandes globales.
				En développement, utiliser seulement des commandes "guild" puisqu'elles peuvent se rafraichir
				instantanéments, alors que les commandes globales peuvent prendre jusqu'à 1 heure.
			*/

			if (devMode) {
				await rest.put(
					Routes.applicationGuildCommands(clientId, testGuildId),
					{ body: commandJsonData }
				);
			} else {
				await rest.put(
					Routes.applicationCommands(clientId),
					{ body: commandJsonData }
				);
			};

			log("SlashManager", "Commandes slash activées avec succès.", "log", true);
			return true
		} catch (error) {
			log("SlashManager", "Une erreur est survenue avec l'initialisation des commandes slash, voici les détais: " + error, "warn", true);
			return false
		};
	}
};