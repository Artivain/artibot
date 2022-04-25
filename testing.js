import { SelectMenuOptionBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
import Artibot, { Command, Module, SelectMenuOption } from "./index.js";
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
							),
						new MessageActionRow()
							.addComponents(
								new MessageSelectMenu()
									.setCustomId("test.selectmenu")
									.setPlaceholder("select something")
									.addOptions([
										{
											label: "Testing option",
											description: "Testing option to do testing",
											value: "asdasd"
										},
										{
											label: "Testing option 2",
											description: "Testing option to do testing a second time",
											value: "qweqwe"
										}
									])
							)
					]
				})
			}),
			new SelectMenuOption({
				id: "test.selectmenu",
				mainFunction: (interaction) => interaction.reply({
					content: "Ok: " + interaction.values.join(", "),
					ephemeral: true
				})
			})
		]
	})
);

artibot.login({ token });