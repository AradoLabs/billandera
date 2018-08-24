"use strict";

var invoiceApp = new Vue({
    el: "#invoice-app",

    data: {
        bearerToken: "",
        baseUrl: "https://api-test.procountor.com/api/",

        selectedInvoiceId: "",
        selectedMonth: 0,

        invoice: { counterParty: { counterPartyAddress: { name: "" } } },
        invoices: [],
        invoiceLineIdSeries: 1,
        products: [],
        invoiceLines: [],

        months: [],

        hideError: true,
        errorMessages: []
    },

    methods: {
        getProducts: function() {
            new ProcountorApiClient(this.baseUrl, this.bearerToken)
                .getProducts()
                .then(data => {
                    this.products = data.products;
                })
                .catch(error => {
                    this.addErrorMessage(error.message);
                });
        },

        getInvoices: function() {
            new ProcountorApiClient(this.baseUrl, this.bearerToken)
                .getInvoices()
                .then(data => {
                    data.results.forEach(element =>
                        this.invoices.push({
                            invoiceNumber: element.invoiceNumber,
                            id: element.id
                        })
                    );
                })
                .catch(error => {
                    this.addErrorMessage(error.message);
                });
        },

        getInvoice: function(id) {
            new ProcountorApiClient(this.baseUrl, this.bearerToken)
                .getInvoice(this.selectedInvoiceId)
                .then(data => {
                    this.invoice = data;
                })
                .catch(error => {
                    this.addErrorMessage(error.message);
                });
        },

        createInvoice: function() {
            this.updateInvoiceRows();
            delete this.invoice.id;
            delete this.invoice.invoiceNumber;

            new ProcountorApiClient(this.baseUrl, this.bearerToken)
                .createInvoice(this.invoice)
                .then(data => {
                    this.invoice = data;
                })
                .catch(error => {
                    this.addErrorMessage(error.message);
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
        },

        initializeMonths: function() {
            var currentMonth = new Date().getMonth() + 1;
            var currentYear = new Date().getFullYear();
            var firstMonthFromPreviousYear = currentMonth + 1;

            for (var i = firstMonthFromPreviousYear; i <= 12; i++) {
                this.months.push(new Month(i, currentYear - 1));
            }

            for (var i = 1; i <= currentMonth; i++) {
                this.months.push(new Month(i, currentYear));
            }

            this.selectedMonth = this.months.length - 2;
        },

        createInvoiceLine: function() {
            this.invoiceLines.push(new InvoiceLine(this.invoiceLineIdSeries++, null));
        },

        createMonthlyInvoiceLines: function() {
            var month = this.months[this.selectedMonth].month;
            var year = this.months[this.selectedMonth].year;

            var weeks = Weeks.getStartAndEndDaysForMonth(month, year);

            weeks.forEach(week => {
                var invoiceLine = new InvoiceLine(this.invoiceLineIdSeries++, null);
                invoiceLine.text = week.start + ". - " + week.end + "." + month + "." + year;

                this.invoiceLines.push(invoiceLine);
            });
        },

        removeInvoiceLine: function(index) {
            this.invoiceLines.splice(index, 1);
        },

        moveInvoiceLineUp: function(index) {
            Arrays.moveBackward(this.invoiceLines, index);
        },

        moveInvoiceLineDown: function(index) {
            Arrays.moveForward(this.invoiceLines, index);
        },

        invoiceTotalAmount: function() {
            var total = 0;
            this.invoiceLines.forEach(invoiceLine => {
                total = total + invoiceLine.total;
            });

            return total;
        },

        invoiceIsValid: function() {
            if (this.invoiceLines.length === 0) return false;

            var isValid = true;
            this.invoiceLines.forEach(invoiceLine => {
                if (!invoiceLine.isValid) isValid = false;
            });
            return isValid;
        },

        addErrorMessage: function(message) {
            this.errorMessages.push(message);
            this.hideError = false;
        },

        dismissErrors: function() {
            this.hideError = true;
            this.errorMessages = [];
        }
    },

    beforeMount() {
        this.bearerToken = Vue.cookie.get("access_token");
        this.getInvoices();
        this.getProducts();
        this.initializeMonths();
    }
});
