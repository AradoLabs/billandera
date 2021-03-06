"use strict";

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const BillanderaServer = require("./billandera-server");

const port = process.env.PORT || 8080;
const procountorApiBaseUrl = process.env.PROCOUNTOR_API_BASE_URL;
const redirectUrl = process.env.REDIRECT_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const useHttps = process.env.USE_HTTPS === "true";

const app = express();
const b = new BillanderaServer(procountorApiBaseUrl, redirectUrl, clientId, clientSecret);

app.use(cookieParser());
app.use(
    session({
        store: new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
        secret: "very secret stuff",
        cookie: { secure: useHttps },
        resave: false,
        saveUninitialized: true
    })
);

app.get("/auth", (request, response) => {
    b.authenticationCallback(request, response);
});

app.get("/refreshAuth", (request, response) => {
    b.refreshAuthenticationToken(request, response).then(() => response.end());
});

app.get("/logout", (request, response) => {
    b.logout(request, response);
});

app.use((request, response, next) => {
    b.authenticate(request, response, next);
});

app.get("/procountorApiUrl", (request, response) => {
    response.end(procountorApiBaseUrl + "api/");
});

app.use(express.static("public"));

app.listen(port);
