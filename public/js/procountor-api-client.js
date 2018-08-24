"use strict";

class ProcountorApiClient {
    constructor(baseUrl, bearerToken) {
        this.baseUrl = baseUrl;
        this.bearerToken = bearerToken;
    }

    getInvoices(callback) {
        this.get("invoices?status=UNFINISHED", callback);
    }

    getInvoice(id, callback) {
        this.get("invoices/" + id, callback);
    }

    getProducts(callback) {
        this.get("products", callback);
    }

    createInvoice(invoice, callback) {
        this.post("invoices", invoice, callback);
    }

    get(url, callback) {
        var headers = {
            Authorization: "Bearer " + this.bearerToken
        };
        fetch(this.baseUrl + url, {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default"
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                response.json().then(data => {
                    callback(data);
                });
            }
        });
    }

    post(url, data, callback) {
        var headers = {
            Authorization: "Bearer " + this.bearerToken,
            "Content-Type": "application/json"
        };
        fetch(this.baseUrl + url, {
            method: "POST",
            headers: headers,
            mode: "cors",
            cache: "default",
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                response.json().then(data => {
                    callback(data);
                });
            }
        });
    }
}
