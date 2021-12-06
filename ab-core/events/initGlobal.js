const { params } = require("../../config.json");
const logPrefix = "[GlobalManager]";

module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		console.log(logPrefix, "Initialisation des modules \"global\"");
		const length = client.global.size;
		if (length == 0) {
			console.log(logPrefix, "Aucun module à charger.");
			return
		}
		console.log(logPrefix, `Lancement de ${length} module${(length == 1) ? "" : "s"}:`);
		client.global.forEach(module => {
			console.log(logPrefix, "-", module.name);
			module.execute(client, params);
		});
	}
};