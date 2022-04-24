import Artibot from "./index.js";
import token from "./private.js";

const artibot = new Artibot({
	ownerId: "382869186042658818",
	botName: "Artibot [DEV]",
	prefix: "abd ",
	lang: "fr"
});

artibot.login({ token });