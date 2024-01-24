import { EmbedBuilder, GuildMember, UserContextMenuCommandInteraction } from "discord.js";
import Artibot from "../../index.js";

/** Simple way to get the avatar of a user */
export default async function execute(interaction: UserContextMenuCommandInteraction<"cached">, { localizer, createEmbed }: Artibot): Promise<void> {
	const member: GuildMember = interaction.targetMember!;
	const avatar: string = member.displayAvatarURL({
		size: 512,
		forceStatic: false,
		extension: "webp"
	});

	const embed: EmbedBuilder = createEmbed()
		.setTitle(localizer._("Avatar"))
		.setDescription(localizer.__("Here is the profile picture of <@[[0]]>:", { placeholders: [member.id] }))
		.setImage(avatar);

	await interaction.reply({
		embeds: [embed]
	});
}