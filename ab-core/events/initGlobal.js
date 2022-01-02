const { params } = require("../../config.json");
const { log } = require("../logger");
const logPrefix = "GlobalManager";

module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		log(logPrefix, "Initialisation des modules", "log", true);
		const length = client.global.size;

		if (length == 0) {
			log(logPrefix, "Aucun module à charger.", "log", true);
			return
		};

		log(logPrefix, `Lancement de ${length} module${(length == 1) ? "" : "s"}:`, "log", true);

		client.global.forEach(module => {
			log(logPrefix, " - " + module.name, "log", true);
			setTimeout(() => {
				module.execute(client, params);
			}, 1000);
		});
	}
};