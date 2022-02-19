module.exports = {
	name: "ready",
	once: true,

	execute() {
		if (process.env.RUNS_IN_PTERODACTYL) {
			console.log("Pterodactyl start trigger");
		};
	}
};