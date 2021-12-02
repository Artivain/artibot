/**
 * @file Ready Event File.
 * @author Artivain
 * @since 1.0.1
 */

module.exports = {
	name: "ready",
	once: true,

	/**
	 * @description Executes the block of code when client is ready (bot initialization)
	 * @param {Object} client Main Application Client
	 */
	execute(client) {
		console.log(`Prêt! Connecté en tant que ${client.user.tag}`);
	},
};
