const { SapphireClient } = require('@sapphire/framework');
const config = require("./private.json")

const client = new SapphireClient({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.login(config.botToken);