import InteractionManager from "./interactionManager.js";
import logger from "./logger.js";
import Localizer from "artibot-localizer";
import chalk from "chalk";
import figlet from "figlet";
import { Client, Intents, MessageEmbed } from "discord.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('./package.json');

import coreModule from "./core/index.js";
import { readdirSync } from "fs";

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
	 * @param {Snowflake} [config.testGuildId] - Discord ID of the testing guild. Not required if devMode is set to false.
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

		// Send artwork to console
		console.log(chalk.blue(figlet.textSync('Artibot', {
			font: 'ANSI Shadow',
			horizontalLayout: 'fitted'
		})));
		log("Artibot", "Initialized! v" + version, "info", true);

		/**
		 * List of registered modules
		 * @type {Module[]}
		 */
		this.modules = [];

		// Register the Core module
		this.registerModule(coreModule(this));
	}

	log = log;

	/**
	 * @param {Object} config - Advanced config for the bot
	 * @param {string} config.token - The login token for the Discord bot
	 * @param {IntentsResolvable[]} [config.additionalIntents] - Additional intents to register in the Discord client
	 */
	async login({ token, additionalIntents = [] }) {
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
	 * @param {Module} module - The module to register
	 */
	registerModule(module) {
		this.modules.push(module);
		log("Artibot", "Registered module: " + module.name, "info", true);
		module.parts.forEach(part => log("Artibot", `- [${part.type}] ${part.id}`, "log", true));
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
	 * @param {string} config.version - Version of the module (ex.: "1.2.3")
	 * @param {string[]} config.langs - List of supported languages (ex.: "en", "fr")
	 * @param {ModulePartResolvable[]} config.parts - List of parts of the module
	 * @param {IntentsResolvable[]} [config.intents] - List of required intents
	 */
	constructor({ name, version, langs, parts, intents = [] }) {
		this.name = name;
		this.version = version;
		this.langs = langs;
		this.parts = parts;
		this.additionalIntents = intents;
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
	 * @param {function(Message, string[], Artibot): void} config.mainFunction - Function to execute when the command is ran
	 * @param {function(Artibot): void} [config.initFunction] - Function executed on bot startup
	 */
	constructor({ id, name, description, aliases = [], usage, cooldown, mainFunction, initFunction }) {
		super({ id, type: "command", mainFunction, initFunction });
		this.name = name;
		this.description = description;
		this.aliases = aliases;
		this.usage = usage;
		this.cooldown = cooldown;
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
	 * @param {function(Interaction, Artibot): void} config.mainFunction - Function to execute when the command is ran
	 * @param {function(Artibot): void} [config.initFunction] - Function executed on bot startup
	 */
	constructor({ id, data, mainFunction, initFunction }) {
		if (!data) throw new Error("Missing data parameter");
		super({ id, type: "slashcommand", mainFunction, initFunction });
		this.data = data;
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