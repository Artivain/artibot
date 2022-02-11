const interactionManager = require("./interactionManager");
const { checkUpdates } = require("./updater");
const { log } = require("./logger");
const Localizer = require("artibot-localizer");
const loader = require("./loader");

const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const chalk = require("chalk");
const figlet = require("figlet");
const path = require("path");

console.log(chalk.blue(figlet.textSync('Artibot', {
	font: 'ANSI Shadow',
	horizontalLayout: 'fitted'
})));

// Initialize localizer
const localizer = new Localizer({
	filePath: path.resolve(__dirname, "locales.json")
});

try {
	var config = require("../config.json");
	var { clientId, testGuildId, enabledModules } = config;
} catch (error) {
	if (error.code !== 'MODULE_NOT_FOUND') {
		// Re-throw not "Module not found" errors 
		throw error;
	} else {
		log("Artibot", localizer.translateWithPlaceholders("Configuration error: [[0]] file does not exist.", { placeholders: ["config.json"] }), "err", true);
		process.exit(1);
	};
};

// Set localizer lang with the config one
localizer.setLocale(config.locale);

try { var token = require("../private.json").botToken; } catch (error) {
	if (error.code !== 'MODULE_NOT_FOUND') {
		// Re-throw not "Module not found" errors 
		throw error;
	} else {
		log("Artibot", localizer.translateWithPlaceholders("Configuration error: [[0]] file does not exist.", { placeholders: ["private.json"] }), "err", true);
		process.exit(1);
	};
};

if (!token) {
	log("Artibot", localizer.translateWithPlaceholders("Configuration error: [[0]] file is invalid.", { placeholders: ["private.json"] }), "err", true);
	process.exit(1);
};

if (!clientId || !testGuildId || !enabledModules) {
	log("Artibot", localizer.translateWithPlaceholders("Configuration error: [[0]] file is invalid.", { placeholders: ["config.json"] }), "err", true);
	process.exit(1);
};

// Depuis Discord.js v13, il est obligatoire de déclarer les intents

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES
	]
});

/**********************************************************************/
// Gestion des events handler

const eventFiles = fs
	.readdirSync("./ab-core/events")
	.filter((file) => file.endsWith(".js"));

// Activer tous les fichiers lorsque requis
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(
			event.name,
			async (...args) => await event.execute(...args, client)
		);
	};
};

/**********************************************************************/
// Create collections

client.commands = new Collection();
client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.selectCommands = new Collection();
client.contextCommands = new Collection();
client.cooldowns = new Collection();
client.triggers = new Collection();
client.global = new Collection();

/**********************************************************************/
// Loading manifests

log("Loader", localizer.translate("Loading manifests..."), "log", true);
const manifests = loader.getManifests();
log("Loader", localizer.translateWithPlaceholders("Found [[0]] modules.", { placeholders: [manifests.length] }), "log", true);

// /**********************************************************************/
// // Initialisation des global

// // Catégories des global (par dossier)

// const globalFolders = fs.readdirSync("./ab-modules/global", { withFileTypes: true })
// 	.filter(dirent => dirent.isDirectory())
// 	.map(dirent => dirent.name)
// 	.filter(name => enabledModules.includes(name) || name == "core");

// // Enregistrer touts les global dans la collection

// for (const folder of globalFolders) {
// 	const global = require(`../ab-modules/global/${folder}/index.js`);
// 	client.global.set(global.name, global);
// };

/*****************************************/
/* Initialize commands                   */
/*****************************************/

log("CommandManager", localizer.translate("Activating commands:"), "info", true);

const commandsModules = manifests.filter(manifest => {
	for (const part of manifest.parts) if (part.type == "command") return true;
});

for (const module of commandsModules) {
	log("CommandManager", ` - ${localizer.translate("Activating module")} ${module.name}`, "log", true);
	if (!module.supportedLocales.includes(config.locale)) {
		log("CommandManager", localizer.__(" -> This module does not support the [[0]] language!", { placeholders: [config.locale] }), "warn", true);
	};
	const parts = module.parts.filter(part => part.type == "command");
	for (const part of parts) {
		const filePath = `../ab-modules/${module.id}/${part.path}`;
		const command = require(filePath);
		client.commands.set(command.name, { command, part, module });
		log("CommandManager", "   - " + command.name, "log", true);
	};
};

/*****************************************/
/* Initialize slash commands             */
/*****************************************/

log("SlashManager", localizer.translate("Activating slash commands:"), "info", true);

