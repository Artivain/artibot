const { params, locale } = require("../../config.json");
const { log } = require("../logger");
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

		// Checks if the interaction is a button interaction (to prevent weird bugs)

		if (!interaction.isButton()) return;

		const command = client.buttonCommands.get(interaction.customId);

		// If the interaction is not a command in cache, return error message.
		// You can modify the error message at ./messages/defaultButtonError.js file!

		if (!command) {
			await require("../messages/defaultButtonError").execute(interaction);
			return;
		}

		// A try to execute the interaction.

		try {
			await command.execute(interaction, params);
			return;
		} catch (err) {
			log("ButtonManager", err, "warn", true);
			await interaction.reply({
				content: localizer._("An error occured when executing this button..."),
				ephemeral: true,
			});
			return;
		}
	},
};
