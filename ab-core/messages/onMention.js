const { prefix, locale } = require("../../config.json");
const Localizer = require("artibot-localizer");
const path = require("path");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	async execute(message) {
		return message.channel.send(
			localizer.__("Hello [[0]]! My prefix is `[[1]]`, you can get help with the `[[1]]help` command.", { placeholders: [message.author, prefix] })
		);
	}
};
