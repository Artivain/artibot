import Artibot, { Button, Command, MessageContextMenuOption, Module, SlashCommand, UserContextMenuOption } from "../index.js";
import helpCommand from "./commands/help.js";
import infoCommand from "./commands/info.js";
import pingCommand from "./commands/ping.js";
import checkupdatesCommand from "./commands/checkupdates.js";
import uptimeCommand from "./commands/uptime.js";
import { SlashCommandBuilder } from "discord.js";
import embedSlashCommand from "./slash-commands/embed.js";
import helpSlashCommand from "./slash-commands/help.js";
import infoSlashCommand from "./slash-commands/info.js";
import pingSlashCommand from "./slash-commands/ping.js";
import deleteButton from "./buttons/delete.js";
import reactMessageMenu from "./message-menu/react.js";
import avatarUserMenu from "./user-menu/avatar.js";
import informationsUserMenu from "./user-menu/informations.js";
import resetinteractions from "./commands/resetinteractions.js";
import registerinteractions from "./buttons/registerinteractions.js";

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
		packageName: "artibot",
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
				description: localizer._("Check updates for the bot"),
				usage: localizer._("[module id]"),
				ownerOnly: true,
				mainFunction: checkupdatesCommand
			}),
			new Command({
				id: "uptime",
				name: "uptime",
				description: localizer._("Get the bot uptime"),
				mainFunction: uptimeCommand
			}),
			new Command({
				id: "resetinteractions",
				name: "resetinteractions",
				description: localizer._("Deletes the cache of the interactions and slash commands in Discord's API."),
				ownerOnly: true,
				mainFunction: resetinteractions
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
			}),
			new Button({
				id: "registerinteractions",
				mainFunction: registerinteractions
			}),

			// Message menu
			new MessageContextMenuOption({
				id: "react",
				name: localizer._("React"),
				mainFunction: reactMessageMenu
			}),

			// User menu
			new UserContextMenuOption({
				id: "avatar",
				name: localizer._("Avatar"),
				mainFunction: avatarUserMenu
			}),
			new UserContextMenuOption({
				id: "informations",
				name: localizer._("Informations"),
				mainFunction: informationsUserMenu
			})
		]
	});
}