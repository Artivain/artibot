const { params, locale } = require("../../config.json");
const { log } = require("../logger");
const logPrefix = "GlobalManager";
const Localizer = require("artibot-localizer");
const path = require("path");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		log(logPrefix, localizer._("Initializing modules..."), "info", true);
		const length = client.global.size;

		if (length == 0) {
			log(logPrefix, localizer._("No module to load."), "log", true);
			return
		};

		log(logPrefix, localizer.__("Loading [[0]] module[[1]]:", { placeholders: [length, (length == 1) ? "" : "s"] }), "log", true);

		client.global.forEach(module => {
			log(logPrefix, " - " + module.name, "log", true);
			setTimeout(() => {
				module.execute(client, params);
			}, 1000);
		});
	}
};