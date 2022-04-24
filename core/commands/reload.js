const { localizer } = require("../../index");

module.exports = {
	name: "reload",
	description: localizer._("Reloads a command"),
	args: localizer._("<name of the command>"),
	ownerOnly: true,

	execute(message, args, { log }) {

		const commandName = args[0].toLowerCase();

		const data =
			message.client.commands.get(commandName) ||
			message.client.commands.find(({ command }) => command.aliases && command.aliases.includes(commandName));

		// Command returns if there is no such command with the specific command name or alias.
		if (!data) {
			return message.channel.send({
				content: localizer.__("There is no command with the name or alias `[[0]]`, [[1]]!", { placeholders: [commandName, message.author] }),
			});
		};

		// Deletes current cache of that specified command.
		const filePath = `../../../${data.module.id}/${data.part.path}`;
		delete require.cache[
			require.resolve(filePath)
		];

		// Tries Registering command again with new code.

		try {

			const newCommand = require(filePath);

			// Now registers the command in commands Collection. If it fails, the catch block will be executed.
			message.client.commands.set(newCommand.name, { command: newCommand, part: data.part, module: data.module });

			// 🎉 Confirmation sent if reloading was successful!
			message.channel.send({ content: localizer.__("The command `[[0]]` has been reloaded!", { placeholders: [newCommand.name] }) });
			log("CommandManager", localizer.__("Reloaded command [[0]]", { placeholders: [newCommand.name] }), "log", true);
		} catch (error) {
			// Catch block executes if there is any error in your code. It logs the error in console and also sends back in discord GUI.

			log("CommandManager", error, "warn", true);
			message.channel.send({ content: localizer.__("An error occured while reloading the `[[0]]` command:\n`[[1]]`", { placeholders: [data.command.name, error.message] }) });
		};
	}
};
