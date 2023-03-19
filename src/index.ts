import InteractionManager from "./interactionManager.js";
import { log } from "./logger.js";
import Localizer from "artibot-localizer";
import chalk from "chalk";
import figlet from "figlet";
import * as discord from "discord.js";
import { createRequire } from 'module';
import coreModule from "./core/index.js";
import { readdirSync } from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { ArtibotConfig, ArtibotConfigBuilder } from "./config.js";
import { ContributorList } from "./types.js";
import { Module } from "./modules.js";
import Embed from "./embed.js";

export * from "./modules.js";
export * from "./logger.js";
export * from "./types.js";
export * from "./interactionManager.js";
export * from "./config.js";
export * from "./embed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const { version }: { version: string } = require('../package.json');

/**
 * Powerful Discord bot system.
 * @author Artivain <info@artivain.com>
 * @author Thomas Fournier <thomas@artivain.com>
 * @see https://github.com/Artivain/artibot
 * @see https://artibot.artivain.com
 * @license GPL-3.0-or-later
 */
export class Artibot {
	/** Localizer using the default strings for Artibot */
	localizer: Localizer = new Localizer({
		filePath: path.join(__dirname, "../locales.json")
	});
	/** Stores the Artibot config object */
	config: ArtibotConfig;
	/** Version of Artibot */
	version: string = version;
	/** Store cooldowns for the commands */
	cooldowns: discord.Collection<string, discord.Collection<discord.Snowflake, number>> = new discord.Collection();
	/** Registered modules */
	modules: discord.Collection<string, Module> = new discord.Collection();
	/** Discord.js client */
	client?: discord.Client;
	/** @todo */
	listeners: any[] = [];
	interactionManager?: InteractionManager;
	/** The token to login into Discord */
	#token: string = "";
	/** Lists of people who contributed to the Artibot */
	readonly contributors: ContributorList = require("../contributors.json");
	/**
	 * @deprecated Please directly use the exported {@link log} directly
	 */
	log = log;

	/**
	 * @param config - Configuration object for Artibot, use {@link ArtibotConfigBuilder} to make this easily.
	 */
	constructor(config: Partial<ArtibotConfig>) {
		const { ownerId, testGuildId, lang = "en" } = config;

		// Verify that the owner ID is set
		if (!ownerId) throw new Error("You must set the owner ID.");

		// Verify that the test guild ID is set
		if (!testGuildId) throw new Error("You must set the test guild ID.");

		// Create a localizer for the core
		this.localizer.setLocale(lang);

		// Store config
		this.config = config as ArtibotConfig;

		// Send artwork to console
		console.log(chalk.blue(figlet.textSync('Artibot', {
			font: 'ANSI Shadow',
			horizontalLayout: 'fitted'
		})));
		log("Artibot", this.localizer._("Initialized!") + " v" + version, "info", true);

		// Register the Core module
		this.registerModule(coreModule);
	}

	/**
	 * Create an embed
	 * @method
	 */
	public createEmbed = (data?: discord.EmbedData): discord.EmbedBuilder => {
		return new Embed(this.config, data);
	}

	/**
	 * @param config - Advanced config for the bot
	 * @param config.token - The login token for the Discord bot
	 * @param config.additionalIntents - Additional intents to register in the Discord client
	 * @method
	 * @async
	 */
	public readonly login = async ({ token = this.#token, additionalIntents = [] }: { token: string, additionalIntents?: discord.IntentsBitField[] }): Promise<void> => {
		if (!token) throw new Error("Token not set!");
		this.#token = token;
		const moduleIntents: discord.IntentsBitField[] = [];
		this.modules.forEach(module => module.additionalIntents.forEach(intent => moduleIntents.push(intent)));
		const intents = [...new Set([
			[
				discord.GatewayIntentBits.Guilds,
				discord.GatewayIntentBits.GuildMessages,
				discord.GatewayIntentBits.GuildMembers,
				discord.GatewayIntentBits.GuildPresences,
				discord.GatewayIntentBits.MessageContent
			],
			...additionalIntents,
			...moduleIntents
		])];
		this.client = new discord.Client({ intents });

		log("Artibot", this.localizer._("Loading event listeners..."), "log", true);
		const eventFiles = readdirSync(path.join(__dirname, "events")).filter(file => file.endsWith(".js"));

		for (const file of eventFiles) {
			const { name, execute, once } = await import(`./events/${file}`);
			if (once) {
				this.client.once(name, (...args) => execute(...args, this));
			} else {
				this.client.on(name, async (...args) => await execute(...args, this));
			}
		}

		this.client.login(token);
	}

	/**
	 * Register a module in Artibot
	 * @param module - The module to register or a function to initialize the module
	 * @param config - Custom configuration for the module. See module documentation to learn more.
	 * @method
	 */
	public readonly registerModule = (module: Module | ((artibot: Artibot, config: any) => Module), config: any = {}): void => {
		if (typeof module == "function") {
			try {
				module = module(this, config);
			} catch (err) {
				log("Artibot", this.localizer._("Error when registering module: ") + err, "err", true);
				process.exit(1);
			}
		}

		this.modules.set(module.id, module);

		log("Artibot", this.localizer._("Registered module: ") + module.name, "info", true);

		if (module.langs != "any" && !module.langs.includes(this.config.lang)) {
			log("Artibot", this.localizer.__(" -> This module does not support the [[0]] language!", { placeholders: [this.config.lang] }), "warn", true);
		}

		for (const part of module.parts) {
			log("Artibot", `- [${part.constructor.name}] ${part.id}`, "log", true);
		}

		if (Object.entries(config).length !== 0) {
			this.config[module.id] = config;
			log("Artibot", this.localizer.__("Custom configuration for [[0]] saved.", { placeholders: [module.name] }), "log", true);
		}
	}

	/**
	 * Get latest release version of a GitHub repository
	 * @param repo - GitHub repository to get latest version
	 * @returns Version number, or false if repo not found or an error happens
	 * @method
	 * @async
	 */
	public readonly checkForUpdates = async (repo: string = "Artivain/artibot"): Promise<string | false> => {
		const request = await axios({
			method: "GET",
			url: `https://api.github.com/repos/${repo}/releases/latest`,
			responseType: "json",
			headers: {
				"User-Agent": "Artibot/" + this.version
			},
			validateStatus: () => true
		});

		if (request.status != 200) return false;

		const { data } = request;
		return data.name.replace("v", "");
	}

	/**
	 * Get latest release version of a NPM package
	 * @param packageName - Package name on NPM
	 * @returns Version number, or false if package not found or an error happens
	 * @method
	 * @async
	 */
	public readonly checkForPackageUpdates = async (packageName: string = "artibot"): Promise<string | false> => {
		const request = await axios({
			method: "GET",
			url: `https://api.npms.io/v2/package/${packageName}`,
			responseType: "json",
			headers: {
				"User-Agent": "Artibot/" + this.version
			},
			validateStatus: () => true
		});

		if (request.status != 200) return false;

		const { data } = request;
		return data.collected.metadata.version;
	}
}

/** @ignore */
export default Artibot;