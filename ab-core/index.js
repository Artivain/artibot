const slashManager = require("./slashManager");
const { checkUpdates } = require("./updater");
const { log } = require("./logger");

try {
	var fs = require("fs");
	var { Client, Collection, Intents } = require("discord.js");
	var chalk = require("chalk");
	var figlet = require("figlet");
} catch (error) {
	if (error.code !== 'MODULE_NOT_FOUND') {
		// Re-throw not "Module not found" errors
		throw error;
	} else {
		log("Artibot", "Erreur de configuration: Les modules Node.js ne sont pas installés correctement.", "err", true);
		process.exit(1);
	};
};

console.log(chalk.blue(figlet.textSync('Artibot', {
	font: 'ANSI Shadow',
	horizontalLayout: 'fitted'
})));

try { var { clientId, testGuildId, enabledModules } = require("../config.json"); } catch (error) {
	if (error.code !== 'MODULE_NOT_FOUND') {
		// Re-throw not "Module not found" errors 
		throw error;
	} else {
		log("Artibot", "Erreur de configuration: Le fichier config.json est introuvable.", "err", true);
		process.exit(1);
	};
};

try { var token = require("../private.json").botToken; } catch (error) {
	if (error.code !== 'MODULE_NOT_FOUND') {
		// Re-throw not "Module not found" errors 
		throw error;
	} else {
		log("Artibot", "Erreur de configuration: Le fichier private.json est introuvable.", "err", true);
		process.exit(1);
	};
};

if (!token) {
	log("Artibot", "Erreur de configuration: Le fichier private.json est invalide.", "err", true);
	process.exit(1);
};

if (!clientId || !testGuildId || !enabledModules) {
	log("Artibot", "Erreur de configuration: Le fichier config.json est invalide.", "err", true);
	process.exit(1);
};

// Depuis Discord.js v13, il est obligatoire de déclarer les intents

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES],
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
// Définir les collections des commandes, commandes slash et cooldowns

client.commands = new Collection();
client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.selectCommands = new Collection();
client.contextCommands = new Collection();
client.cooldowns = new Collection();
client.triggers = new Collection();
client.global = new Collection();

/**********************************************************************/
// Initialisation des global

// Catégories des global (par dossier)

