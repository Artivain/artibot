import { Guild } from "discord.js";
import Artibot from "../index.js";

export const name = "guildCreate";

/**
 * Added to guild event listener
 * @param {Guild} guild 
 * @param {Artibot} artibot
 */
export async function execute(guild, artibot) {
	artibot.log("Artibot", artibot.localizer._("Added to a new server: ") + guild.name, "log", true);
}