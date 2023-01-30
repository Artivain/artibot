import { Guild } from "discord.js";
import Artibot from "../index.js";

export const name = "guildDelete";

/**
 * 
 * @param {Guild} guild 
 * @param {Artibot} artibot
 */
export async function execute(guild, artibot) {
	artibot.log("Artibot", artibot.localizer._("Removed from server: ") + guild.name, "log", true);
}