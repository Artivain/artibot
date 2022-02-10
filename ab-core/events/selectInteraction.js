const { log } = require("../logger");
const { params, locale } = require("../../config.json");
const Localizer = require("artibot-localizer");
const path = require("path");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "interactionCreate",

	async execute(interaction) {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a select menu interaction (to prevent weird bugs)

		if (!interaction.isSelectMenu()) return;

		const command = client.selectCommands.get(interaction.customId);

		// If the interaction is not a command in cache, return error message.

		if (!command) {
			await require("../messages/defaultSelectError").execute(interaction);
			return
		};

		// A try to execute the interaction.

		try {
			await command.execute(interaction, params);
			return;
		} catch (err) {
			log("ButtonManager", err, "warn", true);
			await interaction.reply({
				content: localizer._("An error occured while executing this menu option."),
				ephemeral: true,
			});
			return
		};
	}
};
