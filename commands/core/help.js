/**
 * @file Commande d'aide dynamique
 * @author Artivain
 * @since 1.0.0
 */

// Deconstructing prefix from config file to use in help command
const { prefix, params } = require("./../../config.json");

// Deconstructing MessageEmbed to create embeds within this command
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "help",
	description: "Donne une liste des commandes disponibles avec le bot.",
	aliases: ["commands", "aide"],
	usage: "[command name]",
	cooldown: 5,

	/**
	 * @description Executes when the command is called by command handler.
	 * @author Naman Vrati
	 * @param {Object} message The Message Object of the command.
	 * @param {String[]} args The Message Content of the received message seperated by spaces (' ') in an array, this excludes prefix and command/alias itself.
	 */

	execute(message, args) {
		const { commands } = message.client;

		// If there are no args, it means it needs whole help command.

		if (!args.length) {
			/**
			 * @type {Object}
			 * @description Help command embed object
			 */

			let helpEmbed = new MessageEmbed()
				.setColor(params.embedColor)
				.setURL(process.env.URL)
				.setTitle("Liste de toutes les commandes disponibles")
				.setDescription(
					"`" + commands.map((command) => command.name).join("`, `") + "`"
				)
				.setFooter(params.botName, params.botIcon)
				.setTimestamp()
				.addField(
					"Utilisation",
					`\nTu peux envoyer \`${prefix}help [nom de la commande]\` pour avoir plus d'information sur une commande spécifique!`
				);

			// Attempts to send embed in DMs.

			return message.author
				.send({ embeds: [helpEmbed] })

				.then(() => {
					if (message.channel.type === "dm") return;

					// On validation, reply back.

					message.reply({
						content: "Je t'ai envoyé un message privé avec la liste de mes commandes",
					});
				})
				.catch((error) => {
					// On failing, throw error.

					console.error(
						`Impossible d'envoyer la liste des commandes en MP à ${message.author.tag}.\n`,
						error
					);

					message.reply({ content: "On dirait que c'est impossible pour moi de t'envoyer un message privé!" });
				});
		}

		// If argument is provided, check if it's a command.

		/**
		 * @type {String}
		 * @description First argument in lower case
		 */

		const name = args[0].toLowerCase();

		/**
		 * @type {Object}
		 * @description The command object
		 */

		const command =
			commands.get(name) ||
			commands.find((c) => c.aliases && c.aliases.includes(name));

		// If it's an invalid command.

		if (!command) {
			return message.reply({ content: "Ceci n'est pas une commande valide..." });
		}

		/**
		 * @type {Object}
		 * @description Embed of Help command for a specific command.
		 */

		let commandEmbed = new MessageEmbed()
			.setColor(params.embedColor)
			.setFooter(params.botName, params.botIcon)
			.setTimestamp()
			.setTitle("Aide sur la commande");

		if (command.description)
			commandEmbed.setDescription(`${command.description}`);

		if (command.aliases)
			commandEmbed
				.addField("Alias", `\`${command.aliases.join(", ")}\``, true)
				.addField("Temps de repos", `${command.cooldown || 3} seconde(s)`, true);
		if (command.usage)
			commandEmbed.addField(
				"Utilisation",
				`\`${prefix}${command.name} ${command.usage}\``,
				true
			);

		// Finally send the embed.

		message.channel.send({ embeds: [commandEmbed] });
	},
};