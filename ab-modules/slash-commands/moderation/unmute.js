/*
 * Unmute command
 * By GoudronViande24
 * Uses Discord timeout function added to Discord.js 13.4.0
*/

const { MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("unmute")
		.setDescription(
			"Redonner le droit de parole à un utilisateur."
		)
		.addUserOption(option =>
			option.setName("utilisateur")
				.setDescription("L'utilisateur à rendre muet.")
				.setRequired(true)
		),

	async execute(interaction, config) {
		const user = interaction.options.getUser("utilisateur"),
			guild = interaction.guild,
			moderator = interaction.member;

		// Check for required permissions
		if (!moderator.permissions.has([Permissions.FLAGS.MODERATE_MEMBERS])) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setTitle("Unmute")
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription("Vous n'avez pas la permission de faire cette commande!");

			return await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true
			});
		};

		// Get the member, because for some reason Discord returns a user
		const member = await guild.members.fetch(user.id).then(m => { return m });

		if (member.communicationDisabledUntil == null) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setTitle("Unmute")
				.setFooter(config.botName, config.botIcon)
				.setTimestamp()
				.setDescription("Cet utilisateur n'est pas muet...\nUne deuxième bouche serait bizarre, non?");

			return await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true
			});
		};

		// Try to timeout the member and create the embed according to what happens
		var embed = await member.timeout(null)
			.then(async member => {
				const dmEmbed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Unmute")
					.setFooter(config.botName, config.botIcon)
					.setTimestamp()
					.setDescription(`${moderator} vient de vous redonner le droit de parler sur **${guild.name}.**`);

				const embed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Unmute")
					.setFooter(config.botName, config.botIcon)
					.setTimestamp()
					.setDescription(`${member} a bien retrouvé sa voix.`);

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
						.setTitle("Unmute")
						.setFooter(config.botName, config.botIcon)
						.setTimestamp()
						.setDescription(`Je n'ai pas les permissions requises pour rendre la parole à cet utilisateur!`);
				} else {
					console.log(error);
					var errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Unmute")
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