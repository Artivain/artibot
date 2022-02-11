const logPrefix = "GlobalManager";
const Localizer = require("artibot-localizer");
const path = require("path");
const { commons } = require("../loader");
const { log } = commons;

const localizer = new Localizer({
	lang: commons.config.locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		log(logPrefix, localizer._("Initializing modules..."), "info", true);
		const length = client.globals.size;

		if (length == 0) {
			log(logPrefix, localizer._("No module to load."), "log", true);
			return
		};

		log(logPrefix, localizer.__("Loading [[0]] module[[1]]:", { placeholders: [length, (length == 1) ? "" : "s"] }), "log", true);

		client.globals.forEach(({ global, part, module }) => {
			log(logPrefix, " - " + global.name + " (v" + (part.version ? part.version : module.moduleVersion) + ")", "log", true);
			setTimeout(() => {
				global.execute({ client, ...commons });
			}, 1000);
		});
	}
};