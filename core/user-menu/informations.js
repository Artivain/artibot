import { UserContextMenuInteraction } from "discord.js";
import Artibot from "../../index.js";

/**
 * Get some information on a user
 * @param {UserContextMenuInteraction} interaction 
 * @param {Artibot} artibot
 */
export default function execute(interaction, { config, contributors, localizer, createEmbed }) {
	const infos = interaction.targetMember;
	let type = localizer._("User");
	const since = parseInt(infos.joinedTimestamp / 1000);

	if (infos.user.bot) {
		type = localizer._("Bot");
	} else if (infos.user.system) {
		type = localizer._("System");
	};

	var more = "";
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

	const embed = createEmbed()
		.setTitle(localizer._("Information on the user"))
		.setDescription(
			localizer._("Name on the server: ") + (infos.nickname ? infos.nickname : infos.user.username) + "\n" +
			localizer._("Tag:") + " `" + infos.user.username + "#" + infos.user.discriminator + "`\n" +
			localizer._("ID:") + " `" + infos.user.id + "`" +
			more
		)
		.addField(localizer._("Type"), type)
		.addField(localizer._("On this server since"), `<t:${since}:f> (<t:${since}:R>)`);

	interaction.reply({ embeds: [embed] });
}