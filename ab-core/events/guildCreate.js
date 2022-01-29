const { log } = require("../logger");
const { locale } = require("../../config.json");
const Localizer = require("../localizer");
const path = require("path");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "guildCreate",

	async execute(guild) {
		log("Artibot", localizer._("Added to a new server: ") + guild.name, "log", true);
	}
};