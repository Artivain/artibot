/**
 * Unmute command
 * Uses Discord timeout feature added in Discord.js 13.4.0
 * @author GoudronViande24
 * @since 1.0.1
 */

const { MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("unmute")
		.setDescription(localizer._("Unmutes a user."))
		.addUserOption(option =>
			option.setName("user")
				.setDescription(localizer._("The user to unmute."))
				.setRequired(true)
		),

	async execute(interaction, { config }) {
		const user = interaction.options.getUser("user"),
			guild = interaction.guild,
			moderator = interaction.member;

		// Check for required permissions
		if (!moderator.permissions.has([Permissions.FLAGS.MODERATE_MEMBERS])) {
			const errorEmbed = new MessageEmbed()
				.setColor("RED")
				.setTitle("Unmute")
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer._("You don't have the required permissions to execute this command!"));

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
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer._(localizer._("This user is not muted...\nA second mouth would be weird, right?")));

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
					.setFooter({ text: config.botName, iconURL: config.botIcon })
					.setTimestamp()
					.setDescription(localizer.__("[[0]] unmuted you on **[[1]]**.", { placeholders: [moderator, guild.name] }));

				const embed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Unmute")
					.setFooter({ text: config.botName, iconURL: config.botIcon })
					.setTimestamp()
					.setDescription(localizer.__("[[0]] got his voice back.", { placeholders: [member] }));

				// Send DM to muted user to inform him of the reason and the moderator
				await member.send({ embeds: [dmEmbed] })
					.catch(error => {
						if (error == "DiscordAPIError: Cannot send messages to this user") {
							embed.addField(localizer._("Note"), localizer._("This user does not accept DMs and so has not been warned in DM.")).setColor("YELLOW");
						} else {
							embed.addField(localizer._("Note"), localizer._("An error occured while trying to send a DM to the user.")).setColor("ORANGE");
							console.log(error);
						};
					});

				return embed
			})
			.catch(error => {
				if (error == "DiscordAPIError: Missing Permissions") {
					var errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Unmute")
						.setFooter({ text: config.botName, iconURL: config.botIcon })
						.setTimestamp()
						.setDescription(localizer._("I don't have required permissions to mute this user!"));
				} else {
					console.log(error);
					var errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Unmute")
						.setFooter({ text: config.botName, iconURL: config.botIcon })
						.setTimestamp()
						.setDescription(localizer._("An error occured."));
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