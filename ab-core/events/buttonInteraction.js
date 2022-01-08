const { params } = require("../../config.json");
const { log } = require("../logger");

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
				content: "[ButtonManager] Il y a eu un problème lors de l'exécution de ce bouton...",
				ephemeral: true,
			});
			return;
		}
	},
};
