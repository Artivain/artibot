import Artibot, { Button, Command, Module, SlashCommand } from "../index.js";
import helpCommand from "./commands/help.js";
import infoCommand from "./commands/info.js";
import pingCommand from "./commands/ping.js";
import checkupdatesCommand from "./commands/checkupdates.js";
import uptimeCommand from "./commands/uptime.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import embedSlashCommand from "./slash-commands/embed.js";
import helpSlashCommand from "./slash-commands/help.js";
import infoSlashCommand from "./slash-commands/info.js";
import pingSlashCommand from "./slash-commands/ping.js";
import deleteButton from "./buttons/delete.js";

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
			}),
			new Command({
				id: "uptime",
				name: "uptime",
				description: localizer._("Get the bot uptime"),
				mainFunction: uptimeCommand
			}),

			// Slash commands
			new SlashCommand({
				id: "embed",
				data: new SlashCommandBuilder()
					.setName("embed")
					.setDescription(localizer._("Make an embed and send it in the channel."))
					.addStringOption(option =>
						option.setName("title")
							.setDescription(localizer._("The title for the embed"))
							.setRequired(true)
					)
					.addStringOption(option =>
						option.setName("content")
							.setDescription(localizer._("The content for the embed (message, rules, infos, etc...)"))
							.setRequired(true)
					)
					.addBooleanOption(option =>
						option.setName("date")
							.setDescription(localizer._("To show or not the date in the footer"))
							.setRequired(true)
					)
					.addStringOption(option =>
						option.setName("footer")
							.setDescription(localizer._("The text for the footer of the embed"))
							.setRequired(false)
					)
					.addStringOption(option =>
						option.setName("color")
							.setDescription(localizer._("The color at the left of the embed (in hexadecimal notation, ex.: #ffffff)"))
							.setRequired(false)
					),
				mainFunction: embedSlashCommand
			}),
			new SlashCommand({
				id: "help",
				data: new SlashCommandBuilder()
					.setName("help")
					.setDescription(localizer._("Gives a list of commands or infos about a specific command."))
					.addStringOption(option =>
						option
							.setName("command")
							.setDescription(localizer._("The command to get infos on."))
					),
				mainFunction: helpSlashCommand
			}),
			new SlashCommand({
				id: "info",
				data: new SlashCommandBuilder()
					.setName("info")
					.setDescription(localizer._("Learn more about this bot.")),
				mainFunction: infoSlashCommand
			}),
			new SlashCommand({
				id: "ping",
				data: new SlashCommandBuilder()
					.setName("ping")
					.setDescription(localizer._("Check if the bot is alive.")),
				mainFunction: pingSlashCommand
			}),

			// Buttons
			new Button({
				id: "delete",
				mainFunction: deleteButton
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
					id: "resetinteractions",
					type: "command",
					path: "src/commands/resetinteractions.js"
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