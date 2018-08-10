"use strict";

var fetch = require("node-fetch");

class ProcountorAuthentication {
    constructor(baseUrl, clientId, clientSecret, redirectUri) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    LoginUrl() {
        return (
            this.baseUrl +
            "/login?response_type=code&client_id=" +
            this.clientId +
            "&redirect_uri=" +
            this.redirectUri +
            "&state=test"
        );
    }

    GetToken(queryString) {
        var code = queryString.code;
        var state = queryString.state;
        var token = "";
        var encodedRedirectUri = encodeURIComponent(this.redirectUri);

        return fetch(
            this.baseUrl +
                "/api/oauth/token?grant_type=authorization_code&redirect_uri=" +
                encodedRedirectUri +
                "&code=" +
                code +
                "&client_id=" +
                this.clientId +
                "&client_secret=" +
                this.clientSecret,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        )
            .then(tokenResponse => {
                if (!tokenResponse.ok) {
                    throw new Error(tokenResponse.statusText);
                }
                return tokenResponse.json();
            })
            .then(json => {
                token = json.access_token;
                return token;
            });
    }
}

module.exports = ProcountorAuthentication;
