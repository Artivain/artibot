const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, testGuildId, devMode, disabledModules } = require("../config.json");
const token = require("../private.json").botToken;

// Depuis Discord.js v13, il est obligatoire de déclarer les intents

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
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
	}
}

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
	.filter(name => !disabledModules.includes(name));

// Enregistrer touts les global dans la collection

for (const folder of globalFolders) {
		const global = require(`../ab-modules/global/${folder}/index.js`);
		client.global.set(global.name, global);
}

/**********************************************************************/
// Initialisation des commandes par message

// Catégories de commandes (par dossier)

const commandFolders = fs.readdirSync("./ab-modules/commands", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => !disabledModules.includes(name));

// Enregistrer toutes les commandes dans la collection

for (const folder of commandFolders) {
	const commandFiles = fs
		.readdirSync(`./ab-modules/commands/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`../ab-modules/commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

/**********************************************************************/
// Initialisation des commandes slash

// Toutes les commandes slash

const slashCommands = fs.readdirSync("./ab-modules/slash-commands", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => !disabledModules.includes(name));

// Enregistrer les commandes slash dans la collection

for (const module of slashCommands) {
	const commandFiles = fs
		.readdirSync(`./ab-modules/slash-commands/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`../ab-modules/slash-commands/${module}/${commandFile}`);
		client.slashCommands.set(command.data.name, command);
	}
}

/**********************************************************************/
// Initialisation du menu sur les messages

const messageMenus = fs.readdirSync("./ab-modules/message-menus", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => !disabledModules.includes(name));

// Enregistrer le menu des messages dans la collection

for (const folder of messageMenus) {
	const files = fs
		.readdirSync(`./ab-modules/message-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of files) {
		const menu = require(`../ab-modules/message-menus/${folder}/${file}`);
		const keyName = `${folder.toUpperCase()} ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
	}
}

/**********************************************************************/
// Initialisation du menu sur les utilisateurs

const userMenus = fs.readdirSync("./ab-modules/user-menus", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => !disabledModules.includes(name));

// Enregistrer le menu des utilisateurs dans la collection

for (const folder of userMenus) {
	const files = fs
		.readdirSync(`./ab-modules/user-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of files) {
		const menu = require(`../ab-modules/user-menus/${folder}/${file}`);
		const keyName = `${folder.toUpperCase()} ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
	}
}

/**********************************************************************/
// Initialisation des commandes bouton

// Toutes les commandes bouton

const buttonCommands = fs.readdirSync("./ab-modules/buttons", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => !disabledModules.includes(name));

// Enregistrer toutes les commandes bouton dans la collection

for (const module of buttonCommands) {
	const commandFiles = fs
		.readdirSync(`./ab-modules/buttons/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`../ab-modules/buttons/${module}/${commandFile}`);
		client.buttonCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Initialisation des commandes menu select

// Toutes les commandes menu select

const selectMenus = fs.readdirSync("./ab-modules/select-menus", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => !disabledModules.includes(name));

// Enregistrer les comamndes menu select dans la collection

for (const module of selectMenus) {
	const commandFiles = fs
		.readdirSync(`./ab-modules/select-menus/${module}`)
		.filter((file) => file.endsWith(".js"));
	for (const commandFile of commandFiles) {
		const command = require(`../ab-modules/select-menus/${module}/${commandFile}`);
		client.selectCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Initialisation des commandes slash dans l'API Discord

const rest = new REST({ version: "9" }).setToken(token);

const commandJsonData = [
	...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
	...Array.from(client.contextCommands.values()).map((c) => c.data),
];

(async () => {
	try {
		console.log("Initialisation des commandes slash...");

		/**
			Ici on envoit à Discord les comamndes slash.
			Il y a 2 types de comamndes, les "guild" et les "global".
			"Guild" pour les commandes par serveur et "global" pour les commandes globales.
			En développement, utiliser seulement des commandes "guild" puisqu'elles peuvent se rafraichir
			instantanéments, alors que les commandes globales peuvent prendre jusqu'à 1 heure.
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
			)
		};

		console.log("Commandes slash activées avec succès.");
	} catch (error) {
		console.error(error);
	}
})();

/**********************************************************************/
// Initialisation des triggers

// Catégories de triggers (par dossier)

const triggerFolders = fs.readdirSync("./ab-modules/triggers", { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name)
	.filter(name => !disabledModules.includes(name));

// Enregistrer les comamndes dans la collection

for (const folder of triggerFolders) {
	const triggerFiles = fs
		.readdirSync(`./ab-modules/triggers/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of triggerFiles) {
		const trigger = require(`../ab-modules/triggers/${folder}/${file}`);
		client.triggers.set(trigger.name, trigger);
	}
}

// Connection à l'API Discord avec le bot

client.login(token);
