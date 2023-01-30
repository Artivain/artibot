import { CommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Artibot from "../../index.js";

/**
 * Slash command to create an embed
 * @param {CommandInteraction} interaction 
 * @param {Artibot} artibot 
 */
export default async function execute(interaction, { config, localizer, createEmbed }) {

	if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

		const title = interaction.options.getString("title"),
			color = interaction.options.getString("color"),
			content = interaction.options.getString("content").replace(/\\r\\n|\\n|<br>/g, "\n"),
			footerText = interaction.options.getString("footer"),
			date = interaction.options.getBoolean("date");

		var embed = new EmbedBuilder()
			.setColor((color ? color : config.embedColor))
			.setTitle(title)
			.setDescription(content);

		if (footerText)
			embed.setFooter({ text: footerText });
		if (date)
			embed.setTimestamp();

		interaction.channel.send({ embeds: [embed] });

		var embed = createEmbed()
			.setTitle(localizer._("Create an embed"))
			.setDescription(localizer.__("The embed *[[0]]* should have been created.", { placeholders: [title] }));
	} else {
		var embed = createEmbed()
			.setColor("Red")
			.setTitle(localizer._("Create an embed"))
			.setDescription(localizer._("Error: you don't have admin perms!"));
	}

	await interaction.reply({
		embeds: [embed],
		ephemeral: true
	});
}
