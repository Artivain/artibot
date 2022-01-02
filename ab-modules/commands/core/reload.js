const { log } = require("../../../ab-core/logger");
const fs = require("fs");
const { disabledModules } = require("../../../config.json");

module.exports = {
	name: "reload",
	description: "Recharge une commande",
	args: "<nom de la commande>",
	ownerOnly: true,

	execute(message, args, config) {

		const commandName = args[0].toLowerCase();

		const command =
			message.client.commands.get(commandName) ||
			message.client.commands.find(
				(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
			);

		// Command returns if there is no such command with the specific command name or alias.
		if (!command) {
			return message.channel.send({
				content: `Il n'y a aucune commande avec le nom ou l'alias \`${commandName}\`, ${message.author}!`,
			});
		}

		const commandFolders = fs.readdirSync("./ab-modules/commands", { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
			.filter(name => !disabledModules.includes(name));

		const folderName = commandFolders.find((folder) =>
			fs.readdirSync(`./ab-modules/commands/${folder}`).includes(`${command.name}.js`)
		);

		// Deletes current cache of that specified command.

		delete require.cache[
			require.resolve(`../${folderName}/${command.name}.js`)
		];

		// Tries Registering command again with new code.

		try {

			const newCommand = require(`../${folderName}/${command.name}.js`);

			// Now registers the command in commands Collection. If it fails, the catch block will be executed.
			message.client.commands.set(newCommand.name, newCommand);

			// 🎉 Confirmation sent if reloading was successful!
			message.channel.send({
				content: `La commande \`${newCommand.name}\` a bien été rafraichie!`
			});
			log("CommandManager", `Commande ${newCommand.name} rafraichie.`, "log", true);
		} catch (error) {
			// Catch block executes if there is any error in your code. It logs the error in console and also sends back in discord GUI.

			log("CommandManager", error, "warn", true);
			message.channel.send({
				content: `Il y a eu une erreur lors du rechargement de la commadne \`${command.name}\`:\n\`${error.message}\``,
			});
		};
	}
};
