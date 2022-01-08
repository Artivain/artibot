const config = require("../../config.json").params;
const { log } = require("../logger");

module.exports = {
	name: "interactionCreate",

	execute: async (interaction) => {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a button interaction (to prevent weird bugs)

		if (!interaction.isContextMenu()) return;

		// Don't execute interactions in DM channels

		if (!interaction.channel) return interaction.reply({
			content: "Ceci est désactivé dans les messages privés.",
			ephemeral: true
		});

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
				log("InteractionManager", err, "warn", true);
				await interaction.reply({
					content: "Il y a eu un problème avec l'exécution de l'interaction...",
					ephemeral: true,
				});
				return;
			}
		}
		// Checks if the interaction target was a message
		else if (interaction.targetType === "MESSAGE") {

			const command = client.contextCommands.get(
				"MESSAGE " + interaction.commandName
			);

			// A try to execute the interaction.

			try {
				await command.execute(interaction, config);
				return;
			} catch (err) {
				log("InteractionManager", err, "warn", true);
				await interaction.reply({
					content: "Il y a eu un problème avec l'exécution de l'interaction...",
					ephemeral: true,
				});
				return;
			}
		}

		// Practically not possible, but we are still catching the bug.
		// Possible Fix is a restart!
		else {
			return log("InteractionManager", "Quelque chose de suspect est survenue avec le menu. Réception d'un type de menu inconnu.", "warn", true);
		};
	}
};
