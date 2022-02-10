const { log } = require("../logger");
const Localizer = require("artibot-localizer");
const path = require("path");
const { commons } = require("../loader");

const localizer = new Localizer({
	lang: commons.config.locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "interactionCreate",

	async execute(interaction) {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a command (to prevent weird bugs)

		if (!interaction.isCommand()) return;

		const data = client.slashCommands.get(interaction.commandName);

		// If the interaction is not a command in cache.

		if (!data) return;

		const { command } = data;

		// A try to executes the interaction.

		try {
			await command.execute(interaction, commons);
		} catch (err) {
			log("SlashManager", err, "warn", true);
			await interaction.reply({
				content: localizer._("An error occured while executing this command."),
				ephemeral: true
			});
		};
	}
};
