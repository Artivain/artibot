const chalk = require("chalk");

module.exports = {
	/**
	 * Log message to console, with proper coloring and prefix.
	 *
	 * @author Artivain
	 * @since v1.5.3
	 * @param {string} name Name of the module sending the log.
	 * @param {string} msg Message to send.
	 * @param {("log"|"warn"|"err"|"debug"|"info")} type Type of message.
	 * @param {boolean} isCore Is this message sent from the core? Probably not.
	 */

	log(name, msg, type = "log", isCore = false) {
		type = type.toLowerCase();
		if (isCore) {
			var prefix = chalk.green(`[${name}]`);
		} else {
			var prefix = chalk.blue(`[${name}]`);
		};

		if (type == "err" || type == "error") {
			var content = chalk.red(msg);
		} else if (type == "warn" || type == "warning") {
			var content = chalk.yellow(msg);
		} else if (type == "debug") {
			var content = chalk.white(msg);
			prefix += chalk.magenta(" (debug)");
		} else if (type == "log") {
			var content = chalk.gray(msg);
		} else if (type == "info" || type == "infos") {
			var content = chalk.cyan(msg);
		} else throw new Error(`[Logger] log: "${type}" is not a valid type. Valid values are: "log", "warn", "err", "debug", "info".`);

		console.log(prefix, content);
	}
};