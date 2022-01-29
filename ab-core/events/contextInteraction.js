const { params, locale } = require("../../config.json");
const config = params;
const { log } = require("../logger");
const Localizer = require("../localizer");
const path = require("path");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "interactionCreate",

	execute: async (interaction) => {
		// Deconstructed client from interaction object.
		const { client } = interaction;

		// Checks if the interaction is a button interaction (to prevent weird bugs)

		if (!interaction.isContextMenu()) return;

		// Don't execute interactions in DM channels

		if (!interaction.channel) return interaction.reply({
			content: localizer._("This is disabled in DM channels."),
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
					content: localizer._("An error occured when executing this interaction..."),
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
					content: localizer._("An error occured when executing this interaction..."),
					ephemeral: true,
				});
				return;
			}
		}

		// Practically not possible, but we are still catching the bug.
		// Possible Fix is a restart!
		else {
			return log("InteractionManager", localizer._("Something weird happened with the menu. Received an unknown menu type."), "warn", true);
		};
	}
};
