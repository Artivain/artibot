import { Guild } from "discord.js";
import Artibot from "../index.js";
import log from "../logger";

export const name = "guildDelete";

export function execute(guild: Guild, artibot: Artibot) {
	log("Artibot", artibot.localizer._("Removed from server: ") + guild.name, "log", true);
}