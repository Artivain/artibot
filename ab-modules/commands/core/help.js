const { log } = require("../../../ab-core/logger");
const { prefix } = require("../../../config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "help",
	description: "Donne une liste des commandes disponibles avec le bot.",
	aliases: ["commands", "aide"],
	usage: "[nom de la commande]",
	cooldown: 5,

	execute(message, args, config) {
		const { commands } = message.client;

		// If there are no args, it means it needs whole help command.

		if (!args.length) {

			let helpEmbed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Liste de toutes les commandes disponibles")
				.setDescription(
					"`" + commands.map((command) => command.name).join("`, `") + "`"
				)
				.setFooter({text: config.botName, iconURL: config.botIcon})
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

					log(
						"Core",
						`Impossible d'envoyer la liste des commandes en MP à ${message.author.tag}. Détails de l'erreur: ${error}`,
						"warn",
						true
					);

					message.reply({ content: "On dirait que c'est impossible pour moi de t'envoyer un message privé!" });
				});
		}

		// If argument is provided, check if it's a command.

		const name = args[0].toLowerCase();

		const command =
			commands.get(name) ||
			commands.find((c) => c.aliases && c.aliases.includes(name));

		// If it's an invalid command.

		if (!command) {
			return message.reply({ content: "`" + args[0] + "` n'est pas une commande valide..." });
		}

		let commandEmbed = new MessageEmbed()
			.setColor(config.embedColor)
			.setFooter({text: config.botName, iconURL: config.botIcon})
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
