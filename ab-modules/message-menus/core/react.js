module.exports = {
	data: {
		name: "Réaction",
		type: 3, // 3 is for message context menus
	},

	async execute(interaction, config) {
		await interaction.options._hoistedOptions[0].message.react("✅");

		await interaction.reply({
			content: "Réaction ajoutée",
			ephemeral: true
		});
		return;
	},
};
