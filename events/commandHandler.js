import { Collection, Message } from "discord.js";
import Artibot, { Command } from "../index.js";
import onMention from "../messages/onMention.js"

/**
 * @param {string} string 
 * @returns {string}
 */
function escapeRegex(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const name = "messageCreate";

/**
 * Message event listener
 * @param {Message} message 
 * @param {Artibot} artibot 
 */
export async function execute(message, artibot) {
	// Declares const to be used.
	const { client, guild, channel, content, author } = message;
	const { log, localizer, config } = artibot;

	// Checks if the bot is mentioned in the message all alone and triggers onMention trigger.
	if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
		return onMention(message, artibot);
	}

	const checkPrefix = config.prefix.toLowerCase();

	// Regex expression for mention prefix
	const prefixRegex = new RegExp(
		`^(<@!?${client.user.id}>|${escapeRegex(checkPrefix)})\\s*`
	);

	// Checks if message content in lower case starts with bot's mention.
	if (!prefixRegex.test(content.toLowerCase())) return;

	// Checks and returned matched prefix, either mention or prefix in config.
	const [matchedPrefix] = content.toLowerCase().match(prefixRegex);

	// The Message Content of the received message seperated by spaces (' ') in an array, this excludes prefix and command/alias itself.
	const args = content.slice(matchedPrefix.length).trim().split(/ +/);

	// Name of the command received from first argument of the args array.
	const commandName = args.shift().toLowerCase();

	// Check if mesage does not starts with prefix, or message author is bot. If yes, return.
	if (!message.content.startsWith(matchedPrefix) || message.author.bot) return;

	/** @type {Command} */
	let command;

	artibot.modules.forEach(module => {
		if (command) return;
		module.parts.forEach(part => {
			if (command) return;
			if (part.type != "command") return;
			if (part.name == commandName) command = part;
			if (part.aliases.includes(commandName)) command = part;
		});
	});

	// It it's not a command, don't try to execute anything
	if (!command) return;

	// Owner Only Property, add in your command properties if true.
	if (command.ownerOnly && message.author.id !== config.ownerId) {
		let embedOwner = artibot.createEmbed()
			.setColor("Red")
			.setTitle(localizer._("Help on this command"))
			.setDescription(localizer.__("This command can only be executed by [[0]].", { placeholders: [`<@${config.ownerId}>`] }));
		return message.reply({ embeds: [embedOwner] });
	}

	// Guild Only Property, add in your command properties if true.
	if (command.guildOnly && message.channel.type === "dm") {
		return message.reply({
			content: localizer._("I can't execute this command in a DM channel!"),
		});
	}

	// Check for permissions
	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply({ content: localizer._("You do not have the permission to execute this command!") });
		}
	}

	// Args missing
	if (command.args && !args.length) {
		let reply = localizer.__("You did not give any argument, [[0]]!", { placeholders: [message.author] });

		if (command.usage) {
			reply += localizer.__("\nCorrect usage is `[[0]][[1]] [[2]]`", { placeholders: [config.prefix, command.name, command.usage] });
		}

		return message.channel.send({ content: reply });
	}

	// Cooldowns
	const { cooldowns } = artibot;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply({
				content: localizer.__("You must wait [[0]] seconds before using the `[[1]]` command again.", { placeholders: [timeLeft.toFixed(1), command.name] })
			});
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	// Execute the final command. Put everything above this.
	try {
		await command.execute(message, args, artibot);
	} catch (error) {
		log("CommandHandler", error, "warn", true);
		message.reply({
			content: localizer._("An error occured while trying to run this command.")
		});
	}
}