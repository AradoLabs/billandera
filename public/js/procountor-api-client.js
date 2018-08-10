"use strict;";

function ProcountorApiClient(baseUrl, bearerToken) {
    var _baseUrl = baseUrl;
    var _bearerToken = bearerToken;

    this.getInvoices = function(callback) {
        get("invoices?status=UNFINISHED", callback);
    };

    this.getInvoice = function(id, callback) {
        get("invoices/" + id, callback);
    };

    this.getProducts = function(callback) {
        get("products", callback);
    };

    this.createInvoice = function(invoice, callback) {
        post("invoices", invoice, callback);
    };

    var get = function getFromProcountorApi(url, callback) {
        var headers = {
            Authorization: "Bearer " + _bearerToken
        };

        fetch(_baseUrl + url, {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default"
        }).then(response => {
            if (!response.ok) alert(response.statusText);
            else {
                response.json().then(data => {
                    callback(data);
                });
            }
        });
    };

    var post = function postToProcountorApi(url, data, callback) {
        var headers = {
            Authorization: "Bearer " + _bearerToken,
            "Content-Type": "application/json"
        };

        fetch(_baseUrl + url, {
            method: "POST",
            headers: headers,
            mode: "cors",
            cache: "default",
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) alert(response.statusText);
            else {
                response.json().then(data => {
                    callback(data);
                });
            }
        });
    };
}
