import { Message } from "discord.js";
import Artibot from "../../index.js";
import { Module } from "../../modules.js";

/** Check for updates command */
export default async function execute(message: Message, args: string[], { config, localizer, version, checkForUpdates, checkForPackageUpdates, modules }: Artibot): Promise<void> {
	// Check if config is valid
	if (!config.checkForUpdates) {
		message.reply(localizer._("Checking for updates is disabled in config!"));
		return;
	};

	// Check if an argument is passed
	if (args.length) {
		const moduleId: string = args[0].toLowerCase();

		if (moduleId == "artibot") {
			const latest = await checkForPackageUpdates();

			let content;

			if (!latest) {
				content = "**Artibot:** " + localizer._("Impossible to get latest version!");
			} else if (version == latest) {
				content = "**Artibot:** " + localizer.__("Already up to date (v[[0]]).", { placeholders: [version] });
			} else {
				content = "**Artibot:** " + localizer.__("An update is available: v[[0]] --> v[[1]].", { placeholders: [version, latest] });
			}

			await message.reply({ content });
			return;
		}

		const module: Module | undefined = modules.get(moduleId);

		if (!module) {
			await message.reply(localizer.__("Module with ID `[[0]]` not found.", { placeholders: [moduleId] }));
			return;
		}

		const { name, repo, packageName } = module;
		version = module.version;
		let content: string = name + ": " + localizer._("Impossible to get latest version!") + "\n";

		if (packageName) {
			const latest: string | false = await checkForPackageUpdates(packageName);

			if (latest) {
				if (version == latest) {
					content = name + ": " + localizer.__("Already up to date (v[[0]]).", { placeholders: [version] });
				} else {
					content = name + ": " + localizer.__("An update is available: v[[0]] --> v[[1]].", { placeholders: [version, latest] });
				}

				await message.reply({ content });
				return;
			}
		}

		if (repo) {
			const latest: string | false = await checkForUpdates(repo);

			if (latest) {
				if (version == latest) {
					content = name + ": " + localizer.__("Already up to date (v[[0]]).", { placeholders: [version] });
				} else {
					content = name + ": " + localizer.__("An update is available: v[[0]] --> v[[1]].", { placeholders: [version, latest] });
				}

				await message.reply({ content });
				return;
			}
		}

		await message.reply({ content });
		return;
	}

	const latest = await checkForPackageUpdates();

	let reply: string;

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
		const { name, version, repo, packageName } = module;

		if (packageName) {
			const latest: string | false = await checkForPackageUpdates(packageName);

			if (latest) {
				if (version == latest) {
					reply += name + ": " + localizer.__("Already up to date (v[[0]]).", { placeholders: [version] }) + "\n";
				} else {
					reply += name + ": " + localizer.__("An update is available: v[[0]] --> v[[1]].", {
						placeholders: [version, latest]
					}) + "\n";
				}

				continue;
			}
		}

		if (repo) {
			const latest: string | false = await checkForUpdates(repo);

			if (latest) {
				if (version == latest) {
					reply += name + ": " + localizer.__("Already up to date (v[[0]]).", { placeholders: [version] }) + "\n";
				} else {
					reply += name + ": " + localizer.__("An update is available: v[[0]] --> v[[1]].", {
						placeholders: [version, latest]
					}) + "\n";
				}

				continue;
			}
		}

		// If no way to find the latest version
		reply += name + ": " + localizer._("Impossible to get latest version!") + "\n";
	}

	await message.reply(reply.trim());
}
