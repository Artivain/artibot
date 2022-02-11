const Localizer = require("artibot-localizer");
const path = require("path");
const { commons } = require("../loader");
const { log } = commons;

const localizer = new Localizer({
	lang: commons.config.locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

module.exports = {
	name: "messageCreate",

	async execute(message) {
		// Ignore bots
		if (message.author.bot) return;

		// Checking ALL triggers using every function and breaking out if a trigger was found.
		let check = false;

		await message.client.triggers.every(async ({ trigger }) => {
			if (check) return false;
			await trigger.name.every(async (name) => {
				if (check) return false;

				// If validated, it will try to execute the trigger.
				if (message.content.includes(name)) {
					try {
						trigger.execute(message, commons);
					} catch (error) {
						// If checks fail, reply back!

						log("TriggerManager", error, "warn", true);
						message.reply({
							content: localizer._("An error occured while trying to execute a trigger."),
						});
					};

					check = true;
					return false
				};
			});
		});
	}
};
