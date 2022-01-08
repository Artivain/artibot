const { params, devMode, testGuildId } = require("../../config.json");
params.devMode = devMode;
params.testGuildId = testGuildId;

module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		// Execute init function of each command if it's defined
		client.slashCommands.forEach(command => {
			if (typeof command.init === "function") {
				command.init(client, params);
			};
		});
	}
};