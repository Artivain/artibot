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
	static getChannelList(client, channelName, verbose, log, localizer) {
		let nextTargetChannels = [];

		client.guilds.cache.forEach((guild) => {
			let targetChannel = guild.channels.cache.find(g => g.name === channelName);

			if (!targetChannel) {
				if (verbose) {
					log('TwitchMonitor', localizer.__("Configuration error: The server [[0]] does not have a #[[1]] channel!", { placeholders: [guild.name, channelName] }));
				};
			} else {
				let permissions = targetChannel.permissionsFor(guild.me);

				if (verbose) {
					log('TwitchMonitor', localizer.__(" --> for the [[0]] server, the announcements channel is #[[1]]", { placeholders: [guild.name, targetChannel.name] }));
				};

				if (!permissions.has("SEND_MESSAGES")) {
					if (verbose) {
						log('TwitchMonitor', localizer.__("Configuration error: The bot does not have SEND_MESSAGES permission in #[[0]] channel on [[1]] server. The announcements will not be sent.", { placeholders: [targetChannel.name, guild.name] }));
					};
				};

				nextTargetChannels.push(targetChannel);
			};
		});

		if (verbose) {
			log('TwitchMonitor', localizer.__("Total of [[0]] #[[1]] channels.", { placeholders: [nextTargetChannels.length, channelName] }));
		}

		return nextTargetChannels;
	}
}

module.exports = DiscordChannelSync;