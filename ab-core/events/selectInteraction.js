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
		const { client } = interaction;

		// Checks if the interaction is a select menu interaction
		if (!interaction.isSelectMenu()) return;

		const data = client.selectCommands.get(interaction.customId);

		// If the interaction is not a registered dropdown, return error message.
		if (!data) {
			await require("../messages/defaultSelectError").execute(interaction);
			return
		};

		const { command } = data;

		// A try to execute the interaction.

		try {
			await command.execute(interaction, commons);
			return
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
