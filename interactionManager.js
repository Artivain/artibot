import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import log from "./logger.js";
import Localizer from "artibot-localizer";
import { resolve } from "path";
import { Client } from "discord.js";

/**
 * Interaction management utility for Artibot
 */
export default class InteractionManager {
	/**
	 * @param {Object} parameters - Parameters for this InteractionManager
	 * @param {string} parameters.token - Token for the Discord bot
	 * @param {Snowflake} parameters.clientId - Client ID of the bot
	 * @param {Localizer} parameters.localizer - Lang that messages should be in
	 * @param {Snowflake} [parameters.testGuildId] - ID of the test Discord server (required only if devMode is true)
	 * @param {boolean} [parameters.devMode=true] - If set to true, it will register interactions only for the test guild
	 */
	constructor({ token, clientId, testGuildId, devMode = true, localizer }) {
		this.rest = new REST({ version: "9" });
		this.commandJsonData = [];
		this.rest.setToken(token);

		this.clientId = clientId;
		this.testGuildId = testGuildId;
		this.devMode = devMode;
		this.localizer = localizer;
	}

	/**
	 * Generate data to send to Discord API to register interactions
	 * @param {Client} client - The Discord client for the bot
	 */
	generateData(client) {
		this.commandJsonData = [
			...Array.from(client.slashCommands.values()).map(({ command }) => command.data.toJSON()),
			...Array.from(client.contextCommands.values()).map(({ command }) => command.data),
		];
	}

	/**
	 * Register interactions in Discord API
	 * @returns {boolean} True if everything went good, false if there was a problem.
	 */
	async register() {
		try {
			log("InteractionManager", this.localizer._("Initializing interactions and slash commands on Discord..."), "info", true);

			/*
				Send slash commands and other interactions to Discord API.
				There is 2 types of interactions, "guild" and "global".
				"Guild" for interactions in only one server and "global" for interactions
				in all the servers where the bot has perms.
				In dev or in bots with only one server, use only "guild" interactions
				since they can be refreshed more often and there is a shorter cache.
			*/
			if (this.devMode) {
				await this.rest.put(
					Routes.applicationGuildCommands(this.clientId, this.testGuildId),
					{ body: this.commandJsonData }
				);
			} else {
				await this.rest.put(
					Routes.applicationCommands(this.clientId),
					{ body: this.commandJsonData }
				);
			};

			log("InteractionManager", this.localizer._("Interaction and slash commands initialized successfully."), "log", true);
			return true;
		} catch (error) {
			log("InteractionManager", this.localizer._("An error occured when initializing interactions and slash commands, here are the details: ") + error, "warn", true);
			return false;
		};
	}
}