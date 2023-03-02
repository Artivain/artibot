import { ButtonInteraction, CommandInteraction, IntentsBitField, Interaction, Message, PermissionResolvable, SlashCommandBuilder, StringSelectMenuInteraction } from "discord.js";
import Artibot from ".";
import { ModulePartResolvable, Trigger } from "./types";

export interface ModuleConfig {
	/** Name of the module */
	name: string;
	/** ID of this module */
	id: string;
	/** Version of the module (ex.: "1.2.3") */
	version: string;
	/** List of supported languages (ex.: ["en", "fr"]). If this does not apply, set to "any". */
	langs: string[] | "any";
	/** List of parts of the module */
	parts: ModulePartResolvable[];
	/** List of required intents */
	intents: IntentsBitField[];
	/** GitHub repository of the module (ex.: "Artivain/artibot") */
	repo: string;
	/** Package name of the module on NPM (ex.: "artibot") */
	packageName: string;
}

/** Base class for Artibot modules */
export class Module {
	name: string;
	id: string;
	version: string;
	langs: string[] | "any";
	parts: ModulePartResolvable[];
	additionalIntents: IntentsBitField[];
	repo: string;
	packageName: string;

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

export interface BasePartConfig {
	/** ID of the part */
	id: string;
	/** Type of the part */
	type: string;
	/** The function when the part is executed */
	mainFunction: (...args: any[]) => void | Promise<void>;
	/** The function executed on bot startup */
	initFunction?: (artibot: Artibot) => void | Promise<void>
}

/**
 * Base class for module parts
 */
export class BasePart {
	id: string;
	type: string;
	execute: BasePartConfig["mainFunction"];
	init: BasePartConfig["initFunction"];

	constructor({ id, type, mainFunction, initFunction }: BasePartConfig) {
		if (!id || !type || !mainFunction) throw new Error("Missing parameter(s)");

		this.id = id;
		this.type = type;
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
	/**
	 * If the command can only be executed in a guild
	 * @deprecated This is not ensured anymore
	*/
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
	mainFunction: (message: Message, args: string[], artibot: Artibot) => void | Promise<void>;
}

/**
 * Command part for a module
 * @extends BasePart
 */
export class Command extends BasePart {
	name: string;
	description?: string;
	aliases: string[] = [];
	usage?: string;
	cooldown: number = 0;
	ownerOnly: boolean = false;
	permissions?: PermissionResolvable;
	args: number = 0;

	constructor(config: CommandConfig) {
		super({ ...config, type: "command" });
		this.name = config.name;
		this.description = config.description;
		if (config.aliases) this.aliases = config.aliases;
		this.usage = config.usage;
		if (config.cooldown) this.cooldown = config.cooldown;
		if (config.ownerOnly) this.ownerOnly = config.ownerOnly;
		this.permissions = config.permissions;
		if (config.requiresArgs) this.args = 1;
		if (config.requiredArgs) this.args = config.requiredArgs;
	}
}

export interface SlashCommandConfig extends BasePartConfig {
	/** Data to register into the Discord API */
	data: SlashCommandBuilder;
	/** Minimum time (in seconds) between usages */
	cooldown?: number;
	/** Function to execute when the command is ran */
	mainFunction: (interaction: CommandInteraction, artibot: Artibot) => void | Promise<void>;
}

/**
 * Slash command part for a module
 * @extends BasePart
 */
export class SlashCommand extends BasePart {
	data: SlashCommandBuilder;
	cooldown: number = 0;

	constructor({ id, data, cooldown = 0, mainFunction, initFunction }: SlashCommandConfig) {
		if (!data) throw new Error("Missing data parameter");
		super({ id, type: "slashcommand", mainFunction, initFunction });
		this.data = data;
		this.cooldown = cooldown;
	}
}

export interface ButtonConfig extends BasePartConfig {
	/** Function to execute when the button is clicked */
	mainFunction: (interaction: ButtonInteraction, artibot: Artibot) => void | Promise<void>;
}

/**
 * Button interaction part for a module
 * @extends BasePart
 */
export class Button extends BasePart {
	constructor({ id, mainFunction, initFunction }: ButtonConfig) {
		super({ id, type: "button", mainFunction, initFunction });
	}
}

export interface ContextMenuOptionConfig extends BasePartConfig {
	/** Name of this option */
	name: string;
	/** Function to execute when the menu option is clicked */
	mainFunction: (interaction: Interaction, artibot: Artibot) => void | Promise<void>;
}

/**
 * Message context menu option part for a module
 * @extends BasePart
 */
export class MessageContextMenuOption extends BasePart {
	data: {
		name: string;
		type: 3;
	};

	constructor({ id, name, mainFunction, initFunction }: ContextMenuOptionConfig) {
		if (!name) throw new Error("Missing name parameter!");
		super({ id, type: "messagemenu", mainFunction, initFunction });
		this.data = {
			name,
			type: 3 // 3 is for message context menu
		}
	}
}

/**
 * User context menu option part for a module
 * @extends BasePart
 */
export class UserContextMenuOption extends BasePart {
	data: {
		name: string;
		type: 2;
	};

	constructor({ id, name, mainFunction, initFunction }: ContextMenuOptionConfig) {
		if (!name) throw new Error("Missing name parameter!");
		super({ id, type: "usermenu", mainFunction, initFunction });
		this.data = {
			name,
			type: 2 // 2 is for user context menus
		}
	}
}

export interface SelectMenuOptionConfig extends BasePartConfig {
	/** Function executed when this option is selected */
	mainFunction: (interaction: StringSelectMenuInteraction, artibot: Artibot) => void | Promise<void>;
}

/**
 * Select menu option part for a module
 * @extends BasePart
 */
export class SelectMenuOption extends BasePart {
	constructor({ id, mainFunction, initFunction }: SelectMenuOptionConfig) {
		super({ id, type: "selectmenu", mainFunction, initFunction });
	}
}

export interface TriggerGroupConfig extends BasePartConfig {
	/** List of triggers */
	triggers: Trigger[];
	/** Function executed on trigger found */
	mainFunction: (message: Message, trigger: Trigger, artibot: Artibot) => void | Promise<void>;
}

export class TriggerGroup extends BasePart {
	triggers: Trigger[];

	constructor({ id, triggers, mainFunction, initFunction }: TriggerGroupConfig) {
		if (!triggers || !triggers.length) throw new Error("Triggers cannot be empty!");
		super({ id, type: "trigger", mainFunction, initFunction });
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
		super({ id, type: "global", mainFunction });
		this.init = mainFunction;
	}
}