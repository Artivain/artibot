const config = require('./config.json');
config.private = require("./private.json");
const TwitchApi = require('./twitchApi');
const MiniDb = require('./miniDb');
const moment = require('moment');

class TwitchMonitor {
	static __init() {
		this._userDb = new MiniDb("twitch-users");
		this._gameDb = new MiniDb("twitch-games");

		this._lastUserRefresh = this._userDb.get("last-update") || null;
		this._pendingUserRefresh = false;
		this._userData = this._userDb.get("user-list") || {};

		this._pendingGameRefresh = false;
		this._gameData = this._gameDb.get("game-list") || {};
		this._watchingGameIds = [];
	}

	static start() {
		// Load channel names from config
		this.channelNames = config.twitchChannels;
		if (!this.channelNames.length) {
			console.warn('[TwitchMonitor]', 'Pas de chaînes à écouter. Vous devriez désactiver le module pour sauver des ressources système.');
			return;
		}

		// Configure polling interval
		let checkIntervalMs = parseInt(config.checkInterval);
		if (isNaN(checkIntervalMs) || checkIntervalMs < TwitchMonitor.MIN_POLL_INTERVAL_MS) {
			// Enforce minimum poll interval to help avoid rate limits
			checkIntervalMs = TwitchMonitor.MIN_POLL_INTERVAL_MS;
		}
		setInterval(() => {
			this.refresh("Vérification périodique");
		}, checkIntervalMs + 1000);

		// Immediate refresh after startup
		setTimeout(() => {
			this.refresh("Vérification initiale");
		}, 1000);

		// Ready!
		console.log('[TwitchMonitor]', `Écoute:`, this.channelNames.join(', '), `(Vérification chaque ${checkIntervalMs}ms)`);
	}

	static refresh(reason) {
		const now = moment();
		if (config.debug) console.log('[TwitchMonitor]', `Rafraichissement (${reason ? reason : "Aucune raison"})`);

		// Refresh all users periodically
		if (this._lastUserRefresh === null || now.diff(moment(this._lastUserRefresh), 'minutes') >= 10) {
			TwitchApi.fetchUsers(this.channelNames)
				.then((users) => {
					this.handleUserList(users);
				})
				.catch((err) => {
					console.warn('[TwitchMonitor]', 'Erreur pendant la mise à jour de l\'utilisateur:', err);
				})
				.then(() => {
					if (this._pendingUserRefresh) {
						this._pendingUserRefresh = false;
					}
				})
		}

		// Refresh all games if needed
		if (this._pendingGameRefresh) {
			TwitchApi.fetchGames(this._watchingGameIds)
				.then((games) => {
					this.handleGameList(games);
				})
				.catch((err) => {
					console.warn('[TwitchMonitor]', 'Erreur pendant la mise à jour du jeu:', err);
				})
				.then(() => {
					if (this._pendingGameRefresh) {
						this._pendingGameRefresh = false;
					}
				});
		}

		// Refresh all streams
		if (!this._pendingUserRefresh && !this._pendingGameRefresh) {
			TwitchApi.fetchStreams(this.channelNames)
				.then((channels) => {
					this.handleStreamList(channels);
				})
				.catch((err) => {
					console.warn('[TwitchMonitor]', 'Erreur dans la mise à jour des streams:', err);
				});
		}
	}

	static handleUserList(users) {
		let gotChannelNames = [];

		users.forEach((user) => {
			const channelName = user.login.toLowerCase();

			let prevUserData = this._userData[channelName] || {};
			this._userData[channelName] = Object.assign({}, prevUserData, user);

			gotChannelNames.push(user.display_name);
		});

		if (gotChannelNames.length) {
			if (config.debug) console.log('[TwitchMonitor]', 'Mise à jour des données des utilisateurs:', gotChannelNames.join(', '));
		}

		this._lastUserRefresh = moment();

		this._userDb.put("last-update", this._lastUserRefresh);
		this._userDb.put("user-list", this._userData);
	}

