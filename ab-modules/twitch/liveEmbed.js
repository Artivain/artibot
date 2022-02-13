const { MessageEmbed } = require("discord.js");
const moment = require('moment');
const humanizeDuration = require("humanize-duration");
const Localizer = require("artibot-localizer");
const path = require("path");
const config = require('./config.json');
config.private = require("./private.json");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

class LiveEmbed {
	static createForStream(streamData) {
		const isLive = streamData.type === "live";
		const allowBoxArt = config.showGameIcon;

		let msgEmbed = new MessageEmbed();
		msgEmbed.setColor(isLive ? config.colors.live : config.colors.offline);
		msgEmbed.setURL(`https://twitch.tv/${streamData.user_name.toLowerCase()}`);

		// Thumbnail
		let thumbUrl = streamData.profile_image_url;

		if (allowBoxArt && streamData.game && streamData.game.box_art_url) {
			thumbUrl = streamData.game.box_art_url;
			thumbUrl = thumbUrl.replace("{width}", "288");
			thumbUrl = thumbUrl.replace("{height}", "384");
		}

		msgEmbed.setThumbnail(thumbUrl);

		// Title
		if (isLive) {
			msgEmbed.setTitle(":red_circle: " + localizer.__("**[[0]] is live on Twitch!**", { placeholders: [streamData.user_name] }));
			msgEmbed.addField(localizer._("Title"), streamData.title, false);
		} else {
			msgEmbed.setTitle(":white_circle: " + localizer.__("[[0]] was live on Twitch.", { placeholders: [streamData.user_name] }));
			msgEmbed.setDescription(localizer._("The stream has ended."));

			msgEmbed.addField(localizer._("Title"), streamData.title, true);
		}

		// Add game
		if (streamData.game && config.showGame) {
			msgEmbed.addField(localizer._("Game"), streamData.game.name, false);
		}

		if (isLive) {
			// Add status
			if (config.showViews) msgEmbed.addField(localizer._("Viewers"), isLive ? localizer.__("Currently [[0]]", { placeholders: [streamData.viewer_count] }) : localizer._("The stream has ended."), true);

			// Set main image (stream preview)
			if (config.showThumbnail) {
				let imageUrl = streamData.thumbnail_url;
				imageUrl = imageUrl.replace("{width}", "1280");
				imageUrl = imageUrl.replace("{height}", "720");
				let thumbnailBuster = (Date.now() / 1000).toFixed(0);
				imageUrl += `?t=${thumbnailBuster}`;
				msgEmbed.setImage(imageUrl);
			}

			// Add uptime
			if (config.showUptime) {
				let now = moment();
				let startedAt = moment(streamData.started_at);

				msgEmbed.addField(localizer._("Online since"), humanizeDuration(now - startedAt, {
					language: locale,
					delimiter: ", ",
					largest: 2,
					round: true,
					units: ["y", "mo", "w", "d", "h", "m"]
				}), true);
			}
		}

		return msgEmbed;
	}
}

module.exports = LiveEmbed;