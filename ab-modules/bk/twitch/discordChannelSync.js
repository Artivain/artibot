/**
 * Helper class for syncing discord target channels.
 */
class DiscordChannelSync {
	/**
	 * @param {Client} client Discord.js client.
	 * @param {string} channelName Name of the Discord channel we are looking for on each server (e.g. `config.discord_announce_channel`).
	 * @param {boolean} verbose If true, log guild membership info to stdout (debug / info purposes).
	 * @return {Channel[]} List of Discord.js channels
	 */
	static getChannelList(client, channelName, verbose) {
		let nextTargetChannels = [];

		client.guilds.cache.forEach((guild) => {
			let targetChannel = guild.channels.cache.find(g => g.name === channelName);

			if (!targetChannel) {
				if (verbose) {
					console.warn('[TwitchMonitor]', 'Problème de configuration:', `Le serveur ${guild.name} ne contient pas le salon #${channelName}!`);
				}
			} else {
				let permissions = targetChannel.permissionsFor(guild.me);

				if (verbose) {
					console.log('[TwitchMonitor]', ' --> ', `pour le serveur ${guild.name}, le salon d'annonces est #${targetChannel.name}`);
				}

				if (!permissions.has("SEND_MESSAGES")) {
					if (verbose) {
						console.warn('[TwitchMonitor]', 'Problème de configuration:', `Le bot n'a pas la permission SEND_MESSAGES sur le salon #${targetChannel.name} sur le serveur ${guild.name}. L'envoi des annonces ne fonctionnera pas.`);
					}
				}

				nextTargetChannels.push(targetChannel);
			}
		});

		if (verbose) {
			console.log('[TwitchMonitor]', `Total de ${nextTargetChannels.length} salons pour le nom ${channelName}.`);
		}

		return nextTargetChannels;
	}
}

module.exports = DiscordChannelSync;