const slashModules = manifests.filter(manifest => {
	for (const part of manifest.parts) if (part.type == "slashcommand") return true;
});

for (const module of slashModules) {
	log("SlashManager", ` - ${localizer.translate("Activating module")} ${module.name}`, "log", true);
	if (!module.supportedLocales.includes(config.locale)) {
		log("SlashManager", localizer.__(" -> This module does not support the [[0]] language!", { placeholders: [config.locale] }), "warn", true);
	};
	const parts = module.parts.filter(part => part.type == "slashcommand");
	for (const part of parts) {
		const filePath = `../ab-modules/${module.id}/${part.path}`;
		const command = require(filePath);
		client.slashCommands.set(command.data.name, { command, part, module });
		log("SlashManager", "   - " + command.data.name, "log", true);
	};
};

if (client.commands.size == 0) log("SlashManager", localizer.translate("No module to activate."), "log", true);

/*****************************************/
/* Initialize messages menu              */
/*****************************************/

log("InteractionManager", localizer.translate("Activating context menu on messages:"), "info", true);

const messageMenuModules = manifests.filter(manifest => {
	for (const part of manifest.parts) if (part.type == "messagemenu") return true;
});

for (const module of messageMenuModules) {
	log("InteractionManager", ` - ${localizer.translate("Activating module")} ${module.name}`, "log", true);
	if (!module.supportedLocales.includes(config.locale)) {
		log("InteractionManager", localizer.__(" -> This module does not support the [[0]] language!", { placeholders: [config.locale] }), "warn", true);
	};
	const parts = module.parts.filter(part => part.type == "messagemenu");
	for (const part of parts) {
		const filePath = `../ab-modules/${module.id}/${part.path}`;
		const command = require(filePath);
		const keyName = `MESSAGE ${command.data.name}`;
		client.contextCommands.set(keyName, { command, part, module });
		log("InteractionManager", "   - " + command.data.name, "log", true);
	};
};

if (client.commands.size == 0) log("InteractionManager", localizer.translate("No module to activate."), "log", true);

/*****************************************/
/* Initialize users menu              */
/*****************************************/

log("InteractionManager", localizer.translate("Activating context menu on users:"), "info", true);

const userMenuModules = manifests.filter(manifest => {
	for (const part of manifest.parts) if (part.type == "usermenu") return true;
});

for (const module of userMenuModules) {
	log("InteractionManager", ` - ${localizer.translate("Activating module")} ${module.name}`, "log", true);
	if (!module.supportedLocales.includes(config.locale)) {
		log("InteractionManager", localizer.__(" -> This module does not support the [[0]] language!", { placeholders: [config.locale] }), "warn", true);
	};
	const parts = module.parts.filter(part => part.type == "usermenu");
	for (const part of parts) {
		const filePath = `../ab-modules/${module.id}/${part.path}`;
		const command = require(filePath);
		const keyName = `USER ${command.data.name}`;
		client.contextCommands.set(keyName, { command, part, module });
		log("InteractionManager", "   - " + command.data.name, "log", true);
	};
};

if (client.commands.size == 0) log("InteractionManager", localizer.translate("No module to activate."), "log", true);

// /**********************************************************************/
// // Initialisation du menu sur les utilisateurs

// const userMenus = fs.readdirSync("./ab-modules/user-menus", { withFileTypes: true })
// 	.filter(dirent => dirent.isDirectory())
// 	.map(dirent => dirent.name)
// 	.filter(name => enabledModules.includes(name) || name == "core");

// // Enregistrer le menu des utilisateurs dans la collection

// log("InteractionManager", localizer.translate("Activating context menu on users:"), "info", true);

// for (const folder of userMenus) {
// 	log("InteractionManager", ` - ${localizer.translate("Activating module")} ${folder}`, "log", true);
// 	const files = fs
// 		.readdirSync(`./ab-modules/user-menus/${folder}`)
// 		.filter((file) => file.endsWith(".js"));
// 	for (const file of files) {
// 		const menu = require(`../ab-modules/user-menus/${folder}/${file}`);
// 		const keyName = `USER ${menu.data.name}`;
// 		client.contextCommands.set(keyName, menu);
// 		log("InteractionManager", "   - " + menu.data.name, "log", true);
// 	};
// };

// if (interactionAmmount == client.contextCommands.size) log("InteractionManager", localizer.translate("No module to activate."), "log", true);

// /**********************************************************************/
// // Initialisation des bouton

// // Tous les bouton

