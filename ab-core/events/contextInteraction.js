/**
 * @file Button Interaction Handler
 * @author Krish Garg
 * @since 3.0.0
 */

module.exports = {
	name: "interactionCreate",

	/**
	 * @description Executes when an interaction is created and handle it.
	 * @author Naman Vrati
	 * @param {Object} interaction The interaction which was created
	 */

	execute: async (interaction) => {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a button interaction (to prevent weird bugs)

		if (!interaction.isContextMenu()) return;

		/**********************************************************************/

		// Checks if the interaction target was a user

		if (interaction.targetType === "USER") {
			/**
			 * @description The Interaction command object
			 * @type {Object}
			 */

			const command = client.contextCommands.get(
				"USER " + interaction.commandName
			);

			// A try to execute the interaction.

			try {
				await command.execute(interaction);
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
			/**
			 * @description The Interaction command object
			 * @type {Object}
			 */

			const command = client.contextCommands.get(
				"MESSAGE " + interaction.commandName
			);

			// A try to execute the interaction.

			try {
				await command.execute(interaction);
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
			return console.log(
				"Quelque chose de suspect est survenue avec le menu. Réception d'un type de menu inconnu."
			);
		}
	},
};
