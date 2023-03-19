import { ChannelType, Collection, EmbedBuilder, Message } from "discord.js";
import Artibot from "../../index.js";
import log from "../../logger";
import { Command, Module } from "../../modules.js";

export default async function helpCommand(message: Message, args: string[], artibot: Artibot): Promise<void> {
	const { localizer, createEmbed, config } = artibot;

	// If there are no args, it means it needs whole help command.

	if (!args.length) {
		const commandList: string[] = [];
		artibot.modules.forEach(module => module.parts.forEach(part => {
			if (part instanceof Command) commandList.push(part.name);
		}));

		let helpEmbed: EmbedBuilder = createEmbed()
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
				if (message.channel.type == ChannelType.DM) return;

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

	const name: string = args[0].toLowerCase();

	const command: Command | void = findCommand(name, artibot.modules);

	// Check if command does not exist
	if (!command) {
		await message.reply({ content: "`" + args[0] + "` " + localizer._("is not a valid command...") });
		return;
	}

	let commandEmbed: EmbedBuilder = createEmbed().setTitle(localizer._("Help on a command"));

	if (command.description) commandEmbed.setDescription(`${command.description}`);

	if (command.aliases.length) {
		commandEmbed.addFields({
			name: localizer._("Alias"),
			value: `\`${command.aliases.join("`, `")}\``,
			inline: true
		});
	}

	commandEmbed.addFields({
		name: localizer._("Cooldown"),
		value: `${command.cooldown} ${localizer._("second(s)")}`,
		inline: true
	});

	if (command.usage) {
		commandEmbed.addFields({
			name: localizer._("Usage"),
			value: `\`${config.prefix}${command.name} ${command.usage}\``,
			inline: true
		});
	}

	// Finally send the embed.

	await message.channel.send({ embeds: [commandEmbed] });
}

function findCommand(name: string, modules: Collection<string, Module>): Command | void {
	for (const [, { parts }] of modules) {
		for (const part of parts) {
			if ((part instanceof Command) && (part.name == name || part.aliases.includes(name))) return part;
		}
	}
}