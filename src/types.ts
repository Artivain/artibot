import { Collection, Snowflake } from "discord.js";
import { Button, Command, MessageContextMenuOption, SlashCommand, TriggerGroup, UserContextMenuOption, Global, Module } from "./modules.js";
import Artibot from "./index.js";

/** Any module part type */
export type ModulePartResolvable = Command | SlashCommand | Button | MessageContextMenuOption | UserContextMenuOption | TriggerGroup | Global;

/** Used to detect messages containing a string or matching a RegEx */
export type Trigger = string | RegExp;

/** Collection of modules */
export type Modules = Collection<string, Module>;

/** Module, or a function that returns a module */
export type ModuleGenerator = Module | ((artibot: Artibot, config: any) => Module);

export type RegisterModuleConfigType<T> = T extends (artibot: Artibot, config: infer P) => Module ? P : never;

/** Function that registers a module */
export type RegisterModuleOverload = {
	<T extends (artibot: Artibot, config: any) => Module>(module: T, config: RegisterModuleConfigType<T>): void;
	(module: (artibot: Artibot) => Module): void;
	(module: Module, config?: any): void;
}

/** Informations about a contibutor */
export interface Contributor {
	/** Contributor's name */
	name: string,
	/** Contributor's GitHub username */
	github: string,
	/** Contributor's Discord ID */
	discordId?: Snowflake,
	/** Contributor's Discord tag */
	discordTag?: string
}

/** List of all Artibot contributors */
export interface ContributorList {
	/** List of developpers */
	devs: Contributor[],
	/** List of donators */
	donators: Contributor[]
}