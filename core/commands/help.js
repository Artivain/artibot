import Artibot from "../../index.js";

/**
 * @param {Message} message
 * @param {string[]} args 
 * @param {Artibot} artibot 
 */
export default async function helpCommand(message, args, artibot) {
	const { localizer, log, createEmbed, config } = artibot;

	// If there are no args, it means it needs whole help command.

	if (!args.length) {
		const commandList = [];
		artibot.modules.forEach(module => module.parts.forEach(part => {
			if (part.type == "command") commandList.push(part.name);
		}));

		let helpEmbed = createEmbed()
			.setTitle(localizer._("List of all available commands"))
			.setDescription("`" + commandList.join("`, `") + "`")
			.addFields({
				name: localizer._("Usage"),
				value: localizer.__("You can send `[[0]]help [name of the command]` to get more info on a specific command!", { placeholders: [config.prefix] })
			});

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

	let command;

	artibot.modules.forEach(module => {
		if (command) return;
		module.parts.forEach(part => {
			if (command) return;
			if (part.type != "command") return;
			if (part.name == name || part.aliases.includes(name)) command = part;
		});
	});

	// Check if command does not exist
	if (!command) {
		return message.reply({ content: "`" + args[0] + "` " + localizer._("is not a valid command...") });
	};

	let commandEmbed = createEmbed().setTitle(localizer._("Help on a command"));

	if (command.description) commandEmbed.setDescription(`${command.description}`);

	if (command.aliases.length) {
		commandEmbed.addFields(
			{ name: localizer._("Alias"), value: `\`${command.aliases.join("`, `")}\``, inline: true },
			{ name: localizer._("Cooldown"), value: `${command.cooldown || 3} ${localizer._("second(s)")}`, inline: true }
		);
	}

	if (command.usage) {
		commandEmbed.addFields({
			name: localizer._("Usage"),
			value: `\`${config.prefix}${command.name} ${command.usage}\``,
			inline: true
		});
	}

	// Finally send the embed.

	message.channel.send({ embeds: [commandEmbed] });
}