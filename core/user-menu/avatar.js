import { UserContextMenuInteraction } from "discord.js";
import Artibot from "../../index.js";

/**
 * Simple way to get the avatar of a user
 * @param {UserContextMenuInteraction} interaction 
 * @param {Artibot} artibot 
 */
export default function execute(interaction, { localizer, createEmbed }) {
	const member = interaction.targetMember;
	const avatar = member.displayAvatarURL({ dynamic: true, format: "webp", size: 512 });

	const embed = createEmbed()
		.setTitle(localizer._("Avatar"))
		.setDescription(localizer.__("Here is the profile picture of <@[[0]]>:", { placeholders: [member.id] }))
		.setImage(avatar);

	interaction.reply({
		embeds: [embed]
	});
}