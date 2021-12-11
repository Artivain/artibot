const config = require("../../config.json").params;

module.exports = {
	name: "interactionCreate",

	execute: async (interaction) => {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a button interaction (to prevent weird bugs)

		if (!interaction.isContextMenu()) return;

		/**********************************************************************/

		// Checks if the interaction target was a user

		if (interaction.targetType === "USER") {

			const command = client.contextCommands.get(
				"USER " + interaction.commandName
			);

			// A try to execute the interaction.

			try {
				await command.execute(interaction, config);
				return;
			} catch (err) {
				console.error(err);
				await interaction.reply({
					content: "Il y a eu un problème avec l'exécution de l'interaction...",
					ephemeral: true,
				});
				return;
			}
		}
		// Checks if the interaction target was a user
		else if (interaction.targetType === "MESSAGE") {

			const command = client.contextCommands.get(
				"MESSAGE " + interaction.commandName
			);

			// A try to execute the interaction.

			try {
				await command.execute(interaction, config);
				return;
			} catch (err) {
				console.error(err);
				await interaction.reply({
					content: "Il y a eu un problème avec l'exécution de l'interaction...",
					ephemeral: true,
				});
				return;
			}
		}

		// Practically not possible, but we are still caching the bug.
		// Possible Fix is a restart!
		else {
			return console.log("[InteractionManager] Quelque chose de suspect est survenue avec le menu. Réception d'un type de menu inconnu.");
		}
	},
};
