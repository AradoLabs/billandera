"use strict";

const url = require("url");
const express = require("express");
const cookieParser = require("cookie-parser");

const ProcountorAuthentication = require("./procountor-authentication");

const baseUrl = "https://api-test.procountor.com";
const redirectUri = "http://localhost:8080/auth";
const clientId = "aradoTestClient";
const clientSecret = "testsecret_u5gqQGYGD3FMDXMZXcMe";
var authenticator = new ProcountorAuthentication(baseUrl, clientId, clientSecret, redirectUri);

const app = express();
app.use(cookieParser());

app.get("/", (request, response) => {
    authenticator.RedirectToProcountorLogin(response);
});

app.get("/auth", (request, response) => {
    var queryString = url.parse(request.url, true).query;

    authenticator.GetToken(queryString)
        .then(token => {
            response.cookie("access_token", token); // todo: set expiration etc.

            response.end(token)
        })
        .catch(error => {
            response.end(error.message)
        });
});

app.listen(8080);