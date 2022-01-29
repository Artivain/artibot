const { locale } = require("../../config.json");
const Localizer = require("../localizer");
const path = require("path");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	async execute(interaction) {
		await interaction.reply({
			content: localizer._("There was an error with this button!"),
			ephemeral: true,
		});
		return
	}
};
