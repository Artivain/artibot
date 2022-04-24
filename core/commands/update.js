const updater = require("../../../../ab-core/updater");
const { localizer } = require("../../index");

module.exports = {
	name: "update",
	description: localizer._("Intalls the updates for the bot"),
	ownerOnly: true,

	execute(message, args, { config, log }) {
		// Check if config is valid
		if (!config.checkForUpdates) {
			message.reply(localizer._("Checking for updates is disabled in config!"));
			return
		};

		// If the owner really wants to do the update, let's do it
		if (args[0] == "force") {
			updater.checkUpdates().then(response => {
				if (response.upToDate) {
					message.reply(localizer.__("Artibot is already up to date (v[[0]]).", { placeholders: [response.currentVersion] }));
					return
				};

				message.reply(localizer._("Starting updates... Check the console for more details."))

				const options = {
					repository: 'https://github.com/Artivain/artibot',
					tempLocation: '../updaterFiles',
					exitOnComplete: false,
					branch: (config.checkForUpdates == "stable" ? "main" : "unstable")
				};

				updater.doUpdates(options)
					.then(response => {
						if (!response) {
							message.reply(localizer._("An error occured while updating. Check the console for more details."));
							return
						};
						message.reply(
							localizer._("The update has been installed successfully.\nThe bot will now shutdown by himself.\nIf your hosting provider supports it, the bot will restart automatically.")
						).then(() => {
							process.exit(1);
						});
					})
					.catch(e => {
						message.reply(localizer._("An error occured while updating. Check the console for more details."));
						log("Updater", localizer._("Error with the update: ") + e, "warn", true);
					});
			});
		} else {
			updater.checkUpdates().then(response => {
				if (response.upToDate) {
					message.reply(localizer.__("Artibot is up to date (v[[0]]).", { placeholders: [response.currentVersion] }));
				} else {
					message.reply(localizer.__("An update is available: v[[0]] --> v[[1]].\n**Read carefully the documentation before updating!**\nTo install the update, execute the `update force` command.", {placeholders: [response.currentVersion, response.remoteVersion]}));
				};
			});
		};
	}
};
