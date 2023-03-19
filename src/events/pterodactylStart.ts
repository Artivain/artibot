import { Client } from "discord.js";
import Artibot from "../index.js";

export const name = "ready";
export const once = true;

/** Send pterodactyl started trigger */
export function execute(client: Client, { config: { pterodactylReadyMessage } }: Artibot): void {
	if ("RUNS_IN_PTERODACTYL" in process.env && process.env.RUNS_IN_PTERODACTYL) {
		console.log(pterodactylReadyMessage);
	}
}