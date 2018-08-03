"use strict";

var http = require("http");
var url = require("url");
var fetch = require("node-fetch");
var ProcountorAuthentication = require("./procountor-authentication");

http.createServer(function (request, response) {

    var baseUrl = "https://api-test.procountor.com";
    var redirectUri = "http://localhost:8080/auth";
    var clientId = "aradoTestClient";
    var clientSecret = "testsecret_u5gqQGYGD3FMDXMZXcMe";

    var parsedUrl = url.parse(request.url, true);
    var path = parsedUrl.pathname;

    var authenticator = new ProcountorAuthentication(baseUrl, clientId, clientSecret, redirectUri);

    if (path === '/') {
        authenticator.RedirectProcountorToLogin(response);
    }
    else if (path === '/auth') {
        authenticator.GetToken(parsedUrl.query)
            .then(token => {
                response.end(token)
            })
            .catch(error => {
                response.end(error.message)
            });

    }
    else {
        response.end();
    }

}).listen(8080);