"use strict";

class ProcountorApiClient {
    constructor(baseUrl, bearerToken) {
        this.baseUrl = baseUrl;
        this.bearerToken = bearerToken;
    }

    getInvoices() {
        return this.get("invoices?status=UNFINISHED");
    }

    getInvoice(id) {
        return this.get("invoices/" + id);
    }

    getProducts() {
        return this.get("products");
    }

    createInvoice(invoice) {
        return this.post("invoices", invoice);
    }

    get(url) {
        var headers = {
            Authorization: "Bearer " + this.bearerToken
        };
        return fetch(this.baseUrl + url, {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default"
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("GET to procountor api failed with status " + response.status);
            }
        });
    }

    post(url, data) {
        var headers = {
            Authorization: "Bearer " + this.bearerToken,
            "Content-Type": "application/json"
        };
        return fetch(this.baseUrl + url, {
            method: "POST",
            headers: headers,
            mode: "cors",
            cache: "default",
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            } else {
                return response.json();
            }
        });
    }
}
