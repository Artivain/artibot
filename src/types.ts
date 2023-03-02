import { IntentsBitField, Snowflake } from "discord.js";
import { Button, Command, MessageContextMenuOption, SlashCommand, TriggerGroup, UserContextMenuOption, Global } from "./modules";

/** Any module part type */
export type ModulePartResolvable = Command | SlashCommand | Button | MessageContextMenuOption | UserContextMenuOption | TriggerGroup | Global;

export type Trigger = string | RegExp;

export interface Contributor {
	name: string,
	github: string,
	discordId?: Snowflake,
	discordTag?: string
}

export interface ContributorList {
	devs: Contributor[],
	contributors: Contributor[]
}