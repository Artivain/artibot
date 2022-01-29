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
		const config = require("../../config.json").params;
		if (client.user.username != config.botName) {
			client.user.setUsername(config.botName)
				.then(log("Artibot", localizer.__("Bot name updated to [[0]].", { placeholders: [config.botName] }), "log", true));
		};
	}
};