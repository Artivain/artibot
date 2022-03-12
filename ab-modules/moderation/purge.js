/**
 * Purge command
 * @author GoudronViande24
 * @since 1.2.0
 */

const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription(localizer._("Mass delete messages."))
		.addIntegerOption(option =>
			option.setName("amount")
				.setDescription(localizer._("How much messages to delete?"))
				.setRequired(true)
				.setMaxValue(100)
				.setMinValue(0)
		),

	async execute(interaction, { config }) {
		if (!interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setTitle("Purge")
						.setFooter({ text: config.botName, iconURL: config.botIcon })
						.setTimestamp()
						.setDescription(localizer._("**Error:** You do not have the required permissions to use this command!"))
				],
				ephemeral: true
			});
		};

		const amount = interaction.options.getInteger("amount");

		const deleted = await interaction.channel.bulkDelete(amount, true);

		const embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTitle("Purge")
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setTimestamp()
			.setDescription(
				localizer.__("Deleted [[0]] messages.", { placeholders: [deleted.size] }) + (
					deleted.size < 1 ? "\n\n" + localizer._("By the way, I cannot delete messages older than 2 weeks.") : ""
				)
			);

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel(localizer.__("Delete [[0]] more", { placeholders: [5] }))
					.setStyle("DANGER")
					.setCustomId("purge-5")
			)
			.addComponents(
				new MessageButton()
					.setLabel(localizer.__("Delete [[0]] more", { placeholders: [10] }))
					.setStyle("DANGER")
					.setCustomId("purge-10")
			)
			.addComponents(
				new MessageButton()
					.setLabel(localizer.__("Delete [[0]] more", { placeholders: [20] }))
					.setStyle("DANGER")
					.setCustomId("purge-20")
			)
			.addComponents(
				new MessageButton()
					.setLabel(localizer.__("Delete [[0]] more", { placeholders: [50] }))
					.setStyle("DANGER")
					.setCustomId("purge-50")
			);

		await interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true
		});
	}
};