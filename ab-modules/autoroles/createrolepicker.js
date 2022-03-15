/**
 * Command to create a role picker
 * @author GoudronViande24
 * @since 2.0.0
 */

const { MessageActionRow, MessageButton, TextChannel, MessageEmbed, Permissions } = require("discord.js");
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

/** @type {Boolean} */
let enabled;

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

/**
 * Send an error message
 * @param {TextChannel} channel - The channel to send the error to
 * @param {Object} config - Artibot's config
 * @param {string} reason - The error description
 * @returns {TextChannel} The error message
 */
async function sendErrorMessage(channel, config, reason) {
	return await channel.send({
		embeds: [
			new MessageEmbed()
				.setColor("RED")
				.setTitle("Autorole")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(reason)
		]
	});
};

const allowedModes = [
	"toggle",
	"addonly",
	"removeonly"
];

module.exports = {
	name: "createrolepicker",
	description: localizer._("Create a role picker."),
	usage: localizer._("<list of buttons to create (following the text:mode:id format) (ex.: Sample role:toggle:796899707045543946, Add-only role:addonly:796899707045543946)>"),

	async init({ log }) {
		try {
			enabled = require("./config.json").allowNewPickers;
		} catch {
			enabled = true;
			log("Auto roles", localizer._("Configuration file not found or invalid. The createrolepicker command is enabled by default."), "warn");
		};
	},

	async execute(message, args, { config }) {
		// Check if command is enabled
		if (!enabled) return sendErrorMessage(message.channel, config, localizer._("This command is disabled."));

		// Check if user has admin permissions
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return sendErrorMessage(message.channel, config,
			localizer._("You must be an administrator to use this command.")
		);

		// Check if there is an argument
		if (!args.length) return sendErrorMessage(message.channel, config, localizer._("No arguments! Use the `help createrolepicker` command to learn more."));

		const row = new MessageActionRow();
		args = args.join(" ").split(", ");

		args.slice(0, 5).forEach(arg => {
			const settings = arg.split(":");

			if (settings.length != 3 || !message.guild.roles.cache.get(settings[2]) || !allowedModes.includes(settings[1])) {
				return sendErrorMessage(
					message.channel,
					config,
					localizer.__("[[0]] is not valid.", { placeholders: [arg] })
				);
			};

			row.addComponents(
				new MessageButton()
					.setLabel(settings[0])
					.setStyle("PRIMARY")
					.setCustomId(`autorole-${settings[1]}-${settings[2]}`)
			);
		});

		await message.channel.send({
			components: [row]
		});

		message.delete();
	}
}