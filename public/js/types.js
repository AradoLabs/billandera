"use strict";

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

    get isValid() {
        return this.product !== null && this.quantity !== 0;
    }
}

class Month {
    constructor(month, year) {
        this.month = month;
        this.year = year;
    }
    get name() {
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        return monthNames[this.month - 1] + " " + this.year;
    }
}