	static handleGameList(games) {
		let gotGameNames = [];

		games.forEach((game) => {
			const gameId = game.id;

			let prevGameData = this._gameData[gameId] || {};
			this._gameData[gameId] = Object.assign({}, prevGameData, game);

			gotGameNames.push(`${game.id} → ${game.name}`);
		});

		if (gotGameNames.length) {
			if (config.debug) console.log('[TwitchMonitor]', 'Mise à jour des données de jeux:', gotGameNames.join(', '));
		}

		this._lastGameRefresh = moment();

		this._gameDb.put("last-update", this._lastGameRefresh);
		this._gameDb.put("game-list", this._gameData);
	}

	static handleStreamList(streams) {
		// Index channel data & build list of stream IDs now online
		let nextOnlineList = [];
		let nextGameIdList = [];

		streams.forEach((stream) => {
			const channelName = stream.user_name.toLowerCase();

			if (stream.type === "live") {
				nextOnlineList.push(channelName);
			}

			let userDataBase = this._userData[channelName] || {};
			let prevStreamData = this.streamData[channelName] || {};

			this.streamData[channelName] = Object.assign({}, userDataBase, prevStreamData, stream);
			this.streamData[channelName].game = (stream.game_id && this._gameData[stream.game_id]) || null;

			if (stream.game_id) {
				nextGameIdList.push(stream.game_id);
			}
		});

		// Find channels that are now online, but were not before
		let notifyFailed = false;

		for (let i = 0; i < nextOnlineList.length; i++) {
			let _chanName = nextOnlineList[i];

			if (this.activeStreams.indexOf(_chanName) === -1) {
				// Stream was not in the list before
				console.log('[TwitchMonitor]', 'Le stream est maintenant en ligne:', _chanName);
			}

			if (!this.handleChannelLiveUpdate(this.streamData[_chanName], true)) {
				notifyFailed = true;
			}
		}

		// Find channels that are now offline, but were online before
		for (let i = 0; i < this.activeStreams.length; i++) {
			let _chanName = this.activeStreams[i];

			if (nextOnlineList.indexOf(_chanName) === -1) {
				// Stream was in the list before, but no longer
				console.log('[TwitchMonitor]', 'Le stream n\'est plus en ligne:', _chanName);
				this.streamData[_chanName].type = "detected_offline";
				this.handleChannelOffline(this.streamData[_chanName]);
			}
		}

		if (!notifyFailed) {
			// Notify OK, update list
			this.activeStreams = nextOnlineList;
		} else {
			console.log('[TwitchMonitor]', 'Impossible d\'envoyer la notification, une autre tentative sera faite à la prochaine mise à jour.');
		}

		if (!this._watchingGameIds.hasEqualValues(nextGameIdList)) {
			// We need to refresh game info
			this._watchingGameIds = nextGameIdList;
			this._pendingGameRefresh = true;
			this.refresh("Mise à jour des données de jeux");
		}
	}

	static handleChannelLiveUpdate(streamData, isOnline) {
		for (let i = 0; i < this.channelLiveCallbacks.length; i++) {
			let _callback = this.channelLiveCallbacks[i];

			if (_callback) {
				if (_callback(streamData, isOnline) === false) {
					return false;
				}
			}
		}

		return true;
	}

	static handleChannelOffline(streamData) {
		this.handleChannelLiveUpdate(streamData, false);

		for (let i = 0; i < this.channelOfflineCallbacks.length; i++) {
			let _callback = this.channelOfflineCallbacks[i];

			if (_callback) {
				if (_callback(streamData) === false) {
					return false;
				}
			}
		}

		return true;
	}

	static onChannelLiveUpdate(callback) {
		this.channelLiveCallbacks.push(callback);
	}

	static onChannelOffline(callback) {
		this.channelOfflineCallbacks.push(callback);
	}
}

TwitchMonitor.activeStreams = [];
TwitchMonitor.streamData = {};

TwitchMonitor.channelLiveCallbacks = [];
TwitchMonitor.channelOfflineCallbacks = [];

TwitchMonitor.MIN_POLL_INTERVAL_MS = 30000;

module.exports = TwitchMonitor;

TwitchMonitor.__init();