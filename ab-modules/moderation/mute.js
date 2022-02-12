/**
 * Mute command
 * Uses Discord timeout feature added in Discord.js 13.4.0
 * @author GoudronViande24
 * @since 1.0.0
 */

const { MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const ms = require("ms");
const humanizeDuration = require("humanize-duration");
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
		.setName("mute")
		.setDescription(localizer._("Mute a user."))
		.addUserOption(option =>
			option.setName("user")
				.setDescription(localizer._("The user to mute."))
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("duration")
				.setDescription(localizer._("How much time the user must stay muted. Examples: '5m', '1h'."))
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription(localizer._("The reason why the user gets muted."))
		),

	async execute(interaction, { config, log }) {
		const user = interaction.options.getUser("user"),
			guild = interaction.guild,
			moderator = interaction.member,
			time = interaction.options.getString("duration"),
			reason = interaction.options.getString("reason"),
			logsReason = `${moderator.user.username} -> ${reason ? reason : localizer._("No reason given.")}`,
			humanTime = humanizeDuration(ms(time), {
				language: config.locale,
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
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer._("You don't have the required permissions to execute this command!"));

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
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp()
				.setDescription(localizer.__("`[[0]]` is not a valid duration.", { placeholders: [time] }));

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
					.setFooter({ text: config.botName, iconURL: config.botIcon })
					.setTimestamp()
					.setDescription(localizer.__("You have been muted by [[0]] for [[1]] on **[[1]]** server.", { placeholders: [moderator, humanTime, guild.name] }));

				if (reason) dmEmbed.addField("Reason", reason);

				const embed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle("Mute")
					.setFooter({ text: config.botName, iconURL: config.botIcon })
					.setTimestamp()
					.setDescription(localizer.__("[[0]] has been muted for [[1]].", { placeholders: [member, humanTime] }));

				// Send DM to muted user to inform him of the reason and the moderator
				await member.send({ embeds: [dmEmbed] })
					.catch(error => {
						if (error == "DiscordAPIError: Cannot send messages to this user") {
							embed.addField(localizer._("Note"), localizer._("This user does not accept DMs and so has not been warned in DM.")).setColor("YELLOW");
						} else {
							embed.addField(localizer._("Note"), localizer._("An error occured while trying to send a DM to the user.")).setColor("ORANGE");
							log("Moderation", error);
						};
					});

				return embed
			})
			.catch(error => {
				if (error == "DiscordAPIError: Missing Permissions") {
					var errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Mute")
						.setFooter({ text: config.botName, iconURL: config.botIcon })
						.setTimestamp()
						.setDescription(localizer._("I don't have required permissions to mute this user!"));
				} else {
					console.log(error);
					var errorEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Mute")
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