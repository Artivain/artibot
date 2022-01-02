/* 
 * Module Welcome pour Artibot
 * Par GoudronViande24 (https://github.com/GoudronViande24)
 * Permet d'enoyer des messages de bienvenue et d'au revoir dans un salon dédié.
*/

const { debug, servers } = require("./config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "Welcome",

	async execute(client, config) {

		// Welcome
		client.on("guildMemberAdd", async member => {
			if (debug) console.log(`[Welcome] (debug) ${member.user.username} vient de rejoindre ${member.guild.name}`);
			
			// If there is nothing in the config for this server, skip.
			if (!(member.guild.id in servers)) {
				if (debug) console.log(`[Welcome] (debug) ${member.guild.name} n'est pas dans le fichier de configuration.`);
				return
			};
			// If welcome is not activated for the server, skip.
			if (!servers[member.guild.id].welcome.activate) return;

			let guild = member.guild;
			guild.config = servers[member.guild.id];
			const welcomeChannel = await member.guild.channels.fetch(guild.config.welcome.channel);

			// Create content for the embed, based on preferences from the config
			let content = `Bienvenue dans le serveur ${guild.config.name? guild.config.name : guild.name}!`;
			if (guild.config.welcome.showMemberCount) content += `\nNous sommes maintenant **${guild.memberCount}** membres.`;

			const color = (await member.user.fetch(true)).accentColor || config.embedColor;

			const embed = new MessageEmbed()
				.setColor(color)
				.setTitle(`${member.user.username} vient de rejoindre le serveur!`)
				.setDescription(content)
				.setFooter(config.botName, config.botIcon)
				.setTimestamp();

			if (guild.config.welcome.showProfilePicture) {
				embed.setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=512`);
			};

			if (guild.config.welcome.customInfo) embed.addField("Informations", guild.config.welcome.customInfo);

			return await welcomeChannel.send({
				embeds: [embed]
			});

		});

		// Farewell
		client.on("guildMemberRemove", async member => {
			if (debug) console.log(`[Welcome] (debug) ${member.user.username} vient de quitter ${member.guild.name}`);
			
			// If there is nothing in the config for this server, skip.
			if (!(member.guild.id in servers)) {
				if (debug) console.log(`[Welcome] (debug) ${member.guild.name} n'est pas dans le fichier de configuration.`);
				return
			};
			// If farewell is not activated for the server, skip.
			if (!servers[member.guild.id].farewell.activate) return;

			let guild = member.guild;
			guild.config = servers[member.guild.id];
			const farewellChannel = await member.guild.channels.fetch(guild.config.farewell.channel);

			// Create content for the embed, based on preferences from the config
			let content = "On espère te revoir bientôt!";
			if (guild.config.farewell.showMemberCount) content += `\nNous sommes maintenant **${guild.memberCount}** membres.`;

			const color = (await member.user.fetch(true)).accentColor || config.embedColor;

			const embed = new MessageEmbed()
				.setColor(color)
				.setTitle(`${member.user.username} vient de quitter le serveur.`)
				.setDescription(content)
				.setFooter(config.botName, config.botIcon)
				.setTimestamp();

			if (guild.config.farewell.showProfilePicture) {
				embed.setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=512`);
			};

			if (guild.config.farewell.customInfo) embed.addField("Informations", guild.config.welcome.customInfo);

			return await farewellChannel.send({
				embeds: [embed]
			});

		});

		console.log("[Welcome] Prêt.");

	}
};