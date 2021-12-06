const { Collection } = require("discord.js");
const { prefix, ownerId } = require("../../config.json");
const config = require("../../config.json").params;

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
		// You can change the behavior as per your liking at ./messages/onMention.js

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
			return message.reply({ content: `Cette commande ne peut être exécutée que par <@${ownerId}>.` });
		}

		// Guild Only Property, add in your command properties if true.

		if (command.guildOnly && message.channel.type === "dm") {
			return message.reply({
				content: "Je ne peux pas exécuter cette commande dans une conversation privée!",
			});
		}

		// Author perms property

		if (command.permissions) {
			const authorPerms = message.channel.permissionsFor(message.author);
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return message.reply({ content: "Tu n'as pas la permission d'utiliser cette commande!" });
			}
		}

		// Args missing

		if (command.args && !args.length) {
			let reply = `Tu n'as pas fourni d'argument, ${message.author}!`;

			if (command.usage) {
				reply += `\nL'utilisation appropriée est: \`${prefix}${command.name} ${command.usage}\``;
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
					content: `Tu dois attendre encore ${timeLeft.toFixed(
						1
					)} seconde(s) avant de réutiliser la commande \`${command.name}\`.`,
				});
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		// execute the final command. Put everything above this.

		try {
			command.execute(message, args, config);
		} catch (error) {
			console.error(error);
			message.reply({
				content: "Il y a eu une erreur lors de l'exécution de cette commande.",
			});
		}
	},
};