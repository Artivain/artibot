import { ColorResolvable, Colors, Snowflake } from "discord.js";
import Embed from "./embed.js";
import Artibot from "./index.js";

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

	/** Set the Discord ID of the owner of this bot (probably you) */
	public setOwnerId(id: Snowflake): this {
		this.ownerId = id;
		return this;
	}

	/** Set the test guild ID. When {@link devMode} is false, interactions will only be publish in this guild. */
	public setTestGuildId(id: Snowflake): this {
		this.testGuildId = id;
		return this;
	}

	/** Set the name to use in Discord, in {@link Embed} and {@link Artibot.createEmbed()} */
	public setBotName(name: string): this {
		this.botName = name;
		return this;
	}

	/** Set the icon to use in {@link Embed} and {@link Artibot.createEmbed()} */
	public setBotIcon(url: string): this {
		this.botIcon = url;
		return this;
	}

	/** Set the prefix for classic commands */
	public setPrefix(prefix: string): this {
		this.prefix = prefix;
		return this;
	}

	/** Set dev mode, to allow Artibot to publish interaction in more than one server */
	public setDevMode(state: boolean): this {
		this.devMode = state;
		return this;
	}

	/** Toggle dev mode, to allow Artibot to publish interaction in more than one server */
	public toggleDevMode(): this {
		return this.setDevMode(!this.devMode);
	}

	/** Enable dev mode, to allow Artibot to publish interaction in more than one server */
	public enableDevMode(): this {
		return this.setDevMode(true);
	}

	/** Disable dev mode, to allow Artibot to publish interaction in more than one server */
	public disableDevMode(): this {
		return this.setDevMode(false);
	}

	/** Set language of the bot (eg. "fr") */
	public setLang(lang: string) {
		this.lang = lang;
		return this;
	}

	/** Set the color of {@link Embed} and {@link Artibot.createEmbed()} */
	public setEmbedColor(color: ColorResolvable): this {
		this.embedColor = color;
		return this;
	}

	/** Set "advanced" stats in the ping command in Core module */
	public setAdvancedCorePing(state: boolean): this {
		this.advancedCorePing = state;
		return this;
	}

	/** Toggle "advanced" stats in the ping command in Core module */
	public toggleAdvancedCorePing(): this {
		return this.setAdvancedCorePing(!this.advancedCorePing);
	}

	/** Enable "advanced" stats in the ping command in Core module */
	public enableAdvancedCorePing(): this {
		return this.setAdvancedCorePing(true);
	}

	/** Disable "advanced" stats in the ping command in Core module */
	public disableAdvancedCorePing(): this {
		return this.setAdvancedCorePing(false);
	}

	/** Set checking for updates */
	public setCheckForUpdates(state: boolean): this {
		this.checkForUpdates = state;
		return this;
	}

	/** Toggle checking for updates */
	public toggleCheckForUpdates(): this {
		return this.setCheckForUpdates(!this.checkForUpdates);
	}

	/** Enable checking for updates */
	public enableCheckForUpdates(): this {
		return this.setCheckForUpdates(true);
	}

	/** Disable checking for updates */
	public disableCheckForUpdates(): this {
		return this.setCheckForUpdates(false);
	}

	/** Set debug mode */
	public setDebug(state: boolean): this {
		this.debug = state;
		return this;
	}

	/** Toggle debug mode */
	public toggleDebug(): this {
		return this.setDebug(!this.debug);
	}

	/** Enable debug mode */
	public enableDebug(): this {
		return this.setDebug(true);
	}

	/** Disable debug mode */
	public disableDebug(): this {
		return this.setDebug(false);
	}

	/** Set the message sent to Pterodactyl when the bot is ready */
	public setPterodactylReadyMessage(message: string): this {
		this.pterodactylReadyMessage = message;
		return this;
	}
}