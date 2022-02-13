/**
 * Module to give a role to people in a vocal channel
 * @author GoudronViande24
 */

const Localizer = require("artibot-localizer");
const path = require("path");

module.exports = {
	name: "vcRole",

	manifest: {
		manifestVersion: 1,
		moduleVersion: "1.2.0",
		name: "VC Role",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "vcrole",
				type: "global",
				path: "index.js"
			}
		]
	},

	execute({ client, log, config }) {
		const localizer = new Localizer({
			lang: config.lang,
			filePath: path.resolve(__dirname, "locales.json")
		});
		config = require("./config.json");
		log("VC Role", localizer._("Ready."));

		client.on("voiceStateUpdate", (oldState, newState) => {
			const role = newState.guild.roles.cache.find(role => role.name.toLowerCase() == config.role.toLowerCase());

			if (!role && config.debug) {
				log("VC Role", localizer.__("Cannot find [[0]] role in server [[1]]", { placeholders: [config.role, newState.guild.name] }), "debug");
			};

			if (!role) return;

			if (newState.channelId) {
				newState.member.roles.add(role);
			} else {
				newState.member.roles.remove(role);
			};
		});
	}
};