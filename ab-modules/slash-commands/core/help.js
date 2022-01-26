const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { prefix } = require("../../../config.json");

module.exports = {
	// The data needed to register slash commands to Discord.
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription(
			"Donne une liste des commandes ou de l'information sur une commande spécifique."
		)
		.addStringOption(option =>
			option
				.setName("commande")
				.setDescription("La commande sur laquelle obtenir de l'aide.")
		),

	async execute(interaction, config) {

		const commands = interaction.client.slashCommands;
		const name = interaction.options.getString("commande").toLowerCase();

		const helpEmbed = new MessageEmbed()
			.setColor(config.embedColor)
			.setTimestamp()
			.setFooter({text: config.botName, iconURL: config.botIcon});

		if (name) {
			// If a single command has been asked for, send only this command's help.
			helpEmbed.setTitle(`Aide pour la commande \`${name}\``);
			if (commands.has(name)) {
				const command = commands.get(name).data;
				if (command.description) helpEmbed.setDescription(command.description + "\n\n**Paramètres:**");
				command.options.forEach(option => {
					let content = option.description;
					if (option.choices) {
						let choices = "\nChoix: ";
						option.choices.forEach(choice => choices += choice + ", ");
						choices = choices.slice(0, -2);
						content += choices;
					};
					if (!option.required) content += "\n*Facultatif*";
					helpEmbed.addField(option.name, content.trim(), true);
				});
			} else {
				helpEmbed.setDescription(`Il n'y a pas de commande slash avec le nom \`${name}\`.`).setColor("YELLOW");
			};
		} else {
			// Give a list of all the commands
			helpEmbed
				.setTitle("Liste de toutes les commandes slash")
				.setDescription(
					"`" + commands.map((command) => command.data.name).join("`, `") + "`\n\nTu peux aussi avoir la liste des commandes normales avec `" + prefix + "help`."
				);
		};

		// Reply to the interaction
		await interaction.reply({
			embeds: [helpEmbed],
		});
	},
};
