// Manifest file for core module
// Also manage localizer

const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	filePath: path.resolve(__dirname, "locales.json"),
	lang: locale
});

module.exports = {
	localizer,

	manifest: {

		version: 1,
		name: "Artibot Core",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [

			// Commands
			{
				id: "help",
				type: "command",
				path: "src/commands/help.js"
			},
			{
				id: "info",
				type: "command",
				path: "src/commands/info.js"
			},
			{
				id: "ping",
				type: "command",
				path: "src/commands/ping.js"
			},
			{
				id: "update",
				type: "command",
				path: "src/commands/update.js"
			},
			{
				id: "reload",
				type: "command",
				path: "src/commands/reload.js"
			},
			{
				id: "resetinteractions",
				type: "command",
				path: "src/commands/resetinteractions.js"
			},

			// Slash commands
			{
				id: "embed",
				type: "slashcommand",
				path: "src/slash-commands/embed.js"
			},
			{
				id: "help",
				type: "slashcommand",
				path: "src/slash-commands/help.js"
			},
			{
				id: "info",
				type: "slashcommand",
				path: "src/slash-commands/info.js"
			},
			{
				id: "ping",
				type: "slashcommand",
				path: "src/slash-commands/ping.js"
			},

			// User menu
			{
				id: "avatar",
				type: "usermenu",
				path: "src/user-menu/avatar.js"
			},
			{
				id: "informations",
				type: "usermenu",
				path: "src/user-menu/informations.js"
			},

			// Message menu
			{
				id: "react",
				type: "messagemenu",
				path: "src/message-menu/react.js"
			},

			// Buttons
			{
				id: "delete",
				type: "button",
				path: "src/buttons/delete.js"
			},
			{
				id: "registerinteractions",
				type: "button",
				path: "src/buttons/registerinteractions.js"
			}
		]
	}
};