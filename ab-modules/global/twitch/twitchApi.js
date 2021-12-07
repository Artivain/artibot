const https = require("https");
const private = require("./private.json");

function getChannelId(username) {
	const options = {
		hostname: "api.twitch.tv",
		port: 443,
		path: "/helix/users?login=" + username,
		method: "GET",
		headers: {
			"Authorization": "Bearer " + private.twitchToken,
			"Client-Id": private.twitchClientId
		}
	}

	const request = https.request(options, res => {
		if (res.statusCode != 200) {
			console.log("[TwitchMonitor] Erreur dans la requête pour obtenir l'ID.")
			throw "Erreur"
		}
		res.on("data", response => {
			response = JSON.parse(response).data[0];
			console.log(response.id);
		})
	})

	request.on("error", error => {
		console.error(error);
	})

	request.end();
}

module.exports = {
	channel(username) {
		getChannelId(username);
	}
}
