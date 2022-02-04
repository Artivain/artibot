// Manifest file for core module

module.exports = {
	manifest: {

		version: 1,
		name: "Artibot Core",
		parts: [

			// Commands
			{
				id: "help",
				type: "command",
				path: "src/commands/help.js"
			},
			// {
			// 	id: "info",
			// 	type: "command",
			// 	path: "src/commands/info.js"
			// },
			// {
			// 	id: "ping",
			// 	type: "command",
			// 	path: "src/commands/ping.js"
			// },
			// {
			// 	id: "update",
			// 	type: "command",
			// 	path: "src/commands/update.js"
			// },
			// {
			// 	id: "reload",
			// 	type: "command",
			// 	path: "src/commands/reload.js"
			// },

			// Slash commands
			{
				id: "embed",
				type: "slashcommand",
				path: "src/slash-commands/embed.js"
			},
			{
				id: "help",
				type: "slashcommand",
				path: "src/slash-commands/help.js"
			},
			{
				id: "info",
				type: "slashcommand",
				path: "src/slash-commands/info.js"
			},
			{
				id: "ping",
				type: "slashcommand",
				path: "src/slash-commands/ping.js"
			},

			// User menu
			{
				id: "avatar",
				type: "usermenu",
				path: "src/user-menu/avatar.js"
			},
			{
				id: "informations",
				type: "usermenu",
				path: "src/user-menu/informations.js"
			},

			// Message menu
			{
				id: "react",
				type: "messagemenu",
				path: "src/message-menu/react.js"
			},

			// Buttons
			{
				id: "delete",
				type: "button",
				path: "src/buttons/delete.js"
			},
			{
				id: "registerslashcommands.js",
				type: "button",
				path: "src/buttons/registerslashcommands.js"
			}
		]
	}
};