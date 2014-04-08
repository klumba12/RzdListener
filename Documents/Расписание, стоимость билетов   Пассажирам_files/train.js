var CapFields = ["route0", "route1", "station0", "station1"];
var MagicCarsf = 63;
var _GlbTrace = [];

function tr_trace(a) {
    _GlbTrace.push(a);
    $("#Info1").append("<div>" + a + "</div>")
}

function shortSt(b) {
    var a = b.indexOf(",");
    if (b < 0) {
        return b
    }
    a = b.indexOf(",", a + 1);
    if (a < 0) {
        return b
    }
    return b.substring(0, a)
}

function CvtDT(a, c) {
    var b = a["date" + c].split(".");
    return b[2] + b[1] + b[0] + a["time" + c]
}

function IsCateg(a, d) {
    var b = a.servCls;
    if (b == "3П") {
        return d == "3"
    }
    var c = b.charAt(0);
    if (d == "1" || d == "2") {
        return d == c
    }
    if (d == "4") {
        return c == "3"
    }
    return false
}

function carFlag(a) {
    return 1 << (a - 1)
}
var TrainLat = {
    "А": "AJ",
    "Б": "BJ",
    "В": "VJ",
    "Г": "GJ",
    "Д": "DJ",
    "Е": "EJ",
    "Ё": "YO",
    "Ж": "ZH",
    "З": "ZJ",
    "И": "IJ",
    "Й": "JI",
    "К": "KJ",
    "Л": "LJ",
    "М": "MJ",
    "Н": "NJ",
    "О": "OJ",
    "П": "PC",
    "Р": "RJ",
    "С": "SJ",
    "Т": "TJ",
    "У": "UJ",
    "Ф": "FJ",
    "Х": "KH",
    "Ц": "CJ",
    "Ч": "CH",
    "Ш": "SH",
    "Щ": "SZ",
    "Ъ": "TZ",
    "Ы": "Y ",
    "Ь": "MZ",
    "Э": "EI",
    "Ю": "J ",
    "Я": "JA"
};

function trainNum2Lat(a) {
    var d = 0,
        f, e = a.length,
        b = "";
    for (; d != e; d++) {
        f = a.charAt(d);
        if (f in TrainLat) {
            b += TrainLat[f]
        } else {
            b += f
        }
    }
    return b
}

function mskTime(b, a) {
    var c = "MskTime";
    if (a) {
        c += a
    }
    return Lang[c][b]
}

function capLst(d, c) {
    if (!(c in d)) {
        return
    }
    var b, a = d[c].split(",");
    for (b in a) {
        a[b] = capitalize(a[b])
    }
    d[c] = a.join(",")
}

function cvtTime(c) {
    var b = c.split(":");
    return lang("[H]h [M]min", {
        H: +b[0],
        M: +b[1]
    })
}

function cvtTimeLen(d) {
    var b = d.split(":");
    var e = {
        M: +b[1]
    }, c = +b[0];
    if (c == 0) {
        return lang("[M]min", e)
    }
    e.H = c;
    return lang("[H]h [M]min", e)
}

