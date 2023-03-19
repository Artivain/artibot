import { ButtonInteraction } from "discord.js";
import Artibot from "../index.js";

/** Send button error message */
export default async function execute(interaction: ButtonInteraction, { localizer }: Artibot): Promise<void> {
	await interaction.reply({
		content: localizer._("There was an error with this button!"),
		ephemeral: true
	});
}
