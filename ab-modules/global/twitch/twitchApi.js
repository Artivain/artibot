const https = require("https");

function getChannelId(username) {
	const options = {
		hostname: "api.twitch.tv",
		port: 443,
		path: "/helix/users?login=" + username,
		method: "GET",
		headers: {
			"Authorization": "Bearer wvbjazsepjo8p84x6lj38d2a1uythf",
			"Client-Id": "hz1nw3k4canjewvprmjwjz7a4o5bgb"
		}
	}

	const request = https.request(options, res => {
		if (res.statusCode != 200) {
			console.log("[TwitchMonitor] Erreur dans la requête pour obtenir l'ID.")
			throw "Erreur"
		}
		res.on("data", response => {
			response = JSON.parse(response).data[0];
			return response.id
		})
	})

	request.on("error", error => {
		console.error(error);
	})

	request.end();
}

module.exports = {
	channel(username) {
		console.log(getChannelId(username));
	}
}