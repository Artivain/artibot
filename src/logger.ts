import chalk from "chalk";

/**
 * Log message to console, with proper coloring and prefix.
 *
 * @author Artivain
 * @since v1.5.3
 * @param name Name of the module sending the log.
 * @param msg Message to send.
 * @param type Type of message.
 * @param isCore Is this message sent from the core? Probably not.
 */
export function log(name: string, msg: string, type: "log" | "warn" | "err" | "debug" | "info" = "log", isCore: boolean = false): void {
	let content: string;
	let prefix: string = isCore ? chalk.green(`[${name}]`) : chalk.blue(`[${name}]`);

	switch (type) {
		case "err":
		// @ts-ignore
		case "error":
			content = chalk.red(msg);
			break;

		case "warn":
		// @ts-ignore
		case "warning":
			content = chalk.yellow(msg);
			break;

		case "debug":
			content = chalk.white(msg);
			prefix += chalk.magenta(" (debug)");
			break;

		case "log":
			content = chalk.gray(msg);
			break;

		case "info":
		// @ts-ignore
		case "infos":
			content = chalk.cyan(msg);
			break;

		default:
			throw new Error(`[Logger] log: "${type}" is not a valid type. Valid values are: "log", "warn", "err", "debug", "info".`);
	}

	console.log(prefix, content);
}

/** @ignore */
export default log;