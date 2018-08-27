"use strict";

const fetch = require("node-fetch");

class ProcountorAuthentication {
    constructor(baseUrl, clientId, clientSecret, redirectUri) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    loginUrl() {
        return (
            this.baseUrl +
            "/login?response_type=code&client_id=" +
            this.clientId +
            "&redirect_uri=" +
            this.redirectUri +
            "&state=test"
        );
    }

    getToken(code) {
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
                    throw new Error(tokenResponse);
                }
                return tokenResponse.json();
            })
            .then(json => {
                return {
                    token: json.access_token,
                    lifetimeInSeconds: json.expires_in,
                    refreshToken: json.refresh_token
                };
            });
    }

    getTokenWithRefreshToken(refreshToken) {
        return fetch(
            this.baseUrl +
                "/api/oauth/token?grant_type=refresh_token&refresh_token=" +
                refreshToken +
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
                    throw new Error(tokenResponse);
                }
                return tokenResponse.json();
            })
            .then(json => {
                return {
                    token: json.access_token,
                    lifetimeInSeconds: json.expires_in
                };
            });
    }
}

module.exports = ProcountorAuthentication;
