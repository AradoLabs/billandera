var invoiceApp = new Vue({
    el: "#invoice-app",

    data: {
        bearerToken: "",
        selectedInvoiceId: "",
        invoice: { counterParty: { counterPartyAddress: { name: "" } } },
        invoices: [],
        selectedProduct: {},
        products: [],
        invoiceLines: [],

        baseUrl: "https://api-test.procountor.com/api/"
    },

    methods: {
        getProducts: function() {
            new ProcountorApiClient(this.baseUrl, this.bearerToken).getProducts(
                data => {
                    this.products = data.products;
                }
            );
        },
        getInvoices: function() {
            new ProcountorApiClient(this.baseUrl, this.bearerToken).getInvoices(
                data => {
                    data.results.forEach(element =>
                        this.invoices.push({
                            invoiceNumber: element.invoiceNumber,
                            id: element.id
                        })
                    );
                }
            );
        },

        getInvoice: function(id) {
            new ProcountorApiClient(this.baseUrl, this.bearerToken).getInvoice(
                this.selectedInvoiceId,
                data => {
                    this.invoice = data;
                }
            );
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
            new ProcountorApiClient(
                this.baseUrl,
                this.bearerToken
            ).createInvoice(this.invoice, data => {
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