// const buttonCommands = fs.readdirSync("./ab-modules/buttons", { withFileTypes: true })
// 	.filter(dirent => dirent.isDirectory())
// 	.map(dirent => dirent.name)
// 	.filter(name => enabledModules.includes(name) || name == "core");

// // Enregistrer tous les boutons dans la collection

// log("ButtonManager", localizer.translate("Activating buttons:"), "info", true);

// for (const module of buttonCommands) {
// 	log("ButtonManager", ` - ${localizer.translate("Activating module")} ${module}`, "log", true);
// 	const commandFiles = fs
// 		.readdirSync(`./ab-modules/buttons/${module}`)
// 		.filter((file) => file.endsWith(".js"));

// 	for (const commandFile of commandFiles) {
// 		const command = require(`../ab-modules/buttons/${module}/${commandFile}`);
// 		client.buttonCommands.set(command.id, command);
// 		log("ButtonManager", "   - " + command.id, "log", true);
// 	};
// };

// if (client.buttonCommands.size == 0) log("ButtonManager", localizer.translate("No module to activate."), "log", true);

// /**********************************************************************/
// // Initialisation des menu déroulants

// // Tous les menus déroulants

// const selectMenus = fs.readdirSync("./ab-modules/select-menus", { withFileTypes: true })
// 	.filter(dirent => dirent.isDirectory())
// 	.map(dirent => dirent.name)
// 	.filter(name => enabledModules.includes(name) || name == "core");

// // Enregistrer les menus déroulants dans la collection

// log("ButtonManager", localizer.translate("Activating select menus:"), "info", true);

// for (const module of selectMenus) {
// 	log("ButtonManager", ` - ${localizer.translate("Activating module")} ${module}`, "log", true);
// 	const commandFiles = fs
// 		.readdirSync(`./ab-modules/select-menus/${module}`)
// 		.filter((file) => file.endsWith(".js"));
// 	for (const commandFile of commandFiles) {
// 		const command = require(`../ab-modules/select-menus/${module}/${commandFile}`);
// 		client.selectCommands.set(command.id, command);
// 		log("ButtonManager", "   - " + command.id, "log", true);
// 	};
// };

// if (client.selectCommands.size == 0) log("ButtonManager", localizer.translate("No module to activate."), "log", true);

// /**********************************************************************/
// // Initialisation des triggers

// // Catégories de triggers (par dossier)

// const triggerFolders = fs.readdirSync("./ab-modules/triggers", { withFileTypes: true })
// 	.filter(dirent => dirent.isDirectory())
// 	.map(dirent => dirent.name)
// 	.filter(name => enabledModules.includes(name) || name == "core");

// // Enregistrer les triggers dans la collection

// log("TriggerManager", localizer.translate("Activating triggers:"), "info", true);

// for (const folder of triggerFolders) {
// 	log("TriggerManager", ` - ${localizer.translate("Activating module")} ${folder}`, "log", true);
// 	const triggerFiles = fs
// 		.readdirSync(`./ab-modules/triggers/${folder}`)
// 		.filter((file) => file.endsWith(".js"));
// 	for (const file of triggerFiles) {
// 		const trigger = require(`../ab-modules/triggers/${folder}/${file}`);
// 		client.triggers.set(trigger.name, trigger);
// 		log("TriggerManager", "   - " + trigger.name, "log", true);
// 	};
// };

// if (client.triggers.size == 0) log("TriggerManager", localizer.translate("No module to activate."), "log", true);

// Connection à l'API Discord avec le bot

client.login(token);

// Vérifier si une mise à jour existe sur le repo GitHub
checkUpdates().then(response => {
	if (response.upToDate) {
		log("Updater", localizer.translateWithPlaceholders("Artibot is up to date (v[[0]]).", { placeholders: [response.currentVersion] }), "info", true);
	} else {
		log("Updater", localizer.translate("An update for Artibot is available!"), "warn", true);
		log("Updater", localizer.translateWithPlaceholders(" - Installed version: [[0]]", { placeholders: [response.currentVersion] }), "info", true);
		log("Updater", localizer.translateWithPlaceholders(" - Latest version: [[0]]", { placeholders: [response.remoteVersion] }), "info", true);
	};
});

/**********************************************************************/
// Initialisation des commandes slash dans l'API Discord

/**********************************************/
/* Initialize slash commands in Discord's API */
/**********************************************/

interactionManager.init(token);
interactionManager.generateData(client);
interactionManager.register();