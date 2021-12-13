const moment = require('moment');
const tz = require('moment-timezone');
const Discord = require('discord.js');

module.exports = {
	name: "Clocks",

	execute(client, config) {
		config.module = require("./config.json");
		config.module.private = require("./private.json");

		

	}
}