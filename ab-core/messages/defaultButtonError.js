module.exports = {
	/**
	 * @description Executes when the button interaction could not be fetched.
	 * @author Artivain
	 * @param {Object} interaction The Interaction Object of the command.
	 */

	async execute(interaction) {
		await interaction.reply({
			content: "Il y a eu une erreur avec ce bouton!",
			ephemeral: true,
		});
		return;
	},
};
