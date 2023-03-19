import { StringSelectMenuInteraction } from "discord.js";
import Artibot from "../index.js";

/**
 * Error message for select menu interaction
 * @param {SelectMenuInteraction} interaction
 * @param {Artibot} artibot
 */
export default async function execute(interaction: StringSelectMenuInteraction, { localizer }: Artibot): Promise<void> {
	await interaction.reply({
		content: localizer._("There was an error with this menu option!"),
		ephemeral: true
	});
}
