module.exports = {
	name: "interactionCreate",

	async execute(interaction) {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a command (to prevent weird bugs)

		if (!interaction.isCommand()) return;
		/**
		 * @description The Interaction command object
		 * @type {Object}
		 */

		const command = client.slashCommands.get(interaction.commandName);

		// If the interaction is not a command in cache.

		if (!command) return;

		// A try to executes the interaction.

		try {
			await command.execute(interaction);
		} catch (err) {
			console.error(err);
			await interaction.reply({
				content: "Il y a eu une erreur avec l'exécution de cette commande.",
				ephemeral: true,
			});
		}
	},
};
