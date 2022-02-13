/**
 * Clocks module - Show time from many timezones in your Discord server
 * @author GoudronViande24
 */

const moment = require('moment');
require('moment-timezone');
const { Client, Intents } = require("discord.js");
const Localizer = require("artibot-localizer");
const path = require('path');
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

function updateActivity(client, config, clock) {
	const timeNowUpdate = moment().tz(clock.timezone).format(config.format);
	client.user.setActivity(`🕒 ${timeNowUpdate}`);
};

function startClock(clock, config, i, log) {
	// Since discord.js v13, intents are mandatory
	const client = new Client({
		intents: [Intents.FLAGS.GUILDS]
	});
	client.once("ready", client => {
		if (client.user.username !== clock.botName) {
			client.user.setUsername(clock.botName);
			log("Clocks", localizer.__("Clock #[[0]]: Name changed for [[1]]", { placeholders: [i, clock.botName] }));
		};

		// set the interval
		setInterval(() => updateActivity(client, config, clock), config.updateinterval);
		updateActivity(client, config, clock);

		// tell when it's ready
		log("Clocks", localizer.__("Clock #[[0]]: Connected as [[1]] ([[2]]) on [[3]]", {
			placeholders: [
				i,
				client.user.tag,
				client.user.id,
				moment().format("MMMM DD YYYY, HH:mm:ss")
			]
		}));
	});
	client.login(config.tokens[i]);
};

module.exports = {
	name: "Clocks",

	execute({ log }) {
		config = require("./config.json");
		try { config.tokens = require("./private.json"); } catch (error) {
			if (error.code !== 'MODULE_NOT_FOUND') {
				// Re-throw not "Module not found" errors 
				throw error;
			} else {
				log("Clocks", localizer._("Configuration error: The private.json file does not exists."));
				process.exit(1);
			};
		};

		if (!config.tokens) {
			log("Clocks", localizer._("Configuration error: The private.json file is invalid."));
			process.exit(1);
		};

		if (config.tokens.length != config.clocks.length) {
			log("Clocks", localizer._("Configuration error: The amount of tokens is not equal to the amount of clocks."));
			process.exit(1);
		};

		log("Clocks", localizer._("Loading..."));

		for (var i = 0, len = config.clocks.length; i < len; i++) {
			startClock(config.clocks[i], config, i, log);
		};
	}
};