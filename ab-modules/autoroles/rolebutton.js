/**
 * Auto role button
 * @since 2.0.0
 * @author GoudronViande24
 */

const { MessageEmbed } = require("discord.js");
const Localizer = require("artibot-localizer");
const path = require("path");
const { locale } = require("../../config.json");

const localizer = new Localizer({
	lang: locale,
	filePath: path.resolve(__dirname, "locales.json")
});

module.exports = {
	id: "autorole-*",

	async execute(interaction, { config }) {
		const roleId = interaction.customId.split("-")[2],
			mode = interaction.customId.split("-")[1];

		const embed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTitle("Autorole")
			.setFooter({ text: config.botName, iconURL: config.botIcon })
			.setTimestamp();

		const role = await interaction.guild.roles.fetch(roleId);

		switch (mode) {
			case "toggle":
				if (interaction.member.roles.cache.has(roleId)) {
					await interaction.member.roles.remove(roleId);
					embed.setDescription(localizer.__("You no longer have the [[0]] role.", { placeholders: [role.name] }));
				} else {
					await interaction.member.roles.add(roleId);
					embed.setDescription(localizer.__("You now have the [[0]] role.", { placeholders: [role.name] }));
				};
				break;

			case "addonly":
				await interaction.member.roles.add(roleId);
				embed.setDescription(localizer.__("You now have the [[0]] role.", { placeholders: [role.name] }));
				break;

			case "removeonly":
				await interaction.member.roles.remove(roleId);
				embed.setDescription(localizer.__("You no longer have the [[0]] role.", { placeholders: [role.name] }));
				break;

			default:
				throw new Error(localizer._("Requested mode is not valid!"));
		};

		return await interaction.reply({
			embeds: [embed],
			ephemeral: true
		})
	}
};