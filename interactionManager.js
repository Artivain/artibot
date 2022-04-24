import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client } from "discord.js";
import Artibot, { log, Module } from "./index.js";

/**
 * Interaction management utility for Artibot
 */
export default class InteractionManager {
	/**
	 * @param {Object} parameters - Parameters for this InteractionManager
	 * @param {string} parameters.token - Token for the Discord bot
	 * @param {Artibot} [parameters.artibot]
	 */
	constructor({ token, artibot: { localizer, client, config: { testGuildId, devMode } } }) {
		this.rest = new REST({ version: "9" });
		this.rest.setToken(token);

		this.clientId = client.user.id;
		this.testGuildId = testGuildId;
		this.devMode = devMode;
		this.localizer = localizer;
	}

	/**
	 * JSON data of all slash commands and other interactions
	 * @type {string[]}
	 */
	commandJSONData = [];

	/**
	 * Generate data to send to Discord API to register interactions
	 * @param {Module[]} modules - List of the modules to generate data from
	 */
	generateData(modules) {
		// this.commandJSONData = [
		// 	...Array.from(client.slashCommands.values()).map(({ command }) => command.data.toJSON()),
		// 	...Array.from(client.contextCommands.values()).map(({ command }) => command.data),
		// ];

		for (const module of modules) {
			for (const part of module.parts) {
				if (part.type == "slashcommand") {
					this.commandJSONData.push(part.data.toJSON());
				} else if (part.type == "usermenu" || part.type == "messagemenu") {
					this.commandJSONData.push(part.data);
				}
			}
		}
	}

	/**
	 * Empty all stored JSON data
	 */
	resetData() {
		this.commandJSONData.length = 0;
	}

	/**
	 * Register interactions in Discord API
	 * @returns {boolean} True if everything went good, false if there was a problem.
	 */
	async register() {
		try {
			log("InteractionManager", this.localizer._("Initializing interactions and slash commands on Discord..."), "info", true);
			if (!this.commandJSONData.length) return log("InteractionManager", this.localizer._("Nothing to register."), "warn", true);

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
					{ body: this.commandJSONData }
				);
			} else {
				await this.rest.put(
					Routes.applicationCommands(this.clientId),
					{ body: this.commandJSONData }
				);
			};

			log("InteractionManager", this.localizer._("Interaction and slash commands initialized successfully."), "log", true);
			log("InteractionManager", this.localizer.__(" -> Registered [[0]] interactions.", { placeholders: [this.commandJSONData.length] }), "log", true);
			return true;
		} catch (error) {
			log("InteractionManager", this.localizer._("An error occured when initializing interactions and slash commands, here are the details: ") + error, "warn", true);
			return false;
		};
	}
}