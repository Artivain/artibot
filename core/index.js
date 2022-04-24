import Artibot, { Command, Module } from "../index.js";
import helpCommand from "./commands/help.js";
import infoCommand from "./commands/info.js";
import pingCommand from "./commands/ping.js";
import checkupdatesCommand from "./commands/checkupdates.js";

/**
 * Create the Core module
 * @param {Artibot} artibot
 * @returns {Module} Artibot Core Module
 */
export default function coreModule(artibot) {
	const { localizer, version } = artibot;

	return new Module({
		name: "Artibot Core",
		id: "core",
		repo: "Artivain/artibot",
		version,
		langs: ["en", "fr"],
		parts: [
			// Commands
			new Command({
				id: "help",
				name: "help",
				description: localizer._("Gives a list of available commands."),
				aliases: ["commands", "aide"],
				usage: localizer._("[name of the command]"),
				cooldown: 5,
				mainFunction: helpCommand
			}),
			new Command({
				id: "info",
				name: "info",
				description: localizer._("Learn more about this bot."),
				aliases: ["infos", "about"],
				cooldown: 5,
				mainFunction: infoCommand
			}),
			new Command({
				id: "ping",
				name: "ping",
				description: localizer._("Check if the bot is alive."),
				aliases: ["latence", "latency"],
				cooldown: 3,
				mainFunction: pingCommand
			}),
			new Command({
				id: "checkupdates",
				name: "checkupdates",
				description: localizer._("Intalls the updates for the bot"),
				ownerOnly: true,
				mainFunction: checkupdatesCommand
			})
		]
	});

	asd = {
		manifest: {

			manifestVersion: 1,
			moduleVersion: require("../../package.json").version,
			name: "Artibot Core",
			supportedLocales: [
				"en",
				"fr"
			],
			parts: [

				// Commands
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
}