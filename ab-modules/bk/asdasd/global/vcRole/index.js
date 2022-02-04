module.exports = {
	name: "vcRole",

	execute(client, config) {
		config.module = require("./config.json");
		console.log("[vcRole] Prêt.")
		client.on("voiceStateUpdate", (oldState, newState) => {
			const role = newState.guild.roles.cache.find(role => role.name.toLowerCase() == config.module.role.toLowerCase());

			if (!role && config.module.debug) console.log(
				"[vcRole] (debug) Impossible de trouver le rôle",
				config.module.role,
				"dans le serveur",
				newState.guild.name
			);

			if (!role) return;

			if (newState.channelId) {
				newState.member.roles.add(role);
			} else {
				newState.member.roles.remove(role);
			};
		});
	}
};