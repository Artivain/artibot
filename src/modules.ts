import { ApplicationCommandType, ButtonInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, GatewayIntentBits, Message, MessageContextMenuCommandInteraction, PermissionResolvable, SlashCommandBuilder, StringSelectMenuInteraction, UserContextMenuCommandInteraction } from "discord.js";
import Artibot from ".";
import { ModulePartResolvable, Trigger } from "./types";

/** Base config for a module */
export interface ModuleConfig {
	/** Name of the module */
	name: string;
	/** ID of this module */
	id: string;
	/** Version of the module (ex.: "1.2.3"). You should use the same as in your package.json if you want to publish it. */
	version?: string;
	/** List of supported languages (ex.: ["en", "fr"]). If this does not apply, set to "any". */
	langs?: string[] | "any";
	/** List of parts of the module */
	parts: ModulePartResolvable[];
	/** List of required intents */
	intents?: GatewayIntentBits[];
	/** GitHub repository of the module (ex.: "Artivain/artibot") */
	repo?: string;
	/** Package name of the module on NPM (ex.: "artibot") */
	packageName?: string;
}

/** Base class for Artibot modules */
export class Module {
	/** Name of the module */
	name: string;
	/** ID of this module */
	id: string;
	/** Version of the module (ex.: "1.2.3"). You should use the same as in your package.json if you want to publish it. */
	version: string = "0.0.0";
	/** List of supported languages (ex.: ["en", "fr"]). If this does not apply, set to "any". */
	langs: string[] | "any" = "any";
	/** List of parts of the module */
	parts: ModulePartResolvable[];
	/** List of required intents */
	additionalIntents: GatewayIntentBits[] = [];
	/** GitHub repository of the module (ex.: "Artivain/artibot") */
	repo?: string;
	/** Package name of the module on NPM (ex.: "artibot") */
	packageName?: string;

	/**
	 * @param config - Module configuration
	 */
	constructor({ name, id, version, langs = "any", parts, intents = [], repo, packageName }: ModuleConfig) {
		if (!name || !id || !version || !langs || !parts) throw new Error("Missing module informations!");
		this.name = name;
		this.id = id;
		this.version = version;
		this.langs = langs;
		this.parts = parts;
		this.additionalIntents = intents;
		this.repo = repo;
		this.packageName = packageName;
	}
}

/** Base configuration for module parts */
export interface BasePartConfig {
	/** ID of the part */
	id: string;
	/** The function when the part is executed */
	mainFunction: (...args: any[]) => Promise<void>;
	/** The function executed on bot startup */
	initFunction?: (artibot: Artibot) => Promise<void>;
}

/**
 * Base class for module parts
 */
export class BasePart {
	/** ID of the part */
	id: string;
	/** The function when the part is executed */
	execute: BasePartConfig["mainFunction"];
	/** The function executed on bot startup */
	init: BasePartConfig["initFunction"];

	/**
	 * @param config - Part configuration
	 */
	constructor({ id, mainFunction, initFunction }: BasePartConfig) {
		if (!id || !mainFunction) throw new Error("Missing parameter(s)");

		this.id = id;
		this.execute = mainFunction;
		this.init = initFunction;
	}
}

export interface CommandConfig extends BasePartConfig {
	/** Name of the command */
	name: string;
	/** Description of the command */
	description?: string;
	/** List of alternative names */
	aliases?: string[];
	/** Help text on how to use the command */
	usage?: string;
	/** Minimum time (in seconds) between usages */
	cooldown?: number;
	/** If the command can only be executed by the owner of the bot */
	ownerOnly?: boolean;
	/** If the command can only be executed in a guild */
	guildOnly?: boolean;
	/** Required permissions */
	permissions?: PermissionResolvable;
	/**
	 * Set to true if the command needs at least one argument
	 * @deprecated Use {@link requiredArgs} instead.
	 */
	requiresArgs?: boolean;
	/**
	 * Minimum amount of arguments
	 * @since 5.0.0
	 */
	requiredArgs?: number;
	/** Function executed when command is ran */
	mainFunction: (message: Message, args: string[], artibot: Artibot) => Promise<void>;
}

/**
 * Command part for a module
 * @extends BasePart
 */
export class Command extends BasePart {
	/** Name of the command */
	name: string;
	/** Description of the command */
	description?: string;
	/** List of alternative names */
	aliases: string[] = [];
	/** Help text on how to use the command */
	usage?: string;
	/** Minimum time (in seconds) between usages */
	cooldown: number = 0;
	/** If the command can only be executed by the owner of the bot */
	ownerOnly: boolean = false;
	/** Required permissions */
	permissions?: PermissionResolvable;
	/** Minimum amount of arguments */
	args: number = 0;
	/** If the command can only be executed in a guild */
	guildOnly: boolean = true;

	/**
	 * @param config - Command configuration
	 */
	constructor(config: CommandConfig) {
		super(config);
		this.name = config.name;
		this.description = config.description;
		if (config.aliases) this.aliases = config.aliases;
		this.usage = config.usage;
		if (config.cooldown) this.cooldown = config.cooldown;
		if (config.ownerOnly) this.ownerOnly = config.ownerOnly;
		this.permissions = config.permissions;
		if (config.requiresArgs) this.args = 1;
		if (config.requiredArgs) this.args = config.requiredArgs;
		if (config.guildOnly) this.guildOnly = config.guildOnly;
	}
}

