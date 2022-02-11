const { commons } = require("../loader");

module.exports = {
	name: "ready",
	once: true,

	execute(client) {

		// Execute init function of each slash command if it's defined
		client.slashCommands.forEach(({ command }) => {
			if (typeof command.init === "function") {
				command.init({client, ...commons});
			};
		});

		// Execute init function of each command if it's defined
		client.commands.forEach(({ command }) => {
			if (typeof command.init === "function") {
				command.init({client, ...commons});
			};
		});

		// Execute init function of each context menu option if it's defined
		client.contextCommands.forEach(({ command }) => {
			if (typeof command.init === "function") {
				command.init({client, ...commons});
			};
		});

		// Execute init function of each button if it's defined
		client.buttonCommands.forEach(({ command }) => {
			if (typeof command.init === "function") {
				command.init({client, ...commons});
			};
		});

		// Execute init function of each dropdown if it's defined
		client.selectCommands.forEach(({ command }) => {
			if (typeof command.init === "function") {
				command.init({client, ...commons});
			};
		});

		// Execute init function of each trigger if it's defined
		client.triggers.forEach(({ command }) => {
			if (typeof command.init === "function") {
				command.init({client, ...commons});
			};
		});

	}
};