const globalFolders = fs.readdirSync("./ab-modules/global", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer touts les global dans la collection

for (const folder of globalFolders) {
	const global = require(`../ab-modules/global/${folder}/index.js`);
	client.global.set(global.name, global);
};

/**********************************************************************/
// Initialisation des commandes par message

// Catégories de commandes (par dossier)

const commandFolders = fs.readdirSync("./ab-modules/commands", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer toutes les commandes dans la collection

log("CommandManager", "Activation des commandes:", "info", true);

for (const folder of commandFolders) {
	log("CommandManager", " - Activation du module " + folder, "log", true);
	const commandFiles = fs
		.readdirSync(`./ab-modules/commands/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`../ab-modules/commands/${folder}/${file}`);
		client.commands.set(command.name, command);
		log("CommandManager", "   - " + command.name, "log", true);
	};
};

if (client.commands.size == 0) log("CommandManager", "Aucun module à charger.", "log", true);

/**********************************************************************/
// Initialisation des commandes slash

// Toutes les commandes slash

const slashCommands = fs.readdirSync("./ab-modules/slash-commands", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer les commandes slash dans la collection

log("SlashManager", "Activation des commandes slash:", "info", true);

for (const module of slashCommands) {
	log("SlashManager", " - Activation du module " + module, "log", true);
	const commandFiles = fs
		.readdirSync(`./ab-modules/slash-commands/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`../ab-modules/slash-commands/${module}/${commandFile}`);
		client.slashCommands.set(command.data.name, command);
		log("SlashManager", "   - " + command.data.name, "log", true);
	};
};

if (client.slashCommands.size == 0) log("SlashManager", "Aucun module à charger.", "log", true);

/**********************************************************************/
// Initialisation du menu sur les messages

const messageMenus = fs.readdirSync("./ab-modules/message-menus", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer le menu des messages dans la collection

log("InteractionManager", "Activation du menu contextuel sur les messages:", "info", true);

for (const folder of messageMenus) {
	log("InteractionManager", " - Activation du module " + folder, "log", true);
	const files = fs
		.readdirSync(`./ab-modules/message-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));

	for (const file of files) {
		const menu = require(`../ab-modules/message-menus/${folder}/${file}`);
		const keyName = `MESSAGE ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
		log("InteractionManager", "   - " + menu.data.name, "log", true);
	};
};

const interactionAmmount = client.contextCommands.size;

if (interactionAmmount == 0) log("InteractionManager", "Aucun module à charger.", "log", true);

/**********************************************************************/
// Initialisation du menu sur les utilisateurs

const userMenus = fs.readdirSync("./ab-modules/user-menus", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer le menu des utilisateurs dans la collection

log("InteractionManager", "Activation du menu contextuel sur les utilisateurs:", "info", true);

for (const folder of userMenus) {
	log("InteractionManager", " - Activation du module " + folder, "log", true);
	const files = fs
		.readdirSync(`./ab-modules/user-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of files) {
		const menu = require(`../ab-modules/user-menus/${folder}/${file}`);
		const keyName = `USER ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
		log("InteractionManager", "   - " + menu.data.name, "log", true);
	};
};

if (interactionAmmount == client.contextCommands.size) log("InteractionManager", "Aucun module à charger.", "log", true);

/**********************************************************************/
// Initialisation des bouton

// Tous les bouton

const buttonCommands = fs.readdirSync("./ab-modules/buttons", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer tous les boutons dans la collection

log("ButtonManager", "Activation des boutons:", "info", true);

for (const module of buttonCommands) {
	log("ButtonManager", " - Activation du module " + module, "log", true);
	const commandFiles = fs
		.readdirSync(`./ab-modules/buttons/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`../ab-modules/buttons/${module}/${commandFile}`);
		client.buttonCommands.set(command.id, command);
		log("ButtonManager", "   - " + command.id, "log", true);
	};
};

if (client.buttonCommands.size == 0) log("ButtonManager", "Aucun module à charger.", "log", true);

/**********************************************************************/
// Initialisation des menu déroulants

// Tous les menus déroulants

const selectMenus = fs.readdirSync("./ab-modules/select-menus", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer les menus déroulants dans la collection

log("ButtonManager", "Activation des menus déroulants:", "info", true);

for (const module of selectMenus) {
	log("ButtonManager", " - Activation du module " + module, "log", true);
	const commandFiles = fs
		.readdirSync(`./ab-modules/select-menus/${module}`)
		.filter((file) => file.endsWith(".js"));
	for (const commandFile of commandFiles) {
		const command = require(`../ab-modules/select-menus/${module}/${commandFile}`);
		client.selectCommands.set(command.id, command);
		log("ButtonManager", "   - " + command.id, "log", true);
	};
};

if (client.selectCommands.size == 0) log("ButtonManager", "Aucun module à charger.", "log", true);

/**********************************************************************/
// Initialisation des triggers

// Catégories de triggers (par dossier)

const triggerFolders = fs.readdirSync("./ab-modules/triggers", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => enabledModules.includes(name) || name == "core");

// Enregistrer les triggers dans la collection

log("TriggerManager", "Activation des triggers:", "info", true);

for (const folder of triggerFolders) {
	log("TriggerManager", " - Activation du module " + folder, "log", true);
	const triggerFiles = fs
		.readdirSync(`./ab-modules/triggers/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of triggerFiles) {
		const trigger = require(`../ab-modules/triggers/${folder}/${file}`);
		client.triggers.set(trigger.name, trigger);
		log("TriggerManager", "   - " + trigger.name, "log", true);
	};
};

if (client.triggers.size == 0) log("TriggerManager", "Aucun module à charger.", "log", true);

// Connection à l'API Discord avec le bot

client.login(token);

// Vérifier si une mise à jour existe sur le repo GitHub
checkUpdates().then(response => {
	if (response.upToDate) {
		log("Updater", `Artibot est à jour (v${response.currentVersion}).`, "log", true);
	} else {
		log("Updater", `Une mise à jour est disponible pour Artibot!`, "warn", true);
		log("Updater", ` - Version actuelle: ${response.currentVersion}`, "info", true);
		log("Updater", ` - Dernière version: ${response.remoteVersion}`, "info", true);
	};
});

/**********************************************************************/
// Initialisation des commandes slash dans l'API Discord

slashManager.init(token);
slashManager.generateData(client);
slashManager.register();