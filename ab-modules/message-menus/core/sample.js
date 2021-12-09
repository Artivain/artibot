module.exports = {
	data: {
		name: "example",
		type: 3, // 3 is for message context menus
	},

	async execute(interaction, config) {
		await interaction.reply({
			content: "I am a sample message context menu.",
		});
		return;
	},
};
