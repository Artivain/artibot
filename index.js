import InteractionManager from "./interactionManager.js";
import logger from "./logger.js";
import Localizer from "artibot-localizer";
import chalk from "chalk";
import figlet from "figlet";
import * as discord from "discord.js";
import { createRequire } from 'module';
import coreModule from "./core/index.js";
import { readdirSync } from "fs";
import axios from "axios";
import { SlashCommandBuilder } from "@discordjs/builders";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

/**
 * Powerful Discord bot system.
 * @author Artivain <info@artivain.com>
 * @author Thomas Fournier <thomas@artivain.com>
 * @see https://github.com/Artivain/artibot
 * @license GPL-3.0-or-later
 */
export class Artibot {
	/**
	 * @param {Object} config - Configuration for Artibot
	 * @param {Snowflake} config.ownerId - Discord ID of the owner of the bot
	 * @param {Snowflake} config.testGuildId - Discord ID of the testing guild
	 * @param {string} [config.botName="Artibot"] - Name of the Discord bot. Used almost everywhere.
	 * @param {string} [config.botIcon="https://assets.artivain.com/fav/bots/artibot-512.png"] - URL of the profile picture of the bot
	 * @param {string} [config.prefix="ab "] - Prefix for the commands
	 * @param {boolean} [config.devMode=true] - Set to false if the bot must be used in more than one server. Interactions could take more time to refresh.
	 * @param {string} [config.lang="en"] - Set the lang of the bot
	 * @param {string} [config.embedColor="#06476d"] - Color for the embeds sent by the bot
	 * @param {boolean} [config.advancedCorePing=true] - Set to false if you want to hide advanced infos from ping commands
	 * @param {boolean} [config.checkForUpdates=true] - Set to false if you don't want the bot to check for new updates
	 * @param {boolean} [config.debug=false] - Set to true to show debug messages in console
	 */
	constructor({
		ownerId,
		testGuildId,
		botName = "Artibot",
		botIcon = "https://assets.artivain.com/fav/bots/artibot-512.png",
		prefix = "ab ",
		devMode = true,
		lang = "en",
		embedColor = "#06476d",
		advancedCorePing = true,
		checkForUpdates = true,
		debug = false
	}) {
		// Verify that the owner ID is set
		if (!ownerId) throw new Error("You must set the owner ID.");

		// Verify that the test guild ID is set
		if (!testGuildId) throw new Error("You must set the test guild ID.");

		// Verify that if dev mode is false, the test guild ID is set
		if (!devMode && !testGuildId) throw new Error("You must set the testGuildId if devMode is false.");

		// Create a localizer for the core
		this.localizer = new Localizer({
			filePath: path.join(__dirname, "locales.json"),
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
			checkForUpdates,
			debug
		}

		this.version = version;

		/**
		 * Store cooldowns for commands
		 * @type {discord.Collection<string, discord.Collection<Snowflake, number>>}
		 */
		this.cooldowns = new discord.Collection();

		// Send artwork to console
		console.log(chalk.blue(figlet.textSync('Artibot', {
			font: 'ANSI Shadow',
			horizontalLayout: 'fitted'
		})));
		log("Artibot", this.localizer._("Initialized!") + " v" + version, "info", true);

		/**
		 * List of registered modules
		 * @type {discord.Collection.<string, Module>}
		 */
		this.modules = new discord.Collection();

		// Register the Core module
		this.registerModule(coreModule);
	}

	log = log;

	/**
	 * Create an embed
	 * @param {discord.MessageEmbed|discord.MessageEmbedOptions|discord.APIEmbed} [data]
	 * @returns {Embed} Preconfigured embed
	 * @method
	 */
	createEmbed = (data) => {
		return new Embed(this, data);
	}

	/**
	 * Contributor informations
	 * @typedef {{name: string, github: string, discordId: Snowflake|null, discordTag: string|null}} Contributor
	 */

	/**
	 * List of contributors
	 * @typedef {{devs: Contributor[], contributors: Contributor[]}} ContributorList
	 */

	/**
	 * Lists of people who contributed to the Artibot
	 * @type {ContributorList}
	 */
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
		const moduleIntents = [];
		this.modules.forEach(module => module.additionalIntents.forEach(intent => moduleIntents.push(intent)));
		const intents = [...new Set([
			[
				discord.Intents.FLAGS.GUILDS,
				discord.Intents.FLAGS.GUILD_MESSAGES,
				discord.Intents.FLAGS.GUILD_MEMBERS,
				discord.Intents.FLAGS.GUILD_PRESENCES
			],
			...additionalIntents,
			...moduleIntents
		])];
		this.client = new discord.Client({ intents });

		this.listeners = [];

		/** @type {InteractionManager} */
		this.interactionManager;

		log("Artibot", this.localizer._("Loading event listeners..."), "log", true);
		const eventFiles = readdirSync(path.join(__dirname, "events")).filter(file => file.endsWith(".js"));

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
	 * @param {Object} [config] - Custom configuration for the module. See module documentation to learn more.
	 * @method
	 */
	registerModule = (module, config = {}) => {
		if (typeof module == "function") {
			try {
				module = module(this);
			} catch (err) {
				this.log("Artibot", this.localizer._("Error when registering module: ") + err, "err", true);
				process.exit(1);
			}
		}

		this.modules.set(module.id, module);

		log("Artibot", this.localizer._("Registered module: ") + module.name, "info", true);

		if (module.langs != "any" && !module.langs.includes(this.config.lang)) {
			log("Artibot", this.localizer.__(" -> This module does not support the [[0]] language!", { placeholders: [this.config.lang] }), "warn", true);
		}

		for (const part of module.parts) {
			log("Artibot", `- [${part.type}] ${part.id}`, "log", true);
		}

		if (Object.entries(config).length !== 0) {
			this.config[module.id] = config;
			log("Artibot", this.localizer.__("Custom configuration for [[0]] saved.", { placeholders: [module.name] }), "log", true);
		}
	}

	/**
	 * Get latest release version of a GitHub repository
	 * @param {string} [repo="Artivain/artibot"] - GitHub repository to get latest version
	 * @returns {Promise.<string|false>} Version number, or false if repo not found or an error happens
	 * @method
	 */
	checkForUpdates = async (repo = "Artivain/artibot") => {
		const request = await axios({
			method: "GET",
			url: `https://api.github.com/repos/${repo}/releases/latest`,
			responseType: "json",
			headers: {
				"User-Agent": "Artibot/" + this.version
			},
			validateStatus: () => { return true }
		});

		if (request.status != 200) return false;

		const { data } = request;
		return data.name.replace("v", "");
	}
}

/** @ignore */
export default Artibot;

/**
 * Base class for Artibot modules
 */
export class Module {
	/**
	 * Any module part type.
	 * @typedef {Command|SlashCommand|Button|MessageContextMenuOption|UserContextMenuOption|TriggerGroup|Global} ModulePartResolvable
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
	 * @param {function(): void|Promise<void>} config.mainFunction - The function when the part is executed
	 * @param {function(): void|Promise<void>} [config.initFunction] - The function executed on bot startup
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
	 * @param {boolean} [config.ownerOnly=false] - If the command can only be executed by the owner of the bot
	 * @param {boolean} [config.guildOnly=false] - If the command can only be executed in a guild
	 * @param {discord.Permissions} [config.permissions] - Required permissions
	 * @param {boolean} [config.requiresArgs=false] - Set to true if the command needs at least one argument
	 * @param {function(Message, string[], Artibot): void|Promise<void>} config.mainFunction - Function to execute when the command is ran
	 * @param {function(Artibot): void|Promise<void>} [config.initFunction] - Function executed on bot startup
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
	 * @param {function(discord.CommandInteraction, Artibot): void|Promise<void>} config.mainFunction - Function to execute when the command is ran
	 * @param {function(Artibot): void|Promise<void>} [config.initFunction] - Function executed on bot startup
	 */
	constructor({ id, data, cooldown = 1, mainFunction, initFunction }) {
		if (!data) throw new Error("Missing data parameter");
		super({ id, type: "slashcommand", mainFunction, initFunction });
		this.data = data;
		this.cooldown = cooldown;
	}
}

/**
 * Button interaction part for a module
 * @extends BasePart
 */
export class Button extends BasePart {
	/**
	 * @param {Object} config - Config for this button
	 * @param {string} config.id - ID of the button. Supports asterix ("*") for wildcard.
	 * @param {function(discord.ButtonInteraction, Artibot): void|Promise<void>} config.mainFunction - Function to execute when the button is clicked
	 * @param {function(Artibot): void|Promise<void>} [config.initFunction] - Function executed on bot startup
	 */
	constructor({ id, mainFunction, initFunction }) {
		super({ id, type: "button", mainFunction, initFunction });
	}
}

/**
 * Message context menu option part for a module
 * @extends BasePart
 */
export class MessageContextMenuOption extends BasePart {
	/**
	 * @param {Object} config - Config for this context menu option
	 * @param {string} config.id - ID of this option
	 * @param {string} config.name - Name of this option
	 * @param {function(discord.MessageContextMenuInteraction, Artibot): void|Promise<void>} config.mainFunction - Function to execute when the menu option is clicked
	 * @param {function(Artibot): void|Promise<void>} config.initFunction - Function executed on bot startup
	 */
	constructor({ id, name, mainFunction, initFunction }) {
		if (!name) throw new Error("Missing name parameter!");
		super({ id, type: "messagemenu", mainFunction, initFunction });
		this.data = {
			name,
			type: 3 // 3 is for message context menu
		}
	}
}

/**
 * User context menu option part for a module
 * @extends BasePart
 */
export class UserContextMenuOption extends BasePart {
	/**
	 * @param {Object} config - Config for this context menu option
	 * @param {string} config.id - ID of this option
	 * @param {string} config.name - Name of this option
	 * @param {function(discord.UserContextMenuInteraction, Artibot): void|Promise<void>} config.mainFunction - Function to execute when the menu option is clicked
	 * @param {function(Artibot): void|Promise<void>} config.initFunction - Function executed on bot startup
	 */
	constructor({ id, name, mainFunction, initFunction }) {
		if (!name) throw new Error("Missing name parameter!");
		super({ id, type: "usermenu", mainFunction, initFunction });
		this.data = {
			name,
			type: 2 // 2 is for user context menus
		}
	}
}

/**
 * Select menu option part for a module
 * @extends BasePart
 */
export class SelectMenuOption extends BasePart {
	/**
	 * @param {Object} config - Config for this menu option
	 * @param {string} config.id - ID of this option
	 * @param {function(discord.SelectMenuInteraction, Artibot): void|Promise<void>} config.mainFunction - Function executed when this option is selected
	 * @param {function(Artibot): void|Promise<void>} config.initFunction - Function executed on bot startup
	 */
	constructor({ id, mainFunction, initFunction }) {
		super({ id, type: "selectmenu", mainFunction, initFunction });
	}
}

export class TriggerGroup extends BasePart {
	/**
	 * @param {Object} config - Config for this trigger group
	 * @param {string} config.id - ID of this trigger group
	 * @param {Array<string|RegExp>} config.triggers - List of triggers
	 * @param {function(discord.Message, string|RegExp, Artibot): void|Promise<void>} config.mainFunction - Function executed on trigger found
	 * @param {function(Artibot): void|Promise<void>} config.initFunction - Function executed on bot startup
	 */
	constructor({ id, triggers, mainFunction, initFunction }) {
		if (!triggers || !triggers.length) throw new Error("Triggers cannot be empty!");

		super({ id, type: "trigger", mainFunction, initFunction });

		/**
		 * List of triggers
		 * @type {Array<string|RegExp>}
		 */
		this.triggers = triggers;
	}
}

/**
 * Global part for a module
 * - Special part which is not managed by a event handler and only ran at startup
 * @extends BasePart
 */
export class Global extends BasePart {
	/**
	 * @param {Object} config - Config for this global
	 * @param {string} config.id - ID of this global
	 * @param {function(Artibot): void|Promise<void>} config.mainFunction - Function executed on bot startup
	 */
	constructor({ id, mainFunction }) {
		super({ id, type: "global", mainFunction });
		this.init = mainFunction;
	}
}

export class Embed extends discord.MessageEmbed {
	/**
	 * @param {Artibot} artibot
	 * @param {discord.MessageEmbed|discord.MessageEmbedOptions|discord.APIEmbed} [data]
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
 * @ignore
 * @author Artivain
 * @since v1.5.3
 * @param {string} name Name of the module sending the log.
 * @param {string} msg Message to send.
 * @param {("log"|"warn"|"err"|"debug"|"info")} [type="log"] Type of message.
 * @param {boolean} [isCore=false] Is this message sent from the core? Probably not.
 */
export const log = (name, msg, type, isCore) => logger(name, msg, type, isCore);