"use strict";

class ProcountorApiClient {
    constructor(baseUrl, refreshTokenCallback) {
        this.baseUrl = baseUrl;
        this.refreshTokenCallback = refreshTokenCallback;
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
        return this._get(this.baseUrl + url, this._getBearerToken()).catch(error => {
            if (error.message === "Unauthorized") {
                return this.refreshTokenCallback().then(() => {
                    return this._get(this.baseUrl + url, this._getBearerToken());
                });
            }
            throw error;
        });
    }

    post(url, data) {
        return this._post(this.baseUrl + url, this._getBearerToken(), data).catch(error => {
            if (error.message === "Unauthorized") {
                return this.refreshTokenCallback().then(() => {
                    return this._post(this.baseUrl + url, this._getBearerToken(), data);
                });
            }
            throw error;
        });
    }

    _get(url, bearerToken) {
        var headers = {
            Authorization: "Bearer " + bearerToken
        };
        return fetch(url, {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default"
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                if (response.status === 401) {
                    throw new Error("Unauthorized");
                }
                throw new Error("GET to procountor api failed with status " + response.status);
            }
        });
    }

    _post(url, bearerToken, data) {
        var headers = {
            Authorization: "Bearer " + bearerToken,
            "Content-Type": "application/json"
        };
        return fetch(url, {
            method: "POST",
            headers: headers,
            mode: "cors",
            cache: "default",
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                if (response.status === 401) {
                    throw new Error("Unauthorized");
                }
                throw new Error("POST to procountor api failed with status " + response.status);
            }
        });
    }

    _getBearerToken() {
        return Cookies.get("access_token");
    }
}
