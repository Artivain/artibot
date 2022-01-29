const { log } = require("../logger");
const { locale } = require("../../config.json");
const Localizer = require("../localizer");
const path = require("path");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		log("Artibot", localizer.__("Ready! Connected as [[0]].", { placeholders: [client.user.tag] }), "info", true);
	}
};