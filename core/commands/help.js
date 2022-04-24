import { Embed } from "../../index.js";

/**
 * @param {Message} message
 * @param {string[]} args 
 * @param {Artibot} artibot 
 */
export default async function helpCommand(message, args, artibot) {
	const { localizer } = artibot;
	const { commands } = artibot.modules;

	// If there are no args, it means it needs whole help command.

	if (!args.length) {

		let helpEmbed = new Embed()
			.setTitle(localizer._("List of all available commands"))
			.setDescription("`" + commands.map(({ command }) => command.name).join("`, `") + "`")
			.addField(
				localizer._("Usage"),
				localizer.__("You can send `[[0]]help [name of the command]` to get more info on a specific command!", { placeholders: [config.prefix] })
			);

		// Attempts to send embed in DMs.

		return message.author
			.send({ embeds: [helpEmbed] })

			.then(() => {
				if (message.channel.type === "dm") return;

				// On validation, reply back.

				message.reply({ content: localizer._("I sent you a DM with the list of all my commands") });
			})
			.catch((error) => {
				// On failing, throw error.

				log("Core", `${localizer.__("Impossible to send the list of commands in DM to [[0]]. Details of the error:", { placeholders: [message.author.tag] })} ${error}`, "warn", true);

				message.reply({ content: localizer._("Looks like it's impossible for me to send you a DM!") });
			});
	}

	// If argument is provided, check if it's a command.

	const name = args[0].toLowerCase();

	const data =
		commands.get(name) ||
		commands.find((c) => c.aliases && c.aliases.includes(name));

	// If it's an invalid command.

	if (!data) {
		return message.reply({ content: "`" + args[0] + "` " + localizer._("is not a valid command...") });
	};

	const { command } = data;

	let commandEmbed = new Embed().setTitle(localizer._("Help on a command"));

	if (command.description) commandEmbed.setDescription(`${command.description}`);

	if (command.aliases) {
		commandEmbed
			.addField(localizer._("Alias"), `\`${command.aliases.join(", ")}\``, true)
			.addField(localizer._("Cooldown"), `${command.cooldown || 3} ${localizer._("second(s)")}`, true);
	}

	if (command.usage) {
		commandEmbed.addField(
			localizer._("Usage"),
			`\`${config.prefix}${command.name} ${command.usage}\``,
			true
		);
	}

	// Finally send the embed.

	message.channel.send({ embeds: [commandEmbed] });
}