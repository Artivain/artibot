import { ColorResolvable, Snowflake, TimestampStyles } from "discord.js";

export class Config {
	static readonly DEFAULT_BOT_NAME: string = "Artibot";
	static readonly DEFAULT_BOT_ICON: string = "https://assets.artivain.com/fav/bots/artibot-512.png";
	static readonly DEFAULT_PREFIX: string = "ab ";
	static readonly DEFAULT_LANG: string = "en";
	static readonly DEFAULT_EMBED_COLOR: ColorResolvable = "#06476d";
	static readonly DEFAULT_PTERODACTYL_READY_MESSAGE = "Pterodactyl start trigger";

	ownerId!: Snowflake;
	testGuildId!: Snowflake;
	botName: string = Config.DEFAULT_BOT_NAME;
	botIcon: string = Config.DEFAULT_BOT_ICON;
	prefix: string = Config.DEFAULT_PREFIX;
	devMode: boolean = true;
	lang: string = Config.DEFAULT_LANG;
	embedColor: ColorResolvable = Config.DEFAULT_EMBED_COLOR;
	advancedCorePing: boolean = true;
	checkForUpdates: boolean = true;
	debug: boolean = false;
	pterodactylReadyMessage: string = Config.DEFAULT_PTERODACTYL_READY_MESSAGE;

	setOwnerid(id: Snowflake): Config {
		if (!id) throw new Error("Empty id");
		this.ownerId = id;
		return this;
	}

	setTestGuildId(id: Snowflake): Config {
		if (!id) throw new Error("Empty id");
		this.testGuildId = id;
		return this;
	}

	setBotName(name: string = Config.DEFAULT_BOT_NAME): Config {
		this.botName = name;
		return this;
	}

	setBotIcon(icon: string = Config.DEFAULT_BOT_ICON): Config {
		this.botIcon = icon;
		return this;
	}

	setPrefix(prefix: string = Config.DEFAULT_PREFIX): Config {
		this.prefix = prefix;
		return this;
	}

	setDevMode(devMode: boolean): Config {
		this.devMode = devMode;
		return this;
	}

	setLang(lang: string = Config.DEFAULT_LANG): Config {
		this.lang = lang;
		return this;
	}

	setEmbedColor(color: ColorResolvable = Config.DEFAULT_EMBED_COLOR): Config {
		this.embedColor = color;
		return this;
	}

	setAdvancedCorePing(advancedCorePing: boolean): Config {
		this.advancedCorePing = advancedCorePing;
		return this;
	}
}