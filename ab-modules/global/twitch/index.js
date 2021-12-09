/* 
 * Module TwitchMonitor pour Artibot
 * Par GoudronViande24 (https://github.com/GoudronViande24)
 * Inspiré de Timbot (https://github.com/roydejong/timbot), par roydejong (https://github.com/roydejong)
 * La plupart du code est simplement adapté de ce projet.
*/

module.exports = {
	name: "TwitchMonitor",

	async execute(client, config) {

		config.twitch = require("./config.json");
		config.twitch.private = require("./private.json");
		const twitchAPI = require("./twitchApi");
		const DiscordChannelSync = require("./discordChannelSync");
		const LiveEmbed = require("./liveEmbed");
		const MiniDb = require("./miniDb");
		const TwitchMonitor = require("./twitchMonitor");

		let targetChannels = [];

		let syncServerList = (logMembership) => {
			targetChannels = DiscordChannelSync.getChannelList(client, config.twitch.notificationChannel, logMembership);
		};

		// Init list of connected servers, and determine which channels we are announcing to
		syncServerList(true);

		// Activity updater
		class StreamActivity {
			/**
			 * Registers a channel that has come online, and updates the user activity.
			 */
			static setChannelOnline(stream) {
				this.onlineChannels[stream.user_name] = stream;

				this.updateActivity();
			}

			/**
			 * Marks a channel has having gone offline, and updates the user activity if needed.
			 */
			static setChannelOffline(stream) {
				delete this.onlineChannels[stream.user_name];

				this.updateActivity();
			}

			/**
			 * Fetches the channel that went online most recently, and is still currently online.
			 */
			static getMostRecentStreamInfo() {
				let lastChannel = null;
				for (let channelName in this.onlineChannels) {
					if (typeof channelName !== "undefined" && channelName) {
						lastChannel = this.onlineChannels[channelName];
					}
				}
				return lastChannel;
			}

			/**
			 * Updates the user activity on Discord.
			 * Either clears the activity if no channels are online, or sets it to "watching" if a stream is up.
			 */
			static updateActivity() {
				let streamInfo = this.getMostRecentStreamInfo();

				if (streamInfo) {
					this.discordClient.user.setPresence({
						activities: [{
							name: streamInfo.user_name,
							url: `https://twitch.tv/${streamInfo.user_name.toLowerCase()}`,
							type: "STREAMING"
						}],
						status: "online"
					});

					if (config.twitch.debug) console.log('[TwitchMonitor]', `Activité en cours: Streame ${streamInfo.user_name}.`);
				} else {
					if (config.twitch.debug) console.log('[TwitchMonitor]', 'Activité par défaut.');

					this.discordClient.user.setPresence({
						status: "online"
					});
				}
			}

			static init(discordClient) {
				this.discordClient = discordClient;
				this.onlineChannels = {};

				this.updateActivity();
			}
		}

		// ---------------------------------------------------------------------------------------------------------------------
		// Live events

		let liveMessageDb = new MiniDb('live-messages');
		let messageHistory = liveMessageDb.get("history") || {};

		TwitchMonitor.onChannelLiveUpdate((streamData) => {
			const isLive = streamData.type === "live";

			// Refresh channel list
			try {
				syncServerList(false);
			} catch (e) {};

			// Update activity
			StreamActivity.setChannelOnline(streamData);

			// Generate message
			const msgFormatted = `**${streamData.user_name}** est en live sur Twitch!`;
			const msgEmbed = LiveEmbed.createForStream(streamData);

			// Broadcast to all target channels
			let anySent = false;

			for (let i = 0; i < targetChannels.length; i++) {
				const discordChannel = targetChannels[i];
				const liveMsgDiscrim = `${discordChannel.guild.id}_${discordChannel.name}_${streamData.id}`;

				if (discordChannel) {
					try {
						// Either send a new message, or update an old one
						let existingMsgId = messageHistory[liveMsgDiscrim] || null;

						if (existingMsgId) {
							// Fetch existing message
							discordChannel.messages.fetch(existingMsgId)
								.then((existingMsg) => {
									existingMsg.edit({
										content: msgFormatted,
										embed: msgEmbed
									}).then((message) => {
										// Clean up entry if no longer live
										if (!isLive) {
											delete messageHistory[liveMsgDiscrim];
											liveMessageDb.put('history', messageHistory);
										}
									});
								})
								.catch((e) => {
									// Unable to retrieve message object for editing
									if (e.message === "Unknown Message") {
										// Specific error: the message does not exist, most likely deleted.
										delete messageHistory[liveMsgDiscrim];
										liveMessageDb.put('history', messageHistory);
										// This will cause the message to be posted as new in the next update if needed.
									}
								});
						} else {
							// Sending a new message
							if (!isLive) {
								// We do not post "new" notifications for channels going/being offline
								continue;
							}

							// Expand the message with a @mention for "here" or "everyone"
							// We don't do this in updates because it causes some people to get spammed
							let mentionMode = (config.twitch.mentions && config.twitch.mentions[streamData.user_name.toLowerCase()]) || null;

							if (mentionMode) {
								mentionMode = mentionMode.toLowerCase();

								if (mentionMode === "everyone" || mentionMode === "here") {
									// Reserved @ keywords for discord that can be mentioned directly as text
									mentionMode = `@${mentionMode}`;
								} else {
									// Most likely a role that needs to be translated to <@&id> format
									let roleData = discordChannel.guild.roles.cache.find((role) => {
										return (role.name.toLowerCase() === mentionMode);
									});

									if (roleData) {
										mentionMode = `<@&${roleData.id}>`;
									} else {
										console.log('[TwitchMonitor]', `Impossible de mentionner le rôle: ${mentionMode}`,
											`(le rôle n'existe pas sur le serveur ${discordChannel.guild.name})`);
										mentionMode = null;
									}
								}
							}

							let msgToSend = msgFormatted;

							if (mentionMode) {
								msgToSend = msgFormatted + ` ${mentionMode}`
							}

							let msgOptions = {
								embed: msgEmbed
							};

							discordChannel.send(msgToSend, msgOptions)
								.then((message) => {
									console.log('[TwitchMonitor]', `Annonce envoyée sur #${discordChannel.name} sur ${discordChannel.guild.name}`)

									messageHistory[liveMsgDiscrim] = message.id;
									liveMessageDb.put('history', messageHistory);
								})
								.catch((err) => {
									console.log('[TwitchMonitor]', `Impossible d'envoyer l'annonce sur #${discordChannel.name} sur ${discordChannel.guild.name}:`, err.message);
								});
						}

						anySent = true;
					} catch (e) {
						console.warn('[TwitchMonitor]', "Erreur lors de l'envoi du message:", e);
					}
				}
			}

			liveMessageDb.put('history', messageHistory);
			return anySent;
		});

		TwitchMonitor.onChannelOffline((streamData) => {
			// Update activity
			StreamActivity.setChannelOffline(streamData);
		});

		// --- Common functions ------------------------------------------------------------------------------------------------
		String.prototype.replaceAll = function (search, replacement) {
			var target = this;
			return target.split(search).join(replacement);
		};

		String.prototype.spacifyCamels = function () {
			let target = this;

			try {
				return target.replace(/([a-z](?=[A-Z]))/g, '$1 ');
			} catch (e) {
				return target;
			}
		};

		Array.prototype.joinEnglishList = function () {
			let a = this;

			try {
				return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ' and ');
			} catch (e) {
				return a.join(', ');
			}
		};

		String.prototype.lowercaseFirstChar = function () {
			let string = this;
			return string.charAt(0).toUpperCase() + string.slice(1);
		};

		Array.prototype.hasEqualValues = function (b) {
			let a = this;

			if (a.length !== b.length) {
				return false;
			}

			a.sort();
			b.sort();

			for (let i = 0; i < a.length; i++) {
				if (a[i] !== b[i]) {
					return false;
				}
			}

			return true;
		}

		// Keep our activity in the user list in sync
		StreamActivity.init(client);

		// Begin Twitch API polling
		TwitchMonitor.start();

		client.on("guildCreate", guild => {
			syncServerList(true);
		});

		client.on("guildDelete", guild => {
			syncServerList(true);
		});

	}
}