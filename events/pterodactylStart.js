export const name = "ready";
export const once = true;

/**
 * Send pterodactyl started trigger
 */
export function execute() {
	if ("RUNS_IN_PTERODACTYL" in process.env && process.env.RUNS_IN_PTERODACTYL) {
		console.log("Pterodactyl start trigger");
	}
}