const { log } = require("../logger");
const { params, locale } = require("../../config.json");
const Localizer = require("../localizer");
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

		// Checks if the interaction is a command (to prevent weird bugs)

		if (!interaction.isCommand()) return;

		const command = client.slashCommands.get(interaction.commandName);

		// If the interaction is not a command in cache.

		if (!command) return;

		// A try to executes the interaction.

		try {
			await command.execute(interaction, params);
		} catch (err) {
			log("SlashManager", err, "warn", true);
			await interaction.reply({
				content: localizer._("An error occured while executing this command."),
				ephemeral: true
			});
		};
	}
};
