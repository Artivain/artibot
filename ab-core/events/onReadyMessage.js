module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		console.log(`[Artibot] Prêt! Connecté en tant que ${client.user.tag}`);
	},
};