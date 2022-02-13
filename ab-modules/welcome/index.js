/** 
 * Welcome module for Artibot
 * @author GoudronViande24
 */

const { debug, servers } = require("./config.json");
const { MessageEmbed } = require("discord.js");
const Localizer = require("artibot-localizer");
const path = require("path");

module.exports = {
	name: "Welcome",

	manifest: {
		manifestVersion: 1,
		moduleVersion: "2.0.0",
		name: "Welcome",
		supportedLocales: [
			"en",
			"fr"
		],
		parts: [
			{
				id: "welcome",
				type: "global",
				path: "index.js"
			}
		]
	},

	async execute({ client, config, log }) {
		// Initializer localizer
		const localizer = new Localizer({
			lang: config.locale,
			filePath: path.resolve(__dirname, "locales.json")
		});

		// Welcome
		client.on("guildMemberAdd", async member => {
			if (debug) log("Welcome", localizer.__("[[0]] joined [[1]]", { placeholders: [member.user.username, member.guild.name] }), "debug");

			// If there is nothing in the config for this server, skip.
			if (!(member.guild.id in servers)) {
				if (debug) log("Welcome", localizer.__("[[0]] is not in configuration file.", { placeholders: [member.guild.name] }), "debug");
				return
			};
			// If welcome is not activated for the server, skip.
			if (!servers[member.guild.id].welcome.activate) return;

			let guild = member.guild;
			guild.config = servers[member.guild.id];
			const welcomeChannel = await member.guild.channels.fetch(guild.config.welcome.channel);

			// Create content for the embed, based on preferences from the config
			let content = localizer.__("Welcome in [[0]] server!", { placeholders: [(guild.config.name ? guild.config.name : guild.name)] });
			if (guild.config.welcome.showMemberCount) content += "\n" + localizer.__("We are now **[[0]]** members.", { placeholders: [guild.memberCount] });

			const color = (await member.user.fetch(true)).accentColor || config.embedColor;

			const embed = new MessageEmbed()
				.setColor(color)
				.setTitle(localizer.__("[[0]] joined the server!", { placeholders: [member.user.username] }))
				.setDescription(content)
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp();

			if (guild.config.welcome.showProfilePicture) {
				embed.setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=512`);
			};

			if (guild.config.welcome.customInfo) embed.addField(localizer._("Infos"), guild.config.welcome.customInfo);

			return await welcomeChannel.send({
				embeds: [embed]
			});

		});

		// Farewell
		client.on("guildMemberRemove", async member => {
			if (debug) log("Welcome", localizer.__("[[0]] left [[1]]", { placeholders: [member.user.username, member.guild.name] }), "debug");

			// If there is nothing in the config for this server, skip.
			if (!(member.guild.id in servers)) {
				if (debug) log("Welcome", localizer.__("[[0]] is not in configuration file.", { placeholders: [member.guild.name] }), "debug");
				return
			};
			// If farewell is not activated for the server, skip.
			if (!servers[member.guild.id].farewell.activate) return;

			let guild = member.guild;
			guild.config = servers[member.guild.id];
			const farewellChannel = await member.guild.channels.fetch(guild.config.farewell.channel);

			// Create content for the embed, based on preferences from the config
			let content = localizer._("We hope to see you back soon!");
			if (guild.config.farewell.showMemberCount) content += "\n" + localizer.__("We are now **[[0]]** members.", { placeholders: [guild.memberCount] });

			const color = (await member.user.fetch(true)).accentColor || config.embedColor;

			const embed = new MessageEmbed()
				.setColor(color)
				.setTitle(localizer.__("[[0]] left the server.", { placeholders: [member.user.username] }))
				.setDescription(content)
				.setFooter({ text: config.botName, iconURL: config.botIcon })
				.setTimestamp();

			if (guild.config.farewell.showProfilePicture) {
				embed.setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=512`);
			};

			if (guild.config.farewell.customInfo) embed.addField(localizer._("Infos"), guild.config.welcome.customInfo);

			return await farewellChannel.send({
				embeds: [embed]
			});

		});

		log("Welcome", localizer._("Ready."));

	}
};