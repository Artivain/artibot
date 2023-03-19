import { ChannelType, Collection, Message } from "discord.js";
import Artibot from "../index.js";
import onMention from "../messages/onMention.js"
import { Command, Module } from "../modules.js";
import log from "../logger";

function escapeRegex(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const name = "messageCreate";

/** Message event listener */
export async function execute(message: Message, artibot: Artibot): Promise<void> {
	// Declares const to be used.
	const { client, content } = message;
	const { localizer, config } = artibot;

	// Checks if the bot is mentioned in the message all alone and triggers onMention trigger.
	if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
		return onMention(message, artibot);
	}

	const checkPrefix: string = config.prefix.toLowerCase();

	// Regex expression for mention prefix
	const prefixRegex: RegExp = new RegExp(
		`^(<@!?${client.user.id}>|${escapeRegex(checkPrefix)})\\s*`
	);

	// Checks if message content in lower case starts with bot's mention.
	if (!prefixRegex.test(content.toLowerCase())) return;

	// Checks and returned matched prefix, either mention or prefix in config.
	const match: RegExpMatchArray | null = content.toLowerCase().match(prefixRegex);

	if (!match) return;

	const [matchedPrefix]: string[] = match;

	// The Message Content of the received message seperated by spaces (' ') in an array, this excludes prefix and command/alias itself.
	const args: string[] = content.slice(matchedPrefix.length).trim().split(/ +/);

	// Name of the command received from first argument of the args array.
	const commandName: string = (args.shift() || "").toLowerCase();

	if (!commandName) return;

	// Check if mesage does not starts with prefix, or message author is bot. If yes, return.
	if (!message.content.startsWith(matchedPrefix) || message.author.bot) return;

	const command: Command | void = findCommand(commandName, artibot.modules);

	// It it's not a command, don't try to execute anything
	if (!command) return;

	// Owner Only Property, add in your command properties if true.
	if (command.ownerOnly && message.author.id !== config.ownerId) {
		const embedOwner = artibot.createEmbed()
			.setColor("Red")
			.setTitle(localizer._("Help on this command"))
			.setDescription(localizer.__("This command can only be executed by [[0]].", { placeholders: [`<@${config.ownerId}>`] }));
		await message.reply({ embeds: [embedOwner] });
		return;
	}

	// Guild Only Property, add in your command properties if true.
	if (command.guildOnly && message.channel.type == ChannelType.DM) {
		await message.reply({
			content: localizer._("I can't execute this command in a DM channel!"),
		});
		return;
	}

	// Check for permissions
	if (command.permissions && message.channel.type != ChannelType.DM) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			await message.reply({ content: localizer._("You do not have the permission to execute this command!") });
			return;
		}
	}

	// Args missing
	if (command.args > args.length) {
		let reply: string = localizer.__("You are missing at least one argument, [[0]]!", { placeholders: [message.author.toString()] });

		if (command.usage) {
			reply += localizer.__("\nCorrect usage is `[[0]][[1]] [[2]]`", { placeholders: [config.prefix, command.name, command.usage] });
		}

		await message.channel.send({ content: reply });
		return;
	}

	// Cooldowns
	const { cooldowns } = artibot;

	const now: number = Date.now();
	const timestamps: Collection<string, number> = cooldowns.get(command.name) || cooldowns.set(command.name, new Collection()).get(command.name)!;
	const cooldownAmount: number = command.cooldown * 1000;

	if (timestamps.has(message.author.id)) {
		const lastUsage: number | undefined = timestamps.get(message.author.id);

		if (lastUsage && now < (lastUsage + cooldownAmount)) {
			const timeLeft = (lastUsage + cooldownAmount - now) / 1000;
			await message.reply({
				content: localizer.__("You must wait [[0]] seconds before using the `[[1]]` command again.", { placeholders: [timeLeft.toFixed(1), command.name] })
			});
			return;
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	// Execute the final command. Put everything above this.
	try {
		await command.execute(message, args, artibot);
	} catch (error) {
		log("CommandHandler", (error as Error).message, "warn", true);
		message.reply({
			content: localizer._("An error occured while trying to run this command.")
		});
	}
}

function findCommand(name: string, modules: Collection<string, Module>): Command | void {
	for (const [, { parts }] of modules) {
		for (const part of parts) {
			if (!(part instanceof Command)) continue;
			if (part.name == name) return part;
			if (part.aliases.includes(name)) return part;
		}
	}
}