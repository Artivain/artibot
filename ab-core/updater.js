const AutoGitUpdate = require('auto-git-update');

const config = {
	repository: 'https://github.com/Artivain/artibot',
	tempLocation: '../updaterbk',
	branch: "main",
	exitOnComplete: true
};

const updater = new AutoGitUpdate(config);

updater.setLogConfig({
	logDebug: true,
	logDetail: true,
	logGeneral: true,
	logWarning: true,
	logError: true
});
updater.autoUpdate();