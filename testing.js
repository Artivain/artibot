import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, StringSelectMenuBuilder } from "discord.js";
import { ArtibotConfigBuilder } from "./dist/config.js";
import Artibot from "./dist/index.js";
import { Command, Module, SelectMenuOption, TriggerGroup } from "./dist/modules.js";
import token from "./private.js";

const artibot = new Artibot(new ArtibotConfigBuilder()
	.setOwnerId("382869186042658818")
	.setBotName("Artibot [DEV]")
	.setPrefix("abd ")
	.setLang("fr")
	.setTestGuildId("775798875356397608")
	.enableDebug()
	.setEmbedColor(Colors.DarkBlue)
);

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
								new StringSelectMenuBuilder()
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

//console.log(await artibot.checkForPackageUpdates());