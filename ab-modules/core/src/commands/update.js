const { log } = require("../../../ab-core/logger");
const updater = require("../../../ab-core/updater");

module.exports = {
	name: "update",
	description: "Installe les mises à jour du bot",
	ownerOnly: true,

	execute(message, args, config) {
		// Check if config is valid
		if (config.checkForUpdates != "stable" && config.checkForUpdates != "unstable") {
			message.reply("Le canal des mises à jour n'est pas défini dans la config!");
			return
		}

		// If the owner really wants to do the update, let's do it
		if (args[0] == "force") {
			updater.checkUpdates().then(response => {
				if (response.upToDate) {
					message.reply(`Artibot est déjà à jours (v${response.currentVersion}).`);
					return
				};

				message.reply("Début des mises à jours... Consulter la console pour plus de détails.")

				const options = {
					repository: 'https://github.com/Artivain/artibot',
					tempLocation: '../updaterFiles',
					exitOnComplete: false,
					branch: (config.checkForUpdates == "stable" ? "main" : "unstable")
				};

				updater.doUpdates(options)
					.then(response => {
						if (!response) {
							message.reply("Une erreur est survenue pendant la mise à jour. Consulter la console pour plus de détails.");
							return
						};
						message.reply(
							"Les mises à jour ont bien été installées.\n" +
							"Le bot va maintenant s'éteindre tout seul.\n" + 
							"Si votre hébergement le supporte, le bot devrait revenir de lui même bientôt."
						).then(() => {
							process.exit(1);
						});
					})
					.catch(e => {
						message.reply("Une erreur est survenue pendant la mise à jour. Consulter la console pour plus de détails.");
						log("Updater", "Problème avec la mise à jour: " + e, "warn", true);
					});
			});
		} else {
			updater.checkUpdates().then(response => {
				if (response.upToDate) {
					message.reply(`Artibot est à jours (v${response.currentVersion}).`);
				} else {
					message.reply(
						`Une mise à jour est disponible: v${response.currentVersion} --> v${response.remoteVersion}.\n` +
						"**Bien lire la documentation avant de faire la mise à jour!**\n" +
						"Pour faire la mise à jour, faire la commande `update force`."
					);
				};
			});
		};
	}
};
