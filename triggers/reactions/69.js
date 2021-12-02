/**
 * @file Répondre Nice quand quelqu'un mets 69 dans un message.
 * @author GoudronViande24
 * @since 1.0.0
 */

module.exports = {
	name: [" 69 "],

	/**
	 * @description Executes when it is triggered by trigger handler.
	 * @author GoudronViande24
	 * @param {Object} message The Message Object of the trigger.
	 * @param {String[]} args The Message Content of the received message seperated by spaces (' ') in an array
	 */

	execute(message, args) {
		message.reply({
			content: "Nice",
		});
	},
};
