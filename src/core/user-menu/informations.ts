import { EmbedBuilder, GuildMember, UserContextMenuCommandInteraction } from "discord.js";
import Artibot from "../../index.js";

/** Get some information on a user */
export default async function execute(interaction: UserContextMenuCommandInteraction<"cached">, { config, contributors, localizer, createEmbed }: Artibot): Promise<void> {
	const infos: GuildMember = await interaction.targetMember.fetch(true);
	let type: string = localizer._("User");
	const since: number = infos.joinedTimestamp! / 1000;
	let more: string = "";

	if (infos.user.bot) {
		type = localizer._("Bot");
	} else if (infos.user.system) {
		type = localizer._("System");
	};

	if (infos.guild.ownerId === infos.user.id) {
		more += localizer._("\nIs the owner of this server.");
	};
	if (config.ownerId === infos.user.id) {
		more += localizer._("\nIs the owner of this bot.");
	};
	if (contributors.devs.find(element => element.discordId === infos.user.id)) {
		more += localizer._("\n**Is one of the super devs of this bot!**");
	};
	if (contributors.donators.find(element => element.discordId === infos.user.id)) {
		more += localizer._("\n**Is one of the super donators of this bot!**");
	};

	const embed: EmbedBuilder = createEmbed()
		.setTitle(localizer._("Information on the user"))
		.setDescription(
			localizer._("Name on the server: ") + (infos.nickname ? infos.nickname : infos.user.username) + "\n" +
			localizer._("Tag:") + " `" + infos.user.username + "#" + infos.user.discriminator + "`\n" +
			localizer._("ID:") + " `" + infos.user.id + "`" +
			more
		)
		.addFields(
			{ name: localizer._("Type"), value: type },
			{ name: localizer._("On this server since"), value: `<t:${since}:f> (<t:${since}:R>)` }
		);

	await interaction.reply({ embeds: [embed] });
}