import InteractionManager from "./interactionManager.js";
import logger from "./logger.js";
import Localizer from "artibot-localizer";
import chalk from "chalk";
import figlet from "figlet";
import { Client, Collection, Intents, MessageEmbed, Permissions } from "discord.js";
import { createRequire } from 'module';
import coreModule from "./core/index.js";
import { readdirSync } from "fs";
import axios from "axios";
import { SlashCommandBuilder } from "@discordjs/builders";

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

/**
 * Powerful Discord bot system.
 * @author Artivain <info@artivain.com>
 * @author Thomas Fournier <thomas@artivain.com>
 * @see https://github.com/Artivain/artibot
 * @license GPL-3.0-or-later
 */
export default class Artibot {
	/**
	 * @param {Object} config - Configuration for Artibot
	 * @param {Snowflake} config.ownerId - Discord ID of the owner of the bot
	 * @param {Snowflake} config.testGuildId - Discord ID of the testing guild
	 * @param {string} [config.botName] - Name of the Discord bot. Used almost everywhere.
	 * @param {string} [config.botIcon] - URL of the profile picture of the bot
	 * @param {string} [config.prefix] - Prefix for the commands
	 * @param {boolean} [config.devMode] - Set to false if the bot must be used in more than one server. Interactions could take more time to refresh.
	 * @param {string} [config.lang] - Set the lang of the bot
	 * @param {string} [config.embedColor] - Color for the embeds sent by the bot
	 * @param {boolean} [config.advancedCorePing] - Set to false if you want to hide advanced infos from ping commands
	 * @param {boolean} [config.checkForUpdates] - Set to false if you don't want the bot to check for new updates
	 */
	constructor({
		ownerId,
		testGuildId,
		botName = "Artibot",
		botIcon = "https://assets.artivain.com/fav/bots/artibot-512.jpg",
		prefix = "ab ",
		devMode = true,
		lang = "en",
		embedColor = "#06476d",
		advancedCorePing = true,
		checkForUpdates = true
	}) {
		// Verify that the owner ID is set
		if (!ownerId) throw new Error("You must set the owner ID.");

		// Verify that the test guild ID is set
		if (!testGuildId) throw new Error("You must set the test guild ID.");

		// Verify that if dev mode is false, the test guild ID is set
		if (!devMode && !testGuildId) throw new Error("You must set the testGuildId if devMode is false.");

		// Create a localizer for the core
		this.localizer = new Localizer({
			filePath: "locales.json",
			lang
		});

		// Save all configs to the bot config
		this.config = {
			ownerId,
			testGuildId,
			botName,
			botIcon,
			prefix,
			devMode,
			lang,
			embedColor,
			advancedCorePing,
			checkForUpdates
		}

		this.version = version;

		/**
		 * Store cooldowns for commands
		 * @type {Collection<string, Collection<Snowflake, number>>}
		 */
		this.cooldowns = new Collection();

		// Send artwork to console
		console.log(chalk.blue(figlet.textSync('Artibot', {
			font: 'ANSI Shadow',
			horizontalLayout: 'fitted'
		})));
		log("Artibot", this.localizer._("Initialized!") + " v" + version, "info", true);

		/**
		 * List of registered modules
		 * @type {Module[]}
		 */
		this.modules = [];

		// Register the Core module
		this.registerModule(coreModule);
	}

	log = log;

	/**
	 * Create an embed
	 * @param {MessageEmbed|MessageEmbedOptions|APIEmbed} [data]
	 * @returns {Embed} Preconfigured embed
	 */
	createEmbed = (data) => {
		return new Embed(this, data);
	}

	/** Lists of people who contributed to the Artibot */
	contributors = require("./contributors.json");

	/**
	 * The token to login into Discord
	 * @type {string}
	 */
	#token;

	/**
	 * @param {Object} config - Advanced config for the bot
	 * @param {string} [config.token] - The login token for the Discord bot
	 * @param {IntentsResolvable[]} [config.additionalIntents] - Additional intents to register in the Discord client
	 */
	async login({ token = this.#token, additionalIntents = [] }) {
		if (!token) throw new Error("Token not set!");
		this.#token = token;
		this.modules.forEach(module => additionalIntents = additionalIntents.concat(module.additionalIntents));
		this.client = new Client({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_PRESENCES,
				...additionalIntents
			]
		});

		this.listeners = [];

		log("Artibot", this.localizer._("Loading event listeners..."), "log", true);
		const eventFiles = readdirSync("./events").filter(file => file.endsWith(".js"));

		for (const file of eventFiles) {
			const { name, execute, once } = await import(`./events/${file}`);
			if (once) {
				this.client.once(name, (...args) => execute(...args, this));
			} else {
				this.client.on(name, async (...args) => await execute(...args, this));
			};
		};

		this.client.login(token);
	}

	/**
	 * Register a module in Artibot
	 * @param {Module|function(Artibot): Module} module - The module to register or a function to initialize the module 
	 */
	registerModule = (module) => {
		if (typeof module == "function") module = module(this);
		this.modules.push(module);
		log("Artibot", this.localizer._("Registered module: ") + module.name, "info", true);

		if (module.langs != "any" && !module.langs.includes(this.config.lang)) {
			log("Artibot", this.localizer.__(" -> This module does not support the [[0]] language!", {placeholders: [this.config.lang]}), "warn", true);
		}

		for (const part of module.parts) {
			log("Artibot", `- [${part.type}] ${part.id}`, "log", true);
		}
	}