/** Configuration for a slash command */
export interface SlashCommandConfig extends BasePartConfig {
	/** Data to register into the Discord API */
	data: Partial<SlashCommandBuilder>;
	/** Minimum time (in seconds) between usages */
	cooldown?: number;
	/** Function to execute when the command is ran */
	mainFunction: (interaction: ChatInputCommandInteraction<"cached">, artibot: Artibot) => Promise<void>;
}

/**
 * Slash command part for a module
 * @extends BasePart
 */
export class SlashCommand extends BasePart {
	/** Data to register into the Discord API */
	data: Partial<SlashCommandBuilder>;
	/** Minimum time (in seconds) between usages */
	cooldown: number = 0;

	/**
	 * @param config - Slash command configuration
	 */
	constructor({ id, data, cooldown = 0, mainFunction, initFunction }: SlashCommandConfig) {
		if (!data) throw new Error("Missing data parameter");
		super({ id, mainFunction, initFunction });
		this.data = data;
		this.cooldown = cooldown;
	}
}

/** Configuration for a button */
export interface ButtonConfig extends BasePartConfig {
	/** Function to execute when the button is clicked */
	mainFunction: (interaction: ButtonInteraction<"cached">, artibot: Artibot) => Promise<void>;
}

/**
 * Button interaction part for a module
 * @extends BasePart
 */
export class Button extends BasePart {
	/**
	 * @param config - Button configuration
	 */
	constructor({ id, mainFunction, initFunction }: ButtonConfig) {
		super({ id, mainFunction, initFunction });
	}
}

/** Configuration for a message context menu option */
export interface MessageContextMenuOptionConfig extends BasePartConfig {
	/** Name of this option */
	name: string;
	/** Function to execute when the menu option is clicked */
	mainFunction: (interaction: MessageContextMenuCommandInteraction<"cached">, artibot: Artibot) => Promise<void>;
}

/**
 * Message context menu option part for a module
 * @extends BasePart
 */
export class MessageContextMenuOption extends BasePart {
	/** Data to register into the Discord API */
	data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
		.setType(ApplicationCommandType.Message);

	/**
	 * @param config - Message context menu option configuration
	 */
	constructor({ id, name, mainFunction, initFunction }: MessageContextMenuOptionConfig) {
		if (!name) throw new Error("Missing name parameter!");
		super({ id, mainFunction, initFunction });
		this.data.setName(name);
	}
}

/** Configuration for a user context menu option */
export interface UserContextMenuOptionConfig extends BasePartConfig {
	/** Name of this option */
	name: string;
	/** Function to execute when the menu option is clicked */
	mainFunction: (interaction: UserContextMenuCommandInteraction<"cached">, artibot: Artibot) => Promise<void>;
}

/**
 * User context menu option part for a module
 * @extends BasePart
 */
export class UserContextMenuOption extends BasePart {
	/** Data to register into the Discord API */
	data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
		.setType(ApplicationCommandType.User);

	/**
	 * @param config - User context menu option configuration
	 */
	constructor({ id, name, mainFunction, initFunction }: UserContextMenuOptionConfig) {
		if (!name) throw new Error("Missing name parameter!");
		super({ id, mainFunction, initFunction });
		this.data.setName(name);
	}
}

/** Configuration for a select menu option */
export interface SelectMenuOptionConfig extends BasePartConfig {
	/** Function executed when this option is selected */
	mainFunction: (interaction: StringSelectMenuInteraction<"cached">, artibot: Artibot) => Promise<void>;
}

/**
 * Select menu option part for a module
 * @extends BasePart
 */
export class SelectMenuOption extends BasePart {
	/**
	 * @param config - Select menu option configuration
	 */
	constructor({ id, mainFunction, initFunction }: SelectMenuOptionConfig) {
		super({ id, mainFunction, initFunction });
	}
}

/** Configuration for a trigger group */
export interface TriggerGroupConfig extends BasePartConfig {
	/** List of triggers */
	triggers: Trigger[];
	/** Function executed on trigger found */
	mainFunction: (message: Message, trigger: Trigger, artibot: Artibot) => Promise<void>;
}

/** Configuration for a trigger group */
export class TriggerGroup extends BasePart {
	/** List of triggers */
	triggers: Trigger[];

	/**
	 * @param config - Trigger group configuration
	 */
	constructor({ id, triggers, mainFunction, initFunction }: TriggerGroupConfig) {
		if (!triggers || !triggers.length) throw new Error("Triggers cannot be empty!");
		super({ id, mainFunction, initFunction });
		this.triggers = triggers;
	}
}

/**
 * Global part for a module
 * - Special part which is not managed by a event handler and only ran at startup
 * @extends BasePart
 */
export class Global extends BasePart {
	/**
	 * @param {Object} config - Config for this global
	 * @param {string} config.id - ID of this global
	 * @param {function(Artibot): void|Promise<void>} config.mainFunction - Function executed on bot startup
	 */
	constructor({ id, mainFunction }: BasePartConfig) {
		super({ id, mainFunction });
		this.init = mainFunction;
	}
}