function Train() {
    this.type = 0;
    this.number = "";
    this.number2 = "";
    this.elReg = false;
    this.brand = "";
    this.carrier = "";
    this.route0 = "";
    this.route1 = "";
    this.timeInWay = 0;
    this.time0 = "";
    this.date0 = null;
    this.station0 = "";
    this.time1 = "";
    this.date1 = null;
    this.station1 = "";
    this.cars = [];
    this.uid = "";
    this.canSel = true;
    this.stList = this.stListX = this.mvMode = "";
    this.chWarn = false;
    this.flMsk = 0;
    this.update = function (dir) {
        this.dir = dir;
        if (!this.number2) {
            this.number2 = this.number
        }
        for (var i in CapFields) {
            this[CapFields[i]] = capitalize(this[CapFields[i]])
        }
        this.canSel = this.type == 0 && this.cars.length > 0;
        if (this.type == 1) {
            HTR.subFl |= 1 << dir
        } else {
            HTR.subOnly[dir] = false
        }
        var is6 = is6000(this.number2);
        HTR.is6Only[dir] = HTR.is6Only[dir] && is6;
        HTR.is6000[dir] = HTR.is6000[dir] || is6;
        this.TimeInWay = cvtTimeLen(this.timeInWay);
        var mv = this.mvModeHd();
        if (mv != "") {
            HTR.MvMode[dir][mv] = 1
        }
        return this
    };
    this.mvModeHd = function () {
        var i, s = ("mvMode" in this) ? this.mvMode : "";
        i = s.indexOf("<");
        if (i >= 0) {
            s = s.substring(0, i)
        }
        i = s.indexOf(",");
        if (i >= 0) {
            s = s.substring(0, i)
        }
        return s
    };
    this.checkSt = function (dir) {
        this.canSel = this.canSel && HTR.canSel[dir]
    };
    this.toMins = function (n) {
        return TDATE.ToMins(this["date" + n], this["time" + n])
    };
    this.startT = function () {
        return this.toMins(0)
    };
    this.sortVal = function (mode) {
        if (mode == "time0") {
            return CvtDT(this, 0)
        }
        if (mode == "time1") {
            return CvtDT(this, 1)
        }
        return this[mode]
    };
    this.haveCat = function (n) {
        for (var i in this.cars) {
            if (IsCateg(this.cars[i], n)) {
                return true
            }
        }
        return false
    };
    this.minCost = function (carsf) {
        var i, mc = 10000000000;
        if (carsf == MagicCarsf) {
            for (i in this.cars) {
                with(this.cars[i]) {
                    mc = Math.min(mc, tariff)
                }
            }
        } else {
            for (i in this.cars) {
                with(this.cars[i]) {
                    if (carsf & carFlag(itype)) {
                        mc = Math.min(mc, tariff)
                    }
                }
            }
        } if (mc == 10000000000) {
            mc = 0
        }
        return mc
    };
    this.mkDef = function (dir, seg) {
        return "&dir_" + dir + "_train_uid" + seg + "=" + encodeURIComponent(this.uid)
    };
    this.buildRes = function (dir, res) {
        if (!this.canSelect()) {
            return
        }
        this.code0 = HTR.code[dir];
        this.code1 = HTR.code[dir ^ 1];
        res.push(this)
    };
    this.canSelect = function () {
        return this.canSel
    };
    this.getProps = function (dir, index, carsf) {
        var TL = "";
        if (this.cars.length == 0) {
            if (this.type == 0) {
                if (HT.tp[dir].expressErr) {
                    TL = applyTempl("ExpressDenied", {})
                } else {
                    TL = applyTempl("NotSeats", {})
                }
            }
        } else {
            if (carsf === undefined) {
                carsf = MagicCarsf
            }
            var j, sr = "";
            for (j in this.cars) {
                if (carFlag(this.cars[j].itype) & carsf) {
                    sr += applyTempl("SeatsRow", $.extend({
                        SeatsRowCost: this.cars[j].tariff == 0 ? "" : applyTempl("SeatsRowCost", this.cars[j])
                    }, this.cars[j]))
                }
            }
            TL = applyTempl("SeatsTempl", {
                SeatsRows: sr
            })
        }
        var props1 = jQuery.extend(this, {
            elReg: this.elReg ? applyTempl("ElRegTempl", {}) : "",
            route0: shortSt(this.route0),
            route1: shortSt(this.route1),
            flCost: HTR.flCost[dir],
            Route0: encodeURIComponent(shortSt(this.route0)),
            Route1: encodeURIComponent(shortSt(this.route1)),
            nb_date0: HTR.bBase ? "" : this.date0,
            nb_date1: HTR.bBase ? "" : this.date1,
            h_date0: HTR.bBase ? "" : "| " + this.date0,
            h_date1: HTR.bBase ? "" : "| " + this.date1,
            Number2: encodeURIComponent(this.number),
            station0: shortSt(this.station0),
            station1: shortSt(this.station1),
            BrandInfo: this.brand,
            src_code: HT.code[0],
            number_lat: trainNum2Lat(this.number),
            typeLbl: TrTypeName(this),
            Dir: dir,
            Index: index,
            BrandIcon: this.brandIcon(),
            TimeSrc: mskTime(this.flMsk & 1),
            TimeDst: mskTime(this.flMsk >> 1),
            TimeSrcTitle: mskTime(this.flMsk & 1, "Title"),
            TimeDstTitle: mskTime(this.flMsk >> 1, "Title"),
            ChangeWarning: this.chWarn ? applyTempl("ChangeWarning", this) : "",
            StList: this.stListX == "" ? this.stList : this.stListX,
            StListItem: this.stList === "" ? "" : applyTempl(this.stListX == "" ? "StListShort" : "StListExt", this)
        });
        return $.extend(props1, {
            carrier: this.carrier == "null" ? "" : this.carrier,
            RouteLink: applyTempl("RouteLink" + this.type, props1),
            FreeSeats: TL
        })
    };
    this.chkCarMap = function (m) {
        if (this.type == 1) {
            return true
        }
        var i, me = 0;
        for (i in this.cars) {
            me |= carFlag(this.cars[i].itype)
        }
        return (m & me)
    };
    this.brandIcon = function () {
        if (!(this.brand in BrandIcons)) {
            return ""
        }
        return applyTempl("BrandIcon", $.extend(this, {
            file: BrandIcons[this.brand]
        }))
    };
    this.trace = function () {
        var j, s = "";
        for (j in this.cars) {
            with(this.cars[j]) {
                s += itype + "-" + type + " (" + freeSeats + ") " + tariff + "; "
            }
        }
        return '<tr onmouseover="showSeats(this)" onmouseout="hideSeats()" style="font-size:12px"><td>' + this.number2 + "</td><td>" + (this.elReg ? "эр" : "") + "</td><td>" + this.route0 + " - " + this.route1 + "</td><td>" + this.time0 + "|" + this.date0 + "</td><td>" + this.time1 + "|" + this.date1 + "</td><td><b>" + this.timeInWay + '</b></td><td><input type="hidden" value="' + s + '"/></td></tr>'
    }
}
var SEl = true;

