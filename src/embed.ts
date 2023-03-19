import { Colors, EmbedBuilder, EmbedData } from "discord.js";
import Artibot from ".";

export class Embed extends EmbedBuilder {
	constructor(artibot: Artibot, data?: EmbedData) {
		super(data);
		this.setColor(artibot.config.embedColor || Colors.Default);
		this.setFooter({
			text: artibot.config.botName || "Artibot",
			iconURL: artibot.config.botIcon
		});
		this.setTimestamp();
	}
}

/** @ignore */
export default Embed;