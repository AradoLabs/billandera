class Weeks {
    static endOfFirstWeek(firstDate) {
        if (firstDate.getDay() == 0) {
            return 1;
        } else {
            return 7 - firstDate.getDay() + 1;
        }
    }

    static getStartAndEndDaysForMonth(month, year) {
        month = month - 1;
        let weeks = [],
            firstDate = new Date(year, month, 1),
            lastDate = new Date(year, month + 1, 0),
            numDays = lastDate.getDate();

        let start = 1;
        let end = this.endOfFirstWeek(firstDate);
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
}
