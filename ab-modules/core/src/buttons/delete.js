module.exports = {
	id: "delete",

	async execute(interaction, config) {
		await interaction.message.delete();
		return
	}
};