function showSeats(a) {
    hideSeats();
    var b = $(a).offset();
    $("#SEL").show().css("top", (b.top + 15) + "px").css("left", b.left + "px").html($("input", a).val())
}

function hideSeats() {
    if (SEl) {
        $("body").append('<span id="SEL" class="tooltip">Hello</span>');
        SEl = false
    }
    $("#SEL").hide()
}

function updateTrain(b, a) {
    return $.extend(new Train(), b).update(a)
}

function Transfer() {
    this.midPt = "";
    this.midCode = 0;
    this.delay = "-";
    this.timeInWay = "=";
    this.selFl = [true, true];
    this.cur = [0, 0];
    this.cases = [
        [],
        []
    ];
    this.update = function (b) {
        var c, a;
        for (c in this.cases) {
            for (a in this.cases[c]) {
                this.cases[c][a] = updateTrain(this.cases[c][a], b)
            }
        }
        this.updateTimes();
        return this
    };
    this.checkSt = function (b, a) {
        var e, d;
        var f = (this.midCode << 1) | b;
        if (f in a) {
            e = a[f]
        } else {
            a[f] = e = [isTicketRoute(b, {
                code: [HTR.code[0 ^ b], this.midCode]
            }), isTicketRoute(b, {
                code: [this.midCode, HTR.code[1 ^ b]]
            })]
        }
        for (d = 0; d < 2; d++) {
            this.selFl[d] &= e[d]
        }
    };
    this.updateTimes = function () {
        var d = this.getCurCase(0),
            b = this.getCurCase(1);
        var e = d.toMins(1);
        var c = b.toMins(0);
        this.delay = TTIME.FromMins(c - e);
        this.Delay = cvtTimeLen(this.delay);
        var a = TTIME.ToMins(d.timeInWay) + c - e + TTIME.ToMins(b.timeInWay);
        this.TimeInWay = cvtTimeLen(this.timeInWay = TTIME.FromMins(a))
    };
    this.startT = function () {
        return this.getCurCase(0).toMins(0)
    };
    this.isCompatible = function (a, b) {
        var c = [0, 0],
            d = a ^ 1;
        c[a] = this.cases[a][b].toMins(d);
        c[d] = this.getCurCase(d).toMins(a);
        return c[0] < c[1]
    }, this.curTrain = function (a) {
        return this.cases[a][this.cur[a]]
    };
    this.sortVal = function (a) {
        if (a == "time0") {
            return CvtDT(this.getCurCase(0), 0)
        }
        if (a == "time1") {
            return CvtDT(this.getCurCase(1), 1)
        }
        return this[a]
    };
    this.haveCat = function (a) {
        return this.getCurCase(0).haveCat(a) && this.getCurCase(1).haveCat(a)
    };
    this.minCost = function (a) {
        return this.getCurCase(0).minCost(a) + this.getCurCase(1).minCost(a)
    };
    this.setCurSel = function (a, b) {
        this.cur[a] = b;
        this.updateTimes()
    }, this.getCurCase = function (a) {
        return this.cases[a][this.cur[a]]
    };
    this.chkCarMap = function (a) {
        return this.getCurCase(0).chkCarMap(a) && this.getCurCase(1).chkCarMap(a)
    };
    this.mkDef = function (a, b) {
        return this.getCurCase(0).mkDef(a, b) + this.getCurCase(1).mkDef(a, b + 1)
    };
    this.buildRes = function (b, d) {
        for (var c = 0; c < 2; c++) {
            if (!this.selFl[c] || !this.getCurCase(c).canSelect()) {
                continue
            }
            this.getCurCase(c).buildRes(b, d);
            var a = c ^ 1;
            d[d.length - 1]["code" + a] = this.midCode
        }
    };
    this.canSelect = function () {
        var a, b = false;
        for (a = 0; a < 2; a++) {
            b = b || (this.selFl[a] && this.getCurCase(a).canSelect())
        }
        return b
    };
    this.getProps = function (f, b) {
        var e = this.curTrain(0),
            c = this.curTrain(1);
        var a = ("transTime" in this) && this.transTime != 0;
        return $.extend(this, {
            Dir: f,
            Index: b,
            midPt: capitalize(this.midPt),
            type0: e.type,
            type1: c.type,
            typeLbl0: TrTypeName(e),
            typeLbl1: TrTypeName(c),
            number0: e.number2,
            number1: c.number2,
            from: e.station0,
            where: c.station1,
            time0: e.time0,
            time1: c.time1,
            date0: e.date0,
            date1: c.date1,
            nb_date0: HTR.bBase ? "" : e.date0,
            nb_date1: HTR.bBase ? "" : c.date1,
            delay: this.delay,
            timeInWay: this.timeInWay,
            TransTime: a ? lang("Transition Time: [T]", {
                T: this.transTime
            }) : "",
            TransComm: ((a && ("transComm" in this)) ? this.transComm : "")
        })
    }
}

