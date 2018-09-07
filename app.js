"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const BillanderaServer = require("./billandera-server");

const app = express();
const b = new BillanderaServer();

app.use(cookieParser());
app.use(
    session({
        store: new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
        secret: "very secret stuff",
        cookie: { secure: false }, // set true for prod
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

app.use(express.static("public"));

app.listen(8080);
