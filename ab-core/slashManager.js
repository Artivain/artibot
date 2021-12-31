const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, testGuildId, devMode } = require("../config.json");

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
			console.log("[SlashManager] Initialisation des commandes slash...");

			/**
				Ici on envoit à Discord les comamndes slash.
				Il y a 2 types de comamndes, les "guild" et les "global".
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
				)
			};

			console.log("[SlashManager] Commandes slash activées avec succès.");
			return true
		} catch (error) {
			console.error("[SlashManager] Une erreur est survenue avec l'initialisation des commandes slash, voici les détais:", error);
			return false
		};
	}
};