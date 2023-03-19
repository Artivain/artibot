import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Artibot from "../../index.js";
import { SlashCommand } from "../../modules.js";

/** Help slash command */
export default async function execute(interaction: ChatInputCommandInteraction, { config, localizer, createEmbed, modules }: Artibot): Promise<void> {
	let name: string | null = interaction.options.getString("command");

	const helpEmbed: EmbedBuilder = createEmbed();

	/** List of all slash commands */
	const commands: SlashCommand[] = [];

	for (const [, module] of modules) {
		for (const part of module.parts) {
			if (part instanceof SlashCommand) commands.push(part);
		}
	}

	if (name) {
		name = name.toLowerCase();
		// If a single command has been asked for, send only this command's help.
		helpEmbed.setTitle(localizer.__("Help on command `[[0]]`", { placeholders: [name] }));
		const command: SlashCommand | undefined = commands.find(command => command.data.name == name);

		if (command) {
			if (command.data.description) helpEmbed.setDescription(command.data.description + "\n\n**" + localizer._("Parameters:") + "**");
		} else {
			helpEmbed
				.setDescription(localizer.__("There is no slash command with the name `[[0]]`.", { placeholders: [name] }))
				.setColor("Yellow");
		}
	} else {
		/** List of the names of all slash commands */
		const names: string[] = [];

		for (const command of commands) {
			if (command.data.name) names.push(command.data.name);
		}

		// Give a list of all the commands
		helpEmbed
			.setTitle(localizer._("List of all slash commands"))
			.setDescription(
				"`" + names.join("`, `") + "`\n\n" + localizer._("You can also have a list of classic commands with") + " `" + config.prefix + "help`."
			);
	}

	// Reply to the interaction
	await interaction.reply({
		embeds: [helpEmbed]
	});
}
