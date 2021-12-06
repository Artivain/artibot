module.exports = {
	name: "messageCreate",

	async execute(message) {
		const args = message.content.split(/ +/);

		// Ignore bots

		if (message.author.bot) return;

		// Checking ALL triggers using every function and breaking out if a trigger was found.
		let check;

		await message.client.triggers.every(async (trigger) => {
			if (check == 1) return false;
			await trigger.name.every(async (name) => {
				if (check == 1) return false;

				// If validated, it will try to execute the trigger.

				if (message.content.includes(name)) {
					try {
						trigger.execute(message);
					} catch (error) {
						// If checks fail, reply back!

						console.error(error);
						message.reply({
							content: "Il y a eu une erreur avec l'exécution d'un trigger!",
						});
					}

					check = 1;
					return false;
				}
			});
		});
	},
};
