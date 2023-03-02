import { ColorResolvable, Colors, Snowflake } from "discord.js";

/**
 * Configuration object for Artibot
 * @see {@link ArtibotConfigBuilder} for an easy way to generate this
 * @since 5.0.0
 */
export interface ArtibotConfig {
	/** Discord ID of the owner of the bot */
	ownerId: Snowflake;
	/** Discord ID of the testing guild */
	testGuildId: Snowflake;
	/** Name of the Discord bot. Used almost everywhere. */
	botName: string;
	/** URL of the profile picture of the bot */
	botIcon: string;
	/** Prefix for the commands */
	prefix: string;
	/** Set to false if the bot must be used in more than one server. Interactions could take more time to refresh. */
	devMode: boolean;
	/** Set the lang of the bot */
	lang: string;
	/** Color for the embeds sent by the bot */
	embedColor: ColorResolvable;
	/** Set to false if you want to hide advanced infos from ping commands */
	advancedCorePing: boolean;
	/** Set to false if you don't want the bot to check for new updates */
	checkForUpdates: boolean;
	/** Set to true to show debug messages in console */
	debug: boolean;
	/** Set a custom ready trigger message for Pterodactyl */
	pterodactylReadyMessage: string;
	/** Other config options can be added by modules */
	[key: string]: any;
}


/**
 * Easily build the ArtibotConfig object
 * @see {@link ArtibotConfig} to learn more about individual properties
 * @since 5.0.0
 */
export class ArtibotConfigBuilder implements Partial<ArtibotConfig> {
	ownerId?: Snowflake;
	testGuildId?: Snowflake;
	botName: string = "Artibot";
	botIcon: string = "https://assets.artivain.com/fav/bots/artibot-512.png";
	prefix: string = "ab ";
	devMode: boolean = true;
	lang: string = "en";
	embedColor: ColorResolvable = Colors.Default;
	advancedCorePing: boolean = true;
	checkForUpdates: boolean = true;
	debug: boolean = false;
	pterodactylReadyMessage: string = "Pterodactyl Ready";

	public setOwnerId(id: Snowflake): this {
		this.ownerId = id;
		return this;
	}

	public setTestGuildId(id: Snowflake): this {
		this.testGuildId = id;
		return this;
	}

	public setBotName(name: string): this {
		this.botName = name;
		return this;
	}

	public setBotIcon(url: string): this {
		this.botIcon = url;
		return this;
	}

	public setPrefix(prefix: string): this {
		this.prefix = prefix;
		return this;
	}

	public setDevMode(state: boolean): this {
		this.devMode = state;
		return this;
	}

	public toggleDevMode(): this {
		return this.setDevMode(!this.devMode);
	}

	public enableDevMode(): this {
		return this.setDevMode(true);
	}

	public disableDevMode(): this {
		return this.setDevMode(false);
	}

	public setLang(lang: string) {
		this.lang = lang;
		return this;
	}

	public setEmbedColor(color: ColorResolvable): this {
		this.embedColor = color;
		return this;
	}

	public setAdvancedCorePing(state: boolean): this {
		this.advancedCorePing = state;
		return this;
	}

	public toggleAdvancedCorePing(): this {
		return this.setAdvancedCorePing(!this.advancedCorePing);
	}

	public enableAdvancedCorePing(): this {
		return this.setAdvancedCorePing(true);
	}

	public disableAdvancedCorePing(): this {
		return this.setAdvancedCorePing(false);
	}

	public setCheckForUpdates(state: boolean): this {
		this.checkForUpdates = state;
		return this;
	}

	public toggleCheckForUpdates(): this {
		return this.setCheckForUpdates(!this.checkForUpdates);
	}

	public enableCheckForUpdates(): this {
		return this.setCheckForUpdates(true);
	}

	public disableCheckForUpdates(): this {
		return this.setCheckForUpdates(false);
	}

	public setDebug(state: boolean): this {
		this.debug = state;
		return this;
	}

	public toggleDebug(): this {
		return this.setDebug(!this.debug);
	}

	public enableDebug(): this {
		return this.setDebug(true);
	}

	public disableDebug(): this {
		return this.setDebug(false);
	}

	public setPterodactylReadyMessage(message: string): this {
		this.pterodactylReadyMessage = message;
		return this;
	}
}