/**
 * Reaction roles for Artibot
 * @author GoudronViande24
 * @since 1.0.0
 */

const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	name: "Reaction roles",

	async execute({ client, log }) {
		const ReactionRole = require("discordjs-reaction-role").default;
		try {
			const config = require("./config.json");

			new ReactionRole(client, config.reactionRoles);
		} catch	{
			return log("Reaction roles", localizer._("Configuration file not found or invalid."));
		};
	}
}