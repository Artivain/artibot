import { Colors, EmbedBuilder, EmbedData } from "discord.js";
import { ArtibotConfig } from "./config.js";

export class Embed extends EmbedBuilder {
	constructor(config: ArtibotConfig, data?: EmbedData) {
		super(data);
		this.setColor(config.embedColor || Colors.Default);
		this.setFooter({
			text: config.botName || "Artibot",
			iconURL: config.botIcon
		});
		this.setTimestamp();
	}
}

/** @ignore */
export default Embed;