function TrTypeName(a) {
    return Lang.TrainTypeN[a.type] + a.number2
}

function TrainPanel() {
    this.state = "?";
    this.sel = -1;
    this.list = [];
    this.from = "", this.where = "", this.date = null, this.sortMode = "unsorted";
    this.midLst = {};
    this.carsf = MagicCarsf;
    this.flCost = true;
    this.update = function (b) {
        if (this.state == "Transfers") {
            for (var c in this.list) {
                this.midLst[this.list[c].midPt] = 1
            }
        }
        var c, a = {}, d;
        for (c in this.list) {
            d = this.list[c];
            d.checkSt(b, a);
            if ("cars" in d) {
                this.flCost = this.flCost || d.cars.length != 0
            }
        }
        HTR.flCost[b] = this.flCost
    };
    this.resort = function () {
        var c = this.sortMode;
        if (HT.ID(c) == "cost") {
            var b, a = -2 * HT.Ndx(c) + 1;
            for (b in this.list) {
                this.list[b]["cost"] = a * this.list[b].minCost(this.carsf)
            }
            this.list.sort(function (e, d) {
                if (e.cost == 0 && d.cost == 0) {
                    return 0
                }
                if (e.cost == 0) {
                    return 1
                }
                if (d.cost == 0) {
                    return -1
                }
                if (e.cost < d.cost) {
                    return -1
                }
                if (e.cost > d.cost) {
                    return 1
                }
                return 0
            })
        } else {
            this.list.sort(function (f, e) {
                var d = f.sortVal(c),
                    g = e.sortVal(c);
                if (d < g) {
                    return -1
                }
                if (d > g) {
                    return 1
                }
                return 0
            })
        }
    };
    this.trace = function () {
        if (this.state == "?") {
            return lang("Net dannyh")
        }
        var b = Lang.Prompt.Departure + ": " + this.from + ", " + Lang.Prompt.Arrival + ": " + this.where + "<table>";
        for (var a in this.list) {
            if ("trace" in this.list[a]) {
                b += this.list[a].trace()
            }
        }
        b += "</table>";
        return b
    }
};