module.exports = {
	name: "guildCreate",
	
	async execute(guild) {
		console.log("[Artibot] Ajouté à un nouveau serveur:", guild.name)
	}
}