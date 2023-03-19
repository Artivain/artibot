import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionsBitField } from "discord.js";
import Artibot from "../../index.js";

/** Slash command to create an embed */
export default async function execute(interaction: ChatInputCommandInteraction, { config, localizer, createEmbed }: Artibot): Promise<void> {
	let embed: EmbedBuilder;

	if (!interaction.inGuild()) {
		await interaction.reply({
			content: localizer._("This command can only be used in a server."),
			ephemeral: true
		});
		return;
	}

	if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
		const title: string = interaction.options.getString("title")!;
		const color: string | null = interaction.options.getString("color");
		const content: string = interaction.options.getString("content")!.replace(/\\r\\n|\\n|<br>/g, "\n");
		const footerText: string | null = interaction.options.getString("footer");
		const date: boolean = interaction.options.getBoolean("date")!;

		embed = new EmbedBuilder()
			.setColor(color as ColorResolvable ?? config.embedColor)
			.setTitle(title)
			.setDescription(content);

		if (footerText) embed.setFooter({ text: footerText });
		if (date) embed.setTimestamp();

		await interaction.channel!.send({ embeds: [embed] });

		embed = createEmbed()
			.setTitle(localizer._("Create an embed"))
			.setDescription(localizer.__("The embed *[[0]]* should have been created.", { placeholders: [title] }));
	} else {
		embed = createEmbed()
			.setColor("Red")
			.setTitle(localizer._("Create an embed"))
			.setDescription(localizer._("Error: you don't have admin perms!"));
	}

	await interaction.reply({
		embeds: [embed],
		ephemeral: true
	});
}
