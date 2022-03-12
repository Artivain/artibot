const Localizer = require("artibot-localizer");
const path = require("path");
const { commons } = require("../loader");
const { log } = commons;

const localizer = new Localizer({
	lang: commons.config.locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "interactionCreate",

	async execute(interaction) {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a button interaction (to prevent weird bugs)

		if (!interaction.isButton()) return;

		let data = client.buttonCommands.get(interaction.customId);

		if (!data) data = client.buttonCommands.find((v, id) => {
			/** @type {string[]} */
			const parts = id.split("*");
			return interaction.customId.startsWith(parts[0]);
		});

		// If the interaction is not a registered button, return error message.

		if (!data) {
			await require("../messages/defaultButtonError").execute(interaction);
			return;
		};

		const { command } = data;

		// A try to execute the button.

		try {
			await command.execute(interaction, commons);
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
