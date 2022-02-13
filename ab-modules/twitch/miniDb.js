const fs = require('fs');

class MiniDb {
	constructor(name, log, localizer) {
		this.logToConsole = log;
		this.localizer = localizer;
		this.basePath = `${__dirname}/data/`;

		if (!fs.existsSync(this.basePath)) {
			this.logToConsole('TwitchMonitor', this.localizer.__("Creating directory for minidb: [[0]]", { placeholders: [this.basePath] }));
			fs.mkdirSync(this.basePath);
		}

		this.basePath = `${__dirname}/data/${name}`;

		if (!fs.existsSync(this.basePath)) {
			this.logToConsole('TwitchMonitor', this.localizer.__("Creating directory for minidb: [[0]]", { placeholders: [this.basePath] }));
			fs.mkdirSync(this.basePath);
		}
	}

	get(id) {
		const filePath = `${this.basePath}/${id}.json`;

		try {
			if (fs.existsSync(filePath)) {
				const raw = fs.readFileSync(filePath, {
					encoding: 'utf8',
					flag: 'r'
				});
				return JSON.parse(raw) || null;
			}
		} catch (e) {
			this.logToConsole('TwitchMonitor', this.localizer.__("Writing error: [[0]], [[1]]", { placeholders: [filePath, e] }), "error");
		}
		return null;
	}

	put(id, value) {
		const filePath = `${this.basePath}/${id}.json`;

		try {
			const raw = JSON.stringify(value);
			fs.writeFileSync(filePath, raw, {
				encoding: 'utf8',
				mode: '666',
				flag: 'w'
			});
			return true;
		} catch (e) {
			this.logToConsole('TwitchMonitor', this.localizer.__("Writing error: [[0]], [[1]]", { placeholders: [filePath, e] }), "error");
			return false;
		}
	}
}

module.exports = MiniDb;