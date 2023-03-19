import { Guild } from "discord.js";
import Artibot from "../index.js";
import log from "../logger";

export const name = "guildCreate";

/** Added to guild event listener */
export function execute(guild: Guild, artibot: Artibot): void {
	log("Artibot", artibot.localizer._("Added to a new server: ") + guild.name, "log", true);
}