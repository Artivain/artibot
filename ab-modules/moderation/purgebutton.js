/**
 * Purge X messages
 * @author GoudronViande24
 * @since 1.2.0
 */

const { MessageEmbed, Permissions } = require("discord.js");
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	id: "purge-*",

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

		const amount = interaction.customId.split("-")[1];

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

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};