const AutoGitUpdate = require('auto-git-update');
const { params, locale } = require("../config.json");
const { log } = require("./logger");
const Localizer = require("./localizer");
const path = require('path');

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

// if ran with npm run updater
if (require.main === module) {

	if (params.checkForUpdates != "stable" && params.checkForUpdates != "unstable") {
		log("Updater", localizer._("Configuration error!"), "err", true);
		process.exit(1);
	};

	const config = {
		repository: 'https://github.com/Artivain/artibot',
		tempLocation: '../updaterFiles',
		exitOnComplete: true,
		branch: (params.checkForUpdates == "stable" ? "main" : "unstable")
	};

	const updater = new AutoGitUpdate(config);

	updater.setLogConfig({
		logDebug: true,
		logDetail: true,
		logGeneral: true,
		logWarning: true,
		logError: true
	});
	updater.autoUpdate();

} else {

	module.exports = {
		async checkUpdates() {
			if (params.checkForUpdates != "stable" && params.checkForUpdates != "unstable") {
				return log("Updater", localizer.translate("Check for updates is disabled in config"), "err", true)
			};

			const config = {
				repository: 'https://github.com/Artivain/artibot',
				tempLocation: '../../updaterFiles',
				exitOnComplete: false,
				branch: (params.checkForUpdates == "stable" ? "main" : "unstable")
			};

			const updater = new AutoGitUpdate(config);

			updater.setLogConfig({
				logDebug: false,
				logDetail: false,
				logGeneral: false,
				logWarning: true,
				logError: true
			});

			return updater.compareVersions();
		},

		async doUpdates(options) {
			if (params.checkForUpdates != "stable" && params.checkForUpdates != "unstable") {
				throw new Error(localizer.translate("Configuration error!"))
			};
		
			const autoUpdater = new AutoGitUpdate(options);
		
			autoUpdater.setLogConfig({
				logDebug: true,
				logDetail: true,
				logGeneral: true,
				logWarning: true,
				logError: true
			});
			return autoUpdater.autoUpdate();
		}
	};

};