/**
 * @file Fichier principal du bot, gère les autres modules qui font les commandes et autres fonctions.
 * @author Artivain
 * @version 0.0.2
 */

// Declare constants which will be used throughout the bot.

const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, testGuildId, devMode } = require("./config.json");
const token = require("./private.json").botToken;

/**
 * Depuis Discord.js v13, il est obligatoire de déclarer les intents
 * @type {Object}
 * @description Discord.js client */

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/**********************************************************************/
// Gestion des events handler

/**
 * @description Tous les fichiers pour les events handler
 * @type {String[]}
 */

const eventFiles = fs
	.readdirSync("./events")
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

/**********************************************************************/
// Initialisation des commandes par message

/**
 * @type {String[]}
 * @description Toutes les catégories de commande (par dossier)
 */

const commandFolders = fs.readdirSync("./commands");

// Enregistrer toutes les commandes dans la collection

for (const folder of commandFolders) {
	const commandFiles = fs
		.readdirSync(`./commands/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

/**********************************************************************/
// Initialisation des commandes slash

/**
 * @type {String[]}
 * @description Toutes les commandes slash
 */

const slashCommands = fs.readdirSync("./interactions/slash");

// Enregistrer les commandes slash dans la collection

for (const module of slashCommands) {
	const commandFiles = fs
		.readdirSync(`./interactions/slash/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./interactions/slash/${module}/${commandFile}`);
		client.slashCommands.set(command.data.name, command);
	}
}

/**********************************************************************/
// Initialisation des commandes menu

/**
 * @type {String[]}
 * @description Toutes les commandes menu
 */

const contextMenus = fs.readdirSync("./interactions/context-menus");

// Enregistrer les commandes menu dans la collection

for (const folder of contextMenus) {
	const files = fs
		.readdirSync(`./interactions/context-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of files) {
		const menu = require(`./interactions/context-menus/${folder}/${file}`);
		const keyName = `${folder.toUpperCase()} ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
	}
}

/**********************************************************************/
// Initialisation des commandes bouton

/**
 * @type {String[]}
 * @description Toutes les commandes bouton
 */

const buttonCommands = fs.readdirSync("./interactions/buttons");

// Enregistrer toutes les commandes bouton dans la collection

for (const module of buttonCommands) {
	const commandFiles = fs
		.readdirSync(`./interactions/buttons/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./interactions/buttons/${module}/${commandFile}`);
		client.buttonCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Initialisation des commandes menu select

/**
 * @type {String[]}
 * @description Toutes les commandes menu select
 */

const selectMenus = fs.readdirSync("./interactions/select-menus");

// Enregistrer les comamndes menu select dans la collection

for (const module of selectMenus) {
	const commandFiles = fs
		.readdirSync(`./interactions/select-menus/${module}`)
		.filter((file) => file.endsWith(".js"));
	for (const commandFile of commandFiles) {
		const command = require(`./interactions/select-menus/${module}/${commandFile}`);
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
		console.log("Rafraichissement des commandes slash");

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

		console.log("Commandes slash rafraichies avec succès.");
	} catch (error) {
		console.error(error);
	}
})();

/**********************************************************************/
// Initialisation des commandes par message

/**
 * @type {String[]}
 * @description Toutes les catégories de commande (par dossier)
 */

const triggerFolders = fs.readdirSync("./triggers");

// Enregistrer les comamndes dans la collection

for (const folder of triggerFolders) {
	const triggerFiles = fs
		.readdirSync(`./triggers/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of triggerFiles) {
		const trigger = require(`./triggers/${folder}/${file}`);
		client.triggers.set(trigger.name, trigger);
	}
}

// Connection à l'API Discord avec le bot

client.login(token);
