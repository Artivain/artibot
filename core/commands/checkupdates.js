import { Message } from "discord.js";
import Artibot from "../../index.js";

/**
 * Check for updates command
 * @param {Message} message
 * @param {string[]} args
 * @param {Artibot} artibot
 */
export default async function execute(message, args, { config, localizer, version, checkForUpdates, modules }) {
	// Check if config is valid
	if (!config.checkForUpdates) {
		message.reply(localizer._("Checking for updates is disabled in config!"));
		return;
	};

	const latest = await checkForUpdates();

	let reply;

	if (!latest) {
		reply = "**Artibot:** " + localizer._("Impossible to get latest version!") + "\n";
	} else if (version == latest) {
		reply = "**Artibot:** " + localizer.__("Already up to date (v[[0]]).", { placeholders: [version] }) + "\n";
	} else {
		reply = "**Artibot:** " + localizer.__("An update is available: v[[0]] --> v[[1]].", {
			placeholders: [version, latest]
		}) + "\n";
	}

	for (const [, module] of modules) {
		if (!module.repo) continue;
		const { name, version, repo } = module;
		const latest = await checkForUpdates(repo);
		
		if (!latest) {
			reply += name + ": " + localizer._("Impossible to get latest version!") + "\n";
		} else if (version == latest) {
			reply += name + ": " + localizer.__("Already up to date (v[[0]]).", { placeholders: [version] }) + "\n";
		} else {
			reply += name + ": " + localizer.__("An update is available: v[[0]] --> v[[1]].", {
				placeholders: [version, latest]
			}) + "\n";
		}
	}

	message.reply(reply.trim());
}
