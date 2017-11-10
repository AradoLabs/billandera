var invoiceApp = new Vue({
    el: "#invoice-app",

    data: {
        selectedInvoiceId: "",
        invoice: {},
        invoices: [],
        selectedProduct: {},
        products: [],
        invoiceLines: []
    },

    methods: {
        getInvoices: function() {
            getFromProcountorApi("invoices?status=UNFINISHED", data => {
                data.results.forEach(element =>
                    this.invoices.push({
                        invoiceNumber: element.invoiceNumber,
                        id: element.id
                    })
                );
            });
        },

        getInvoice: function(id) {
            getFromProcountorApi("invoices/" + this.selectedInvoiceId, data => {
                this.invoice = data;
                this.invoice.invoiceRows.forEach(row => {
                    var invoiceLine = new InvoiceLine(
                        this.invoiceLines.length,
                        this.products.find(
                            element => element.id === row.productId
                        )
                    );
                    invoiceLine.quantity = row.quantity;
                    invoiceLine.text = row.comment;
                    this.invoiceLines.push(invoiceLine);
                });
            });
        },

        addInvoiceLine: function() {
            this.invoiceLines.push(
                new InvoiceLine(this.invoiceLines.length, this.selectedProduct)
            );
        },

        removeInvoiceLine: function(index) {
            this.invoiceLines.splice(index, 1);
        },

        createInvoice: function() {
            this.updateInvoiceRows();
            delete this.invoice.id;
            delete this.invoice.invoiceNumber;
            postToProcountorApi("invoices", this.invoice, data => {
                this.invoice = data;
            });
        },

        updateInvoiceRows: function() {
            this.invoice.invoiceRows = [];
            this.invoiceLines.forEach(line => {
                this.invoice.invoiceRows.push({
                    product: line.product.name,
                    productCode: line.product.code,
                    productId: line.product.id,
                    unit: line.product.unit,
                    unitPrice: line.product.price,
                    vatPercent: line.product.vat,
                    quantity: line.quantity,
                    comment: line.text,
                    discountPercent: 0
                });
            });
        }
    },

    mounted: function() {
        getFromProcountorApi("products", data => {
            this.products = data.products;
        });
    }
});

function InvoiceLine(id, product) {
    this.id = id;
    this.product = product;
    this.quantity = 0;
    this.text = "";
    this.total = function() {
        return this.product.price * this.quantity;
    };
}

function getFromProcountorApi(url, callback) {
    var headers = {
        Authorization: "Bearer insert token here"
    };

    fetch("https://api-test.procountor.com/api/" + url, {
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
}

function postToProcountorApi(url, data, callback) {
    var headers = {
        Authorization: "Bearer insert token here",
        "Content-Type": "application/json"
    };

    fetch("https://api-test.procountor.com/api/" + url, {
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
}
