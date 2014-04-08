function TicketDate(c, a, b) {
    this.year = c === undefined ? 0 : c;
    this.month = a == undefined ? 0 : a;
    this.day = b == undefined ? 0 : b;
    this.isOk = function () {
        return this.day != 0
    };
    this.now = function () {
        this.year = TDATE.year;
        this.month = TDATE.month;
        this.day = TDATE.day;
        return this
    };
    this.parse = function (g) {
        g = $.trim(g);
        this.date = 0;
        var h, e = g.split(/[\.\-\/\s]/),
            f = /^\d+$/;
        var d = e.length;
        if (d < 2 || d > 3) {
            return false
        }
        for (h in e) {
            if (!f.test(e[h])) {
                return false
            }
            e[h] = parseInt(e[h], 10)
        }
        if (d < 3) {
            return false
        } else {
            if (e[2] < 100) {
                e[2] += 2000
            }
            if (e[2] < 1900 || e[2] > 2100) {
                return false
            }
            this.year = e[2]
        } if (e[1] < 1 || e[1] > 12) {
            return false
        }
        this.month = e[1] - 1;
        if (e[0] < 1 || e[0] > TDATE.MonthLen(this.month, e[2])) {
            return false
        }
        this.day = e[0];
        return true
    };
    if (typeof this.year === "string") {
        this.parse(this.year)
    }
    this.nextMonth = function (d) {
        this.month += d;
        while (this.month >= 12) {
            this.month -= 12;
            this.year++
        }
        while (this.month < 0) {
            this.month += 12;
            this.year--
        }
    };
    this.dayOfWeek = function () {
        var e = new TicketDate(2007, 0, 1);
        var f = this.calcDaysBetween(e);
        if (f < 0) {
            f = -f
        }
        return f % 7
    };
    this.dayOfWeekName = function () {
        if (!this.isOk()) {
            return ""
        }
        return Lang.WeekDays[this.dayOfWeek()]
    };
    this.dayOfWeekShort = function () {
        if (!this.isOk()) {
            return ""
        }
        return TDATE.DayOfWeekShort(this.dayOfWeek())
    };
    this.calcDaysBetween = function (k) {
        var f, h, e, j, g = 0;
        if (this.year != k.year) {
            h = 1;
            if (k.year < this.year) {
                h = -1
            }
            for (j = this.year; j != k.year; j += h) {
                e = 365;
                if (h > 0) {
                    if (this.month <= 1) {
                        if (TDATE.IsLeap(j)) {
                            e++
                        }
                    } else {
                        if (TDATE.IsLeap(j + 1)) {
                            e++
                        }
                    }
                    g += e
                } else {
                    if (this.month > 1) {
                        if (TDATE.IsLeap(j)) {
                            e++
                        }
                    } else {
                        if (TDATE.IsLeap(j - 1)) {
                            e++
                        }
                    }
                    g -= e
                }
            }
        }
        if (this.month != k.month) {
            h = 1;
            if (k.month < this.month) {
                h = -1
            }
            for (f = this.month; f != k.month; f += h) {
                if (h > 0) {
                    g += TDATE.MonthLen(f, k.year)
                } else {
                    g -= TDATE.MonthLen(f - 1, k.year)
                }
            }
        }
        g += k.day - this.day;
        return g
    };
    this.incr = function () {
        var d = TDATE.MonthLen(this.month, this.year);
        if (++this.day > d) {
            this.day -= d;
            if (++this.month == 12) {
                this.month = 0;
                this.year++
            }
        }
        return this
    };
    this.decr = function () {
        if (--this.day == 0) {
            if (--this.month < 0) {
                this.month = 11;
                this.year--
            }
            this.day = TDATE.MonthLen(this.month, this.year)
        }
        return this
    };
    this.addDays = function (d) {
        if (d < 0) {
            while (d++ < 0) {
                this.decr()
            }
        } else {
            while (d-- > 0) {
                this.incr()
            }
        }
    };
    this.equals = function (d) {
        return this.year == d.year && this.month == d.month && this.day == d.day
    };
    this.less = function (d) {
        if (this.year != d.year) {
            return this.year < d.year
        }
        if (this.month != d.month) {
            return this.month < d.month
        }
        return this.day < d.day
    };
    this.toString = function (d) {
        if (this.year == 0) {
            return ""
        }
        if (d && d === true) {
            return this.day + "." + (this.month + 1) + "." + (this.year % 100)
        }
        var e = TDATE.zfill(this.day, 2) + "." + TDATE.zfill(this.month + 1, 2) + "." + this.year;
        if (d && d == "DOW") {
            e += ", " + this.dayOfWeekName()
        }
        return e
    };
    this.monthName = function () {
        return TDATE.MonthName(this.month)
    };
    this.clone = function () {
        return new TicketDate(this.year, this.month, this.day)
    }
}
var TDATE = {
    year: (new Date()).getFullYear(),
    month: (new Date()).getMonth(),
    day: (new Date()).getDate(),
    monthLen: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    MonthLen: function (a, c) {
        var b = TDATE.monthLen[a];
        if (a == 1 && TDATE.IsLeap(c)) {
            b++
        }
        return b
    },
    IsLeap: function (a) {
        return (a & 3) == 0
    },
    DayOfWeekShort: function (a) {
        return Lang.WeekDaysShort[a]
    },
    MonthName: function (a) {
        return Lang.Months[a]
    },
    ToMins: function (a, c) {
        var b = new TicketDate(a);
        var d = new TicketDate(2011, 0, 1).calcDaysBetween(b);
        return d * 1440 + TTIME.ToMins(c)
    },
    zfill: function (b, a) {
        var c = b.toString();
        while (c.length < a) {
            c = "0" + c
        }
        return c
    }
};
var TTIME = {
    ToMins: function (b) {
        var a = b.split(":");
        return parseInt(a[0], 10) * 60 + parseInt(a[1], 10)
    },
    FromMins: function (a) {
        return TDATE.zfill(Math.floor(a / 60), 2) + ":" + TDATE.zfill(Math.abs(a) % 60, 2)
    }
};
if ("setServerDate" in window) {
    setServerDate()
};