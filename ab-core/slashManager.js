const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, testGuildId, devMode, locale } = require("../config.json");
const { log } = require("./logger");
const Localizer = require("artibot-localizer");
const path = require("path");

var rest = new REST({ version: "9" });
var commandJsonData = [];

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	init(token) {
		rest.setToken(token);
	},

	generateData(client) {
		commandJsonData = [
			...Array.from(client.slashCommands.values()).map(({ command }) => command.data.toJSON()),
			...Array.from(client.contextCommands.values()).map(({ command }) => command.data),
		];
	},

	async register() {
		try {
			log("SlashManager", localizer._("Initializing slash commands on Discord..."), "info", true);

			/*
				Send slash commands and other interactions to Discord API.
				There is 2 types of interactions, "guild" and "global".
				"Guild" for interactions in only one server and "gloabl" for interactions
				in all the servers where the bot has perms.
				In dev or in bots with only one server, use only "guild" interactions
				since they can be refreshed more often and there is a shorter cache.
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

			log("SlashManager", localizer._("Slash commands initialized successfully."), "log", true);
			return true
		} catch (error) {
			log("SlashManager", localizer._("An error occured when initializing slash commands, here are the details: ") + error, "warn", true);
			return false
		};
	}
};