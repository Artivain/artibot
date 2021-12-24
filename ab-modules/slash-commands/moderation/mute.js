/*
 * Mute command
 * By GoudronViande24
 * Uses Discord timeout function added to Discord.js 13.4.0
*/

const { MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");
const humanizeDuration = require("humanize-duration");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("mute")
		.setDescription(
			"Réduire au silence total un utilisateur."
		)
		.addUserOption(option =>
			option.setName("utilisateur")
				.setDescription("L'utilisateur à rendre muet.")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("temps")
				.setDescription("Le temps pendant lequel l'utilisateur sera muet. Exemples: '5m', '1h'.")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("raison")
				.setDescription("La raison du mute de l'utilisateur.")
		),

	async execute(interaction, config) {
		const user = interaction.options.getUser("utilisateur"),
			guild = interaction.guild,
			moderator = interaction.member,
			time = interaction.options.getString("temps"),
			reason = interaction.options.getString("raison"),
			logsReason = `${moderator.user.username} -> ${reason ? reason : "Aucune raison fournie."}`,
			humanTime = humanizeDuration(ms(time), {
				language: "fr",
				delimiter: ", ",
				largest: 2,
				round: true,
				units: ["y", "mo", "w", "d", "h", "m", "s"]
			});

		// Check for required permissions
		if (!moderator.permissions.has([Permissions.FLAGS.MODERATE_MEMBERS])) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setTitle("Mute")
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription("Vous n'avez pas la permission de faire cette commande!");

			return await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true
			});
		};

		// Check if time requested is valid
		if (ms(time) < ms("5s") || ms(time) > ms("4w")) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setTitle("Mute")
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription("`" + time + "` n'est pas une durée valide.");

			return await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true
			});
		};

		// Get the member, because for some reason Discord returns a user
		const member = await guild.members.fetch(user.id).then(m => { return m });

		// Try to timeout the member and create the embed according to what happens
		var embed = await member.timeout(ms(time), logsReason)
			.then(async member => {
				const dmEmbed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Mute")
					.setFooter(config.botName, config.botIcon)
					.setTimestamp()
					.setDescription(`Vous avez été réduit au silence par ${moderator} pendant ${humanTime} sur **${guild.name}.**.`);

				if (reason) dmEmbed.addField("Raison", reason);

				const embed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Mute")
					.setFooter(config.botName, config.botIcon)
					.setTimestamp()
					.setDescription(`${member} a bien été réduit au silence pour ${humanTime}.`);

				// Send DM to muted user to inform him of the reason and the moderator
				await member.send({ embeds: [dmEmbed] })
					.catch(error => {
						if (error == "DiscordAPIError: Cannot send messages to this user") {
							embed.addField("Note", "Cet utilisateur n'accepte pas les messages privés et n'a donc pas été averti en privé.").setColor("YELLOW");
						} else {
							embed.addField("Note", "Une erreur est survenue en essayant d'avertir l'utilisateur en privé.").setColor("ORANGE");
							console.log(error);
						}
					});

				return embed
			})
			.catch(error => {
				if (error == "DiscordAPIError: Missing Permissions") {
					var errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Mute")
						.setFooter(config.botName, config.botIcon)
						.setTimestamp()
						.setDescription(`Je n'ai pas les permissions requises pour rendre muet cet utilisateur!`);
				} else {
					console.log(error);
					var errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Mute")
						.setFooter(config.botName, config.botIcon)
						.setTimestamp()
						.setDescription(`Une erreur est survenue.`);
				};

				return errorEmbed
			});

		// finally send the response
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};