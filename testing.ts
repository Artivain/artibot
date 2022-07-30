import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, SlashCommandBuilder } from "discord.js";
import Artibot, { Command, Module, SelectMenuOption, SlashCommand, TriggerGroup } from "./index.js";
import token from "./private.js";
import { Client } from "discord.js";

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
				mainFunction: (message): Promise<any> => message.reply({
					content: "test"
				})
			}),

			new SelectMenuOption({
				id: "test.selectmenu",
				mainFunction: (interaction): Promise<any> => interaction.reply({
					content: "Ok: " + interaction.values.join(", "),
					ephemeral: true
				})
			}),
			
			new TriggerGroup({
				id: "testingtrigger",
				triggers: ["sus", /asd/i, "plzdelete"],
				mainFunction: (message, trigger): Promise<any> => {
					if (trigger == "plzdelete") return message.delete();
					return message.reply({
						content: "Triggered: " + trigger.toString()
					});
				}
			})
		]
	})
);

artibot.login({ token });

console.log(await artibot.checkForPackageUpdates());