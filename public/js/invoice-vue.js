"use strict";

var invoiceApp = new Vue({
    el: "#invoice-app",

    data: {
        procountorApiClient: {},

        selectedInvoiceId: "",
        selectedMonth: 0,

        invoice: new Invoice(),
        invoices: [],
        invoiceLineIdSeries: 1,
        products: [],
        invoiceLines: [],
        paymentTerm: 0,

        months: [],

        hideSuccess: true,
        hideError: true,
        errorMessages: []
    },

    methods: {
        getBaseUrl: function() {
            return fetch("/procountorApiUrl", { method: "GET" }).then(response => {
                return response.text();
            });
        },

        getProducts: function() {
            this.procountorApiClient
                .getProducts()
                .then(data => {
                    this.products = data.products;
                })
                .catch(error => {
                    this.addErrorMessage(error.message);
                });
        },

        getInvoices: function() {
            this.procountorApiClient
                .getInvoices()
                .then(data => {
                    data.results.forEach(element =>
                        this.procountorApiClient.getInvoice(element.id).then(invoice => {
                            this.invoices.push({
                                invoiceNumber: invoice.invoiceNumber,
                                id: invoice.id,
                                notes: invoice.notes
                            });
                        })
                    );
                })
                .catch(error => {
                    this.addErrorMessage(error.message);
                });
        },

        getPaymentTerm: function(businessPartnerId) {
            return this.procountorApiClient.getBusinessPartner(businessPartnerId).then(data => {
                this.paymentTerm = Number(data.paymentInfo.paymentTermDays);
            });
        },

        newInvoice: function() {
            this.invoice = new Invoice();
            this.invoiceLines = [];
        },

        copyInvoice: function(id) {
            this.procountorApiClient
                .getInvoice(this.selectedInvoiceId)
                .then(data => {
                    this.invoice = data;
                    this.invoice.date = new Date().toISOString().split("T")[0];
                    delete this.invoice.id;
                    delete this.invoice.invoiceNumber;

                    this.getPaymentTerm(data.partnerId).then(() => {
                        this.updateDueDate();
                    });
                })
                .catch(error => {
                    this.addErrorMessage(error.message);
                });
        },

        createInvoice: function() {
            if (!this.invoiceIsValid()) return;
            if (!window.confirm("Create invoice to Procountor?")) return;

            this.updateInvoiceRows();

            this.procountorApiClient
                .createInvoice(this.invoice)
                .then(data => {
                    this.newInvoice();
                    this.hideSuccess = false;
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

        updateDueDate: function() {
            var dueDate = new Date(this.invoice.date);
            dueDate.setDate(dueDate.getDate() + this.paymentTerm);
            this.invoice.paymentInfo.dueDate = dueDate.toISOString().split("T")[0];
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
            if (this.invoice.date <= this.invoice.paymentInfo.dueDate) {
                isValid = false;
            }
            return isValid;
        },

        addErrorMessage: function(message) {
            this.errorMessages.push(message);
            this.hideError = false;
        },

        dismissErrors: function() {
            this.hideError = true;
            this.errorMessages = [];
        },

        refreshAuthentication: function() {
            return fetch("/refreshAuth", { method: "GET" });
        }
    },

    beforeMount() {
        this.getBaseUrl().then(url => {
            this.procountorApiClient = new ProcountorApiClient(url, this.refreshAuthentication);
            this.getInvoices();
            this.getProducts();
        });

        this.initializeMonths();
    }
});
