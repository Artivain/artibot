const { Octokit } = require("@octokit/core");
const config = require("../config.json");
const currentVersion = require("../package.json").version;

module.exports = {
	async checkUpdates() {
		// Check if config is valid
		if (config.params.checkForUpdates != "none" && config.params.checkForUpdates != "stable" && config.params.checkForUpdates != "unstable") {
			console.error("[Artibot] Erreur de configuration: Le fichier config.json est invalide.");
			process.exit(1);
		}
		// Check if enabled in config
		if (!config.params.checkForUpdates || config.params.checkForUpdates == "none") return
		console.log(`[Artibot] Vérification des mises à jour...`);
		const octokit = new Octokit();
		const response = await octokit.request('GET /repos/{owner}/{repo}/releases', {
			owner: 'Artivain',
			repo: 'artibot'
		});
		var data = response.data;
		// Filter out unstable channel
		if (config.params.checkForUpdates == "stable") data = data.filter(release => { !release.prerelease });
		var latest = data[0];
		if (!latest) { console.log("[Artibot] Aucune mise à jour disponible pour ce channel."); return }
		// Get only version number from release name
		var latestVersion = latest.name.slice(1).split("-")[0];
		// Compare with current version
		if (latestVersion == currentVersion) {
			console.log(`[Artibot] La dernière version ${config.params.checkForUpdates} (${currentVersion}) est installée.`);
		} else {
			console.log(`[Artibot] Une mise à jour est disponible: ${latestVersion}. Version actuelle: ${currentVersion}.`);
		}
	}
}