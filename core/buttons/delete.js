module.exports = {
	id: "delete",

	async execute(interaction) {
		await interaction.message.delete();
		return
	}
};