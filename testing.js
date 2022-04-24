import { MessageActionRow, MessageButton } from "discord.js";
import Artibot, { Command, Module } from "./index.js";
import token from "./private.js";

const artibot = new Artibot({
	ownerId: "382869186042658818",
	botName: "Artibot [DEV]",
	prefix: "abd ",
	lang: "fr",
	testGuildId: "775798875356397608"
});

artibot.registerModule(
	new Module({
		name: "Test",
		id: "test",
		version: "1.2.3",
		langs: "any",
		parts: [
			new Command({
				id: "test",
				name: "test",
				mainFunction: (message) => message.reply({
					content: "test",
					components: [
						new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId("delete")
									.setLabel("delete")
									.setStyle("PRIMARY")
							)
					]
				})
			})
		]
	})
);

artibot.login({ token });