import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } from "discord.js";
import Artibot, { Command, Global, Module, SelectMenuOption, TriggerGroup } from "./index.js";
import token from "./private.js";

const artibot = new Artibot({
	ownerId: "382869186042658818",
	botName: "Artibot [DEV]",
	prefix: "abd ",
	lang: "fr",
	testGuildId: "775798875356397608",
	debug: true
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
						new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setCustomId("delete")
									.setLabel("delete")
									.setStyle(ButtonStyle.Danger)
							),
						new ActionRowBuilder()
							.addComponents(
								new SelectMenuBuilder()
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
			}),
			new TriggerGroup({
				id: "testingtrigger",
				triggers: ["sus", /asd/i, "plzdelete"],
				mainFunction: async (message, trigger) => {
					if (trigger == "plzdelete") return await message.delete();
					return await message.reply({
						ephemeral: true,
						content: "Triggered: " + trigger.toString()
					});
				}
			})
		]
	})
);

artibot.login({ token });

console.log(await artibot.checkForPackageUpdates());