const { MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("embed")
		.setDescription(
			"Crée un embed et l'envoie dans le salon."
		)
		.addStringOption(option =>
			option.setName("titre")
				.setDescription("Le titre du embed")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("contenu")
				.setDescription("Le contenu du embed (message, règlements, informations, etc...)")
				.setRequired(true)
		)
		.addBooleanOption(option =>
			option.setName("date")
				.setDescription("Mettre ou non la date dans le footer")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("footer")
				.setDescription("Le texte à mettre dans le footer du embed")
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("couleur")
				.setDescription("La couleur qui sera à gauche du embed (en hexadécimal, ex.: #ffffff)")
				.setRequired(false)
		),

	async execute(interaction, config) {

		if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {

			const title = interaction.options.getString("titre"),
						color = interaction.options.getString("couleur"),
						content = interaction.options.getString("contenu"),
						footerText = interaction.options.getString("footer"),
						date = interaction.options.getBoolean("date");

			var embed = new MessageEmbed()
				.setColor((color ? color : config.embedColor))
				.setTitle(title)
				.setDescription(content);

			if (footerText) embed.setFooter(footerText);
			if (date) embed.setTimestamp();

			interaction.channel.send({
				embeds: [embed]
			})

			var embed = new MessageEmbed()
				.setColor(config.embedColor)
				.setTitle("Créer un embed")
				.setFooter({text: config.botName, iconURL: config.botIcon})
				.setTimestamp()
				.setDescription("Le embed *" + title+ "* devrait normalement avoir été créé.");
		} else {
			var embed = new MessageEmbed()
				.setColor("RED")
				.setTitle("Créer un embed")
				.setFooter({text: config.botName, iconURL: config.botIcon})
				.setTimestamp()
				.setDescription("Erreur: vous n'avez pas les permissions administrateur!");
		}

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	},
};