	/**
	 * Get latest release version of a GitHub repository
	 * @param {string} [repo="Artivain/artibot"] - GitHub repository to get latest version
	 * @returns {string|false} Version number, or false if repo not found or an error happens
	 * @async
	 */
	checkForUpdates = async (repo = "Artivain/artibot") => {
		const request = await axios({
			method: "GET",
			url: `https://api.github.com/repos/${repo}/releases/latest`,
			responseType: "json",
			headers: {
				"User-Agent": "Artibot " + this.version
			},
			validateStatus: () => { return true }
		});

		if (request.status != 200) return false;

		const { data } = request;
		return data.name.replace("v", "");
	}
}

/**
 * Base class for Artibot modules
 */
export class Module {
	/**
	 * Any module part type.
	 * @typedef {Command|SlashCommand} ModulePartResolvable
	 */

	/**
	 * @param {Object} config - Configuration for the module
	 * @param {string} config.name - Name of the module
	 * @param {string} config.id - ID of this module
	 * @param {string} config.version - Version of the module (ex.: "1.2.3")
	 * @param {string[]|"any"} [config.langs] - List of supported languages (ex.: ["en", "fr"]). If this does not apply, set to "any".
	 * @param {ModulePartResolvable[]} config.parts - List of parts of the module
	 * @param {IntentsResolvable[]} [config.intents] - List of required intents
	 * @param {string} [config.repo] - GitHub repository of the module (ex.: "Artivain/artibot")
	 */
	constructor({ name, id, version, langs = "any", parts, intents = [], repo }) {
		if (!name || !id || !version || !langs || !parts) throw new Error("Missing module informations!");
		this.name = name;
		this.id = id;
		this.version = version;
		this.langs = langs;
		this.parts = parts;
		this.additionalIntents = intents;
		this.repo = repo;
	}
}

/**
 * Base class for module parts
 */
class BasePart {
	/**
	 * @param {Object} config - Config for this part
	 * @param {string} config.id - ID of the part
	 * @param {string} config.type - Type of the part
	 * @param {function(): void} config.mainFunction - The function when the part is executed
	 * @param {function(): void} [config.initFunction] - The function executed on bot startup
	 */
	constructor({ id, type, mainFunction, initFunction }) {
		if (!id || !type || !mainFunction) throw new Error("Missing parameter(s)");

		this.id = id;
		this.type = type;
		this.execute = mainFunction;
		this.init = initFunction;
	}
}

/**
 * Command part for a module
 * @extends BasePart
 */
export class Command extends BasePart {
	/**
	 * @param {Object} config - Config for the command
	 * @param {string} config.id - ID of the command
	 * @param {string} config.name - Name of the command
	 * @param {string} [config.description] - Description of the command
	 * @param {string[]} [config.aliases] - List of alternative names
	 * @param {string} [config.usage] - Help text for the usage
	 * @param {number} [config.cooldown] - Cooldown for this command usage, in seconds
	 * @param {boolean} [config.ownerOnly=false] - If the command can only be executed by the owner
	 * @param {boolean} [config.guildOnly=false] - If the command can only be executed in a guild
	 * @param {Permissions} [config.permissions] - Required permissions
	 * @param {boolean} [config.requiresArgs=false] - Set to true if the command needs at least one argument
	 * @param {function(Message, string[], Artibot): void} config.mainFunction - Function to execute when the command is ran
	 * @param {function(Artibot): void} [config.initFunction] - Function executed on bot startup
	 */
	constructor({ id, name, description, aliases = [], usage, cooldown, ownerOnly = false, guildOnly = false, permissions, requiresArgs = false, mainFunction, initFunction }) {
		super({ id, type: "command", mainFunction, initFunction });
		this.name = name;
		this.description = description;
		this.aliases = aliases;
		this.usage = usage;
		this.cooldown = cooldown;
		this.ownerOnly = ownerOnly;
		this.guildOnly = guildOnly;
		this.permissions = permissions;
		this.args = requiresArgs;
	}
}

/**
 * Slash command part for a module
 * @extends BasePart
 */
export class SlashCommand extends BasePart {
	/**
	 * @param {Object} config - Config for this command
	 * @param {string} config.id - ID of the command
	 * @param {SlashCommandBuilder} config.data - Data to register into the Discord API
	 * @param {number} [config.cooldown=1] - Cooldown per user for this command, in seconds
	 * @param {function(Interaction, Artibot): void} config.mainFunction - Function to execute when the command is ran
	 * @param {function(Artibot): void} [config.initFunction] - Function executed on bot startup
	 */
	constructor({ id, data, cooldown = 1, mainFunction, initFunction }) {
		if (!data) throw new Error("Missing data parameter");
		super({ id, type: "slashcommand", mainFunction, initFunction });
		this.data = data;
		this.cooldown = cooldown;
	}
}

export class Embed extends MessageEmbed {
	/**
	 * @param {Artibot} artibot
	 * @param {MessageEmbed|MessageEmbedOptions|APIEmbed} [data]
	 */
	constructor(artibot, data) {
		super(data);
		this.setColor(artibot.config.embedColor);
		this.setFooter({ text: artibot.config.botName, iconURL: artibot.config.botIcon });
		this.setTimestamp();
	}
}

/**
 * Log message to console, with proper coloring and prefix.
 *
 * @author Artivain
 * @since v1.5.3
 * @param {string} name Name of the module sending the log.
 * @param {string} msg Message to send.
 * @param {("log"|"warn"|"err"|"debug"|"info")} [type="log"] Type of message.
 * @param {boolean} [isCore=false] Is this message sent from the core? Probably not.
 */
export const log = (name, msg, type, isCore) => logger(name, msg, type, isCore);