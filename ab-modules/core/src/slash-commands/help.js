const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { localizer } = require("../../index");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription(localizer._("Gives a list of commands or infos about a specific command."))
		.addStringOption(option =>
			option
				.setName("command")
				.setDescription(localizer._("The command to get infos on."))
		),

	async execute(interaction, { config }) {

		const commands = interaction.client.slashCommands;
		let name = interaction.options.getString("command");

		const helpEmbed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTimestamp()
			.setFooter({ text: config.botName, iconURL: config.botIcon });

		if (name) {
			name = name.toLowerCase();
			// If a single command has been asked for, send only this command's help.
			helpEmbed.setTitle(localizer.__("Help on command `[[0]]`", { placeholders: [name] }));
			if (commands.has(name)) {
				const command = commands.get(name).command.data;
				if (command.description) helpEmbed.setDescription(command.description + "\n\n**" + localizer._("Parameters:") + "**");
				command.options.forEach(option => {
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
				helpEmbed.setDescription(localizer.__("There is no slash command with the name `[[0]]`.", { placeholders: [name] })).setColor("YELLOW");
			};
		} else {
			// Give a list of all the commands
			helpEmbed
				.setTitle(localizer._("List of all slash commands"))
				.setDescription(
					"`" + commands.map(({ command }) => command.data.name).join("`, `") + "`\n\n" + localizer._("You can also have a list of classic commands with") + " `" + config.prefix + "help`."
				);
		};

		// Reply to the interaction
		await interaction.reply({
			embeds: [helpEmbed],
		});
	},
};
