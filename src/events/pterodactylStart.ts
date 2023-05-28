import { Client } from "discord.js";
import Artibot from "../index.js";

export const name = "ready";
export const once = true;

/** Send pterodactyl started trigger */
export function execute(client: Client, { config: { pterodactylReadyMessage } }: Artibot): void {
	if ("P_SERVER_UUID" in process.env && process.env.P_SERVER_UUID) {
		console.log(pterodactylReadyMessage);
	}
}