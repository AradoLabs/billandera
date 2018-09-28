"use strict";

const url = require("url");
const ProcountorAuthentication = require("./procountor-authentication");

class BillanderaServer {
    constructor(procountorApiBaseUrl, redirectUrl, clientId, clientSecret) {
        this.authenticator = new ProcountorAuthentication(procountorApiBaseUrl, clientId, clientSecret, redirectUrl);
    }

    authenticationCallback(request, response) {
        var queryString = url.parse(request.url, true).query;

        this.authenticator
            .getToken(queryString.code)
            .then(tokenResponse => {
                request.session.refreshToken = tokenResponse.refreshToken;
                this.setBearerTokenCookie(response, tokenResponse);
                response.redirect(request.baseUrl + "/");
            })
            .catch(error => {
                response.end(error.message);
            });
    }

    authenticate(request, response, next) {
        if (request.cookies.access_token) {
            next();
        } else if (request.session.refreshToken) {
            this.refreshAuthenticationToken(request, response).then(() => next());
        } else {
            response.redirect(this.authenticator.loginUrl());
        }
    }

    refreshAuthenticationToken(request, response) {
        var refreshToken = request.session.refreshToken;

        return this.authenticator
            .getTokenWithRefreshToken(refreshToken)
            .then(tokenResponse => {
                this.setBearerTokenCookie(response, tokenResponse);
            })
            .catch(error => {
                response.end(error.message);
            });
    }

    logout(request, response) {
        request.session.refreshToken = "";
        response.cookie("access_token", "", { maxAge: 0 });
        response.redirect("/");
    }

    setBearerTokenCookie(response, tokenResponse) {
        response.cookie("access_token", tokenResponse.token, { maxAge: 1000 * tokenResponse.lifetimeInSeconds });
    }
}

module.exports = BillanderaServer;
