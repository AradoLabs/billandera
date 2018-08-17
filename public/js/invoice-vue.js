class InvoiceLine {
    constructor(id, product) {
        this.id = id;
        this.product = product;
        this.quantity = 0;
        this.text = "";
    }
    get total() {
        if (this.product !== null) {
            return this.product.price * this.quantity;
        }
        return 0;
    }
}

class Month {
    constructor(month, year) {
        this.month = month;
        this.year = year;
    }
    get name() {
        const monthNames = [
            "Tammikuu",
            "Helmikuu",
            "Maaliskuu",
            "Huhtikuu",
            "Toukokuu",
            "Kesäkuu",
            "Heinäkuu",
            "Elokuu",
            "Syyskuu",
            "Lokakuu",
            "Marraskuu",
            "Joulukuu"
        ];

        return monthNames[this.month - 1] + " " + this.year;
    }
}

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
        },

        getMonths: function() {
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

        createMonthlyInvoiceLines: function() {
            var month = this.months[this.selectedMonth].month;
            var year = this.months[this.selectedMonth].year;

            var weeks = getWeeksStartAndEndInMonth(month, year);

            weeks.forEach(week => {
                var invoiceLine = new InvoiceLine(
                    this.invoiceLineIdSeries++,
                    null
                );
                invoiceLine.text =
                    week.start + ". - " + week.end + "." + month + "." + year;
                invoiceLine.product = { name: "select", price: 0 };

                this.invoiceLines.push(invoiceLine);
            });
        },

        invoiceTotalAmount: function() {
            var total = 0;
            this.invoiceLines.forEach(invoiceLine => {
                total = total + invoiceLine.total;
            });

            return total;
        }
    },

    beforeMount() {
        this.bearerToken = Vue.cookie.get("access_token");
        this.getInvoices();
        this.getProducts();
        this.getMonths();
    }
});

function endFirstWeek(firstDate, firstDay) {
    if (!firstDay) {
        return 7 - firstDate.getDay();
    }
    if (firstDate.getDay() < firstDay) {
        return firstDay - firstDate.getDay();
    } else {
        return 7 - firstDate.getDay() + firstDay;
    }
}

function getWeeksStartAndEndInMonth(month, year) {
    month = month - 1;
    let weeks = [],
        firstDate = new Date(year, month, 1),
        lastDate = new Date(year, month + 1, 0),
        numDays = lastDate.getDate();

    let start = 1;
    let end = endFirstWeek(firstDate, 1);
    while (start <= numDays) {
        weeks.push({ start: start, end: end });
        start = end + 1;
        end = end + 7;
        end = start === 1 && end === 8 ? 1 : end;
        if (end > numDays) {
            end = numDays;
        }
    }
    return weeks;
}
