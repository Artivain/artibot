import { CommandInteraction } from "discord.js";
import Artibot, { SlashCommand } from "../../index.js";

/**
 * Help slash command
 * @param {CommandInteraction} interaction 
 * @param {Artibot} artibot
 */
export default async function execute(interaction, { config, localizer, createEmbed, modules }) {
	let name = interaction.options.getString("command");

	const helpEmbed = createEmbed();

	/**
	 * List of all slash commands
	 * @type {SlashCommand[]}
	 */
	let commands = [];

	for (const [, module] of modules) {
		for (const part of module.parts) {
			if (part.type == "slashcommand") commands.push(part);
		}
	}

	if (name) {
		name = name.toLowerCase();
		// If a single command has been asked for, send only this command's help.
		helpEmbed.setTitle(localizer.__("Help on command `[[0]]`", { placeholders: [name] }));
		const command = commands.find(command => command.data.name == name);
		if (command) {
			if (command.data.description) helpEmbed.setDescription(command.data.description + "\n\n**" + localizer._("Parameters:") + "**");

			command.data.options.forEach(option => {
				/** @type {string} */
				let content = option.description;

				if (option.choices) {
					let choices = `\n${localizer._("Choices:")} `;
					option.choices.forEach(choice => choices += choice + ", ");
					choices = choices.slice(0, -2);
					content += choices;
				};

				if (!option.required) content += `\n*${localizer._("Optional")}*`;

				helpEmbed.addField(option.name, content.trim(), true);
			});

		} else {
			helpEmbed
				.setDescription(localizer.__("There is no slash command with the name `[[0]]`.", { placeholders: [name] }))
				.setColor("YELLOW");
		};
	} else {
		/**
		 * List of the names of all slash commands
		 * @type {string[]}
		 */
		const names = [];

		for (const command of commands) { names.push(command.data.name) }

		// Give a list of all the commands
		helpEmbed
			.setTitle(localizer._("List of all slash commands"))
			.setDescription(
				"`" + names.join("`, `") + "`\n\n" + localizer._("You can also have a list of classic commands with") + " `" + config.prefix + "help`."
			);
	};

	// Reply to the interaction
	await interaction.reply({
		embeds: [helpEmbed],
	});
}
