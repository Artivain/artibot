import { Client } from "discord.js";
import Artibot from "../index.js";

export const name = "ready";
export const once = true;

/**
 * Send pterodactyl started trigger
 * @param {Client} client
 * @param {Artibot} artibot
 */
export function execute(client, { config: { pterodactylReadyMessage } }) {
	if ("RUNS_IN_PTERODACTYL" in process.env && process.env.RUNS_IN_PTERODACTYL) {
		console.log(pterodactylReadyMessage);
	}
}