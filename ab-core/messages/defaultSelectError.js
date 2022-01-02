module.exports = {
	async execute(interaction) {
		await interaction.reply({
			content: "Il y a eu une erreur avec cette option du menu!",
			ephemeral: true,
		});
		return
	}
};
