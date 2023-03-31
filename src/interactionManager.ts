import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, Routes } from "discord.js";
import Artibot from ".";
import { Collection, Snowflake } from "discord.js";
import Localizer from "artibot-localizer";
import { MessageContextMenuOption, Module, SlashCommand, UserContextMenuOption } from "./modules.js";
import log from "./logger.js";

/**
 * Interaction management utility for Artibot
 */
export class InteractionManager {
	/** Discord.js REST API utilitie */
	private rest: REST;
	/** Discord bot client ID */
	clientId: Snowflake;
	/** Test guild ID */
	testGuildId: Snowflake;
	/** Dev mode */
	devMode: boolean;
	/** Debug mode */
	debug: boolean;
	/** Localizer instance */
	localizer: Localizer;
	/** JSON data of all slash commands and other interactions */
	commandJSONData: (RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody)[] = [];

	/**
	 * @param config
	 * @param config.token - Discord bot token
	 * @param config.artibot - Artibot instance
	 */
	constructor({ token, artibot: { localizer, client, config: { testGuildId, devMode, debug } } }: { token: string, artibot: Artibot }) {
		if (!client || !client.user) throw new Error("Discord.js Client is not as expected");

		this.rest = new REST({ version: "10" });
		this.rest.setToken(token);

		this.clientId = client.user.id;
		this.testGuildId = testGuildId;
		this.devMode = devMode;
		this.debug = debug;
		this.localizer = localizer;
	}

	/**
	 * Generate data to send to Discord API to register interactions
	 * @param modules - List of the modules to generate data from
	 * @method
	 */
	public readonly generateData = (modules: Collection<string, Module>): void => {
		for (const [, module] of modules) {
			for (const part of module.parts) {
				if (part instanceof SlashCommand || part instanceof UserContextMenuOption || part instanceof MessageContextMenuOption) {
					this.commandJSONData.push(part.data.toJSON());
				}
			}
		}
	}

	/**
	 * Empty all stored JSON data
	 * @method
	*/
	public readonly resetData = (): void => {
		this.commandJSONData.length = 0;
	}

	/**
	 * Register interactions in Discord API
	 * @returns True if everything went good, false if there was a problem.
	 * @method
	 * @async
	 */
	public readonly register = async (): Promise<boolean> => {
		try {
			log("InteractionManager", this.localizer._("Initializing interactions and slash commands on Discord..."), "info", true);
			if (!this.commandJSONData.length) {
				log("InteractionManager", this.localizer._("Nothing to register."), "warn", true);
				return true;
			}

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
			}

			log("InteractionManager", this.localizer._("Interaction and slash commands initialized successfully."), "log", true);
			log("InteractionManager", this.localizer.__(" -> Registered [[0]] interactions.", { placeholders: [this.commandJSONData.length.toString()] }), "log", true);
			return true;
		} catch (error) {
			log("InteractionManager", this.localizer._("An error occured when initializing interactions and slash commands, here are the details: ") + error, "warn", true);
			if (this.debug) console.error(error);
			return false;
		}
	}
}

export default InteractionManager;