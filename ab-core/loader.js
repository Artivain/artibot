const { checkUpdates } = require("./updater");
const { log } = require("./logger");
const Localizer = require("artibot-localizer");
const config = require("../config.json");
const path = require("path");
const fs = require("fs");
const contributors = require("../contributors.json");
const { version } = require("../package.json");

const localizer = new Localizer({
	lang: config.locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	commons: {
		checkUpdates,
		log,
		config,
		contributors,
		version
	},

	/**
	 * Get all index files of modules
	 * @returns {{id: string, name: string, manifestVersion: Number, moduleVersion: string, supportedLocales: string[], parts: {id: string, type: string, path: string}[]}[]} - Array of manifests
	 */
	getManifests() {
		let entries = [];

		// Get all folders
		const folders = fs.readdirSync("./ab-modules", { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
			.filter(name => config.enabledModules.includes(name) || name == "core");

		for (const folder of folders) {
			try {
				const { manifest } = require(`../ab-modules/${folder}/index.js`);
				entries.push({ ...manifest, id: folder });
			} catch (error) {
				// Re-throw not "Module not found" errors
				if (error.code !== 'MODULE_NOT_FOUND') throw error;

				log("Loader", localizer.__("An error occured while trying to load manifest file of module [[0]].", { placeholders: [folder] }), "warn", true);
			};
		};

		return entries
	}
};