module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		console.log("Started"); // Pour les serveurs pterodactyl utilisant l'egg de Artivain, comme les hébergements Gameverse
		console.log(`[Artibot] Prêt! Connecté en tant que ${client.user.tag}`);
	},
};