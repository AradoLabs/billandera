"use strict";

var invoiceApp = new Vue({
    el: "#invoice-app",

    data: {
        bearerToken: "",
        selectedInvoiceId: "",
        invoice: { counterParty: { counterPartyAddress: { name: "" } } },
        invoices: [],
        invoiceLineIdSeries: 1,
        products: [],
        invoiceLines: [],
        selectedMonth: 0,
        months: [],

        baseUrl: "https://api-test.procountor.com/api/"
    },

    methods: {
        getProducts: function() {
            new ProcountorApiClient(this.baseUrl, this.bearerToken).getProducts(data => {
                this.products = data.products;
            });
        },

        getInvoices: function() {
            new ProcountorApiClient(this.baseUrl, this.bearerToken).getInvoices(data => {
                data.results.forEach(element =>
                    this.invoices.push({
                        invoiceNumber: element.invoiceNumber,
                        id: element.id
                    })
                );
            });
        },

        getInvoice: function(id) {
            new ProcountorApiClient(this.baseUrl, this.bearerToken).getInvoice(this.selectedInvoiceId, data => {
                this.invoice = data;
            });
        },

        createInvoice: function() {
            this.updateInvoiceRows();
            delete this.invoice.id;
            delete this.invoice.invoiceNumber;
            new ProcountorApiClient(this.baseUrl, this.bearerToken).createInvoice(this.invoice, data => {
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
        }
    },

    beforeMount() {
        this.bearerToken = Vue.cookie.get("access_token");
        this.getInvoices();
        this.getProducts();
        this.initializeMonths();
    }
});
