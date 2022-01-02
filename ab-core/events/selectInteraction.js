const { log } = require("../logger");
const {params} = require("../../config.json");

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
				content: "Il y a eu une erreur avec l'exécution de cette option du menu.",
				ephemeral: true,
			});
			return
		};
	}
};
