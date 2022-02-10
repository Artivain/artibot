const { localizer } = require("../../index");

module.exports = {
	data: {
		name: localizer._("React"),
		type: 3, // 3 is for message context menus
	},

	async execute(interaction) {
		await interaction.options._hoistedOptions[0].message.react("✅");

		await interaction.reply({
			content: localizer._("Reaction added"),
			ephemeral: true
		});
		return
	}
};
