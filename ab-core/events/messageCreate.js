const { Collection, MessageEmbed } = require("discord.js");
const { prefix, ownerId } = require("../../config.json");
const { log } = require("../logger");
const { params, locale } = require("../../config.json");
const config = params;
const Localizer = require("../localizer");
const path = require("path");
const { commons } = require("../loader");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "..", "locales.json")
});

// Prefix regex, we will use to match in mention prefix.

const escapeRegex = (string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = {
	name: "messageCreate",

	async execute(message) {
		// Declares const to be used.

		const { client, guild, channel, content, author } = message;

		// Checks if the bot is mentioned in the message all alone and triggers onMention trigger.

		if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {
			require("../messages/onMention").execute(message);
			return;
		}

		const checkPrefix = prefix.toLowerCase();

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

		if (!message.content.startsWith(matchedPrefix) || message.author.bot)
			return;

		const command =
			client.commands.get(commandName) ||
			client.commands.find(
				(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
			);

		// It it's not a command, return :)

		if (!command) return;

		// Owner Only Property, add in your command properties if true.

		if (command.ownerOnly && message.author.id !== ownerId) {
			let embedOwner = new MessageEmbed()
				.setColor("RED")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setTitle(localizer._("Help on this command"))
				.setDescription(localizer.__("This command can only be executed by [[0]].", { placeholders: [`<@${ownerId}>`] }));
			return message.reply({ embeds: [embedOwner] });
		}

		// Guild Only Property, add in your command properties if true.

		if (command.guildOnly && message.channel.type === "dm") {
			return message.reply({
				content: localizer._("I can't execute this command in a DM channel!"),
			});
		}

		// Author perms property

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
				reply += localizer.__("\nCorrect usage is `[[0]][[1]] [[2]]`", { placeholders: [prefix, command.name, command.usage] })
			}

			return message.channel.send({ content: reply });
		}

		// Cooldowns

		const { cooldowns } = client;

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

		// execute the final command. Put everything above this.

		try {
			command.execute(message, args, commons);
		} catch (error) {
			log("CommandManager", error, "warn", true);
			message.reply({
				content: localizer._("An error occured while trying to run this command.")
			});
		}
	}
};