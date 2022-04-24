export const name = "ready";
export const once = true;

/**
 * Send pterodactyl started trigger
 */
export function execute() {
	if (process.env.RUNS_IN_PTERODACTYL) {
		console.log("Pterodactyl start trigger");
	};
}