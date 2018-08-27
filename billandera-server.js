"use strict";

const url = require("url");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const ProcountorAuthentication = require("./procountor-authentication");

const baseUrl = "https://api-test.procountor.com";
const redirectUri = "http://localhost:8080/auth";
const clientId = "aradoTestClient";
const clientSecret = "testsecret_u5gqQGYGD3FMDXMZXcMe";
var authenticator = new ProcountorAuthentication(baseUrl, clientId, clientSecret, redirectUri);

const app = express();

app.use(cookieParser());
app.use(
    session({
        secret: "very secret stuff",
        cookie: { secure: false } // set true for prod
    })
);

app.get("/login", (request, response) => {
    response.redirect(authenticator.loginUrl());
});

app.get("/auth", (request, response) => {
    authenticationCallback(request, response);
});

app.get("/refreshAuth", (request, response) => {
    refreshAuthenticationToken(request, response);
});

app.use((request, response, next) => {
    authenticate(request, response, next);
});

app.use(express.static("public"));

app.listen(8080);

var authenticationCallback = function(request, response) {
    var queryString = url.parse(request.url, true).query;

    authenticator
        .getToken(queryString.code)
        .then(tokenResponse => {
            request.session.refreshToken = tokenResponse.refreshToken;
            setBearerTokenCookie(response, tokenResponse);
            response.redirect(request.baseUrl + "/");
        })
        .catch(error => {
            response.end(error.message);
        });
};

var authenticate = function(request, response, next) {
    if (!request.cookies.access_token) {
        response.redirect(authenticator.loginUrl());
    } else {
        next();
    }
};

var refreshAuthenticationToken = function(request, response) {
    var refreshToken = request.session.refreshToken;

    authenticator
        .getTokenWithRefreshToken(refreshToken)
        .then(tokenResponse => {
            setBearerTokenCookie(response, tokenResponse);
            response.end();
        })
        .catch(error => {
            response.end(error.message);
        });
};

var setBearerTokenCookie = function(response, tokenResponse) {
    response.cookie("access_token", tokenResponse.token, { maxAge: 1000 * tokenResponse.lifetimeInSeconds });
};
