var SuggesterURL = "/suggester";
var HT = {
    tfl: 3,
    dir: 0,
    checkSeats: true,
    buy: false,
    name: ["", ""],
    code: [0, 0, 0, 0],
    tint: [
        [0, -1],
        [0, -1],
        [0, -1]
    ],
    date: [new TicketDate().now(), new TicketDate().now().incr()],
    tp: [],
    log: false,
    errFl: false,
    errMsg: [],
    flRun: false,
    lang: "ru",
    base: -1,
    canRun: false,
    Ndx: function (a) {
        return parseInt(a.charAt(a.length - 1))
    },
    ID: function (a) {
        return a.substring(0, a.length - 1)
    },
    Val: function (d, a) {
        var c = HT.ID(d),
            b = HT.Ndx(d);
        if (a !== undefined) {
            HT[c][b] = a
        }
        return HT[c][b]
    },
    Ctlv: function (e, d, a) {
        var b = $("#" + e + d);
        if (a === true) {
            b.val(HT[e][d])
        } else {
            if (a !== undefined) {
                b.val(a)
            }
        }
        return b.val()
    },
    toCtrls: function () {
        for (var a = 0; a < 2; a++) {
            HT.Ctlv("name", a, HT.name[a]);
            HT.Ctlv("date", a, HT.date[a].toString("DOW"))
        }
    },
    isTrains: function (a) {
        return HT.tp.length > a
    },
    isSelOk: function () {
        var a = 0,
            b = false;
        while (!b && a < this.tp.length) {
            b = b || this.tp[a++].sel >= 0
        }
        return b
    },
    clear: function () {
        this.tp = []
    },
    createObj: function (a) {
        if (a == "Trains") {
            return new Train()
        }
        if (a == "Transfers") {
            return new Transfer()
        }
        return {}
    },
    makeDir: function (d, a) {
        var b, c = $.extend(new TrainPanel(), d.tp[a]);
        c.date = new TicketDate(c.date);
        HTR.is6Only[a] = c.list.length > 0;
        for (b in c.list) {
            c.list[b] = $.extend(this.createObj(c.state), c.list[b]).update(a)
        }
        c.update(a);
        return c
    },
    fromJSON: function (c, b) {
        if (b !== undefined) {
            if ("tp" in c) {
                this.tp[b] = this.makeDir(c, 0)
            }
        } else {
            this.tp.length = 0;
            for (var a in c.tp) {
                this.tp.push(this.makeDir(c, a))
            }
        }
    },
    lessDate: function (b) {
        var a = new TicketDate().now();
        a.decr();
        return this.buy && b.less(a)
    },
    bErrTr: false,
    checkAll: function () {
        HT.errMsg.length = 0;
        HT.bErrTr = true;
        var b, h, a, g = new TicketDate(),
            e;
        for (b = 0; b < 2; b++) {
            if (!this.code[b]) {
                this.errMsg.push("st" + b)
            }
        }
        for (b = 0; b <= HT.dir; b++) {
            h = HT.Ctlv("date", b).split(",")[0];
            if (!g.parse(h)) {
                this.errMsg.push("dt" + b)
            } else {
                if (this.lessDate(g)) {
                    this.errMsg.push("past")
                } else {
                    if (b == 0) {
                        e = g.clone()
                    } else {
                        if (e && g.less(e)) {
                            this.errMsg.push("past2")
                        }
                    }
                }
            }
        }
        this.checkExt();
        var f = HT.errMsg.length > 0;
        updateTypes();
        $("#Submit,#Submit1").toggleClass("disabled", f)
    },
    checkExt: function () {},
    setRunFlag: function () {
        this.flRun = this.canRun && this.code[0] != 0 && this.code[1] != 0
    }
};

function ErrLoc(a) {
    return lang("HTErr_" + a)
}
var deltaT = 1;
var g_bInit = 0;

function initPg(f) {
    g_bInit++;
    try {
        if (!f && Modernizr.localstorage && sessionStorage.LoyalAuth) {
            sessionStorage.removeItem("LoyalAuth")
        }
        $("#XMax").hide();
        var c, d = "";
        readParams();
        $("#FarTrains").change(toggleFar);
        $("#SubTrains").change(toggleSub);
        var b = HT.base;
        updateTypes();
        HT.base = b;
        for (c = 0; c < 2; c++) {
            $("#Dir" + c).click(toggleDir)
        }
        $("#DirToggle").click(toggleDir);
        updateDir();
        $("#Submit,#Submit1").click(function () {
            if (HT.errMsg.length == 0) {
                Sug2.updateRecents();
                onSubmit()
            }
            return false
        });
        $("#Submit,#Submit1").mouseover(showSubmitTips).mouseout(hideSubmitTips);
        fillForm();
        $("#date0,#date1").focus(function () {
            this.value = HT.date[HT.Ndx(this.id)].toString()
        }).blur(function () {
            updateDate(HT.Ndx(this.id))
        }).keyup(onDateKeyUp).change(onDateChange);
        fillTimeLine();
        $(".date-arrow").mouseover(function () {
            if (!$(this).hasClass("gray")) {
                $(this).addClass("hover").removeClass("press")
            }
        }).mouseout(function () {
            if (!$(this).hasClass("gray")) {
                $(this).removeClass("hover").removeClass("press")
            }
        }).mousedown(function () {
            if (!$(this).hasClass("gray")) {
                $(this).addClass("press").removeClass("hover")
            }
        }).mouseup(function () {
            if (!$(this).hasClass("gray")) {
                $(this).addClass("hover").removeClass("press")
            }
        });
        $("#NoSeats").click(function () {
            HT.checkSeats = this.checked;
            updateTypes();
            for (var e = 0; e < 2; e++) {
                updateDate(e)
            }
            HT.checkAll()
        });
        Sug2.requestURL = SuggesterURL;
        Sug2.minChars = 2;
        var a = lang(["SHistPass", "Fwd"]);
        Sug2.bind({
            input: "#name0",
            recentID: "MainPassFwd",
            recentElem: "#shist0",
            onStation: function (e) {
                $("#name0").data("code", e);
                onStation("name0")
            },
            defaultRecent: a
        });
        Sug2.bind({
            input: "#name1",
            recentID: "MainPassBack",
            recentElem: "#shist1",
            onStation: function (e) {
                $("#name1").data("code", e);
                onStation("name1")
            },
            defaultRecent: lang(["SHistPass", "Back"])
        });
        $(".sh_calendar").click(toggleCalendarHT);
        if (HT.base == 0) {
            $("#base-s0").prop("checked", true)
        }
        if (HT.base == 10) {
            $("#base-s10").prop("checked", true)
        }
        $("#base-s0,#base-s10").change(function () {
            if ($(this).prop("checked")) {
                var e = +this.id.substring(6) ^ 10;
                $("#base-s" + e).prop("checked", false)
            }
            updateTypes()
        });
        setPlaceholders();
        regPopstate();
        HT.setRunFlag();
        if (HT.flRun) {
            onSubmit()
        }
    } catch (g) {
        showError(g)
    }
    g_bInit--
}

function initLoyalTrains() {
    HT.canRun = true;
    HT.tfl = 1;
    HT.buy = true;
    shist_suffix = "_Lhist";
    servURL = pgAddr.Trains;
    checkJSON();
    var r = "localStorage" in window && "sessionStorage" in window;
    var d;

    function s() {
        d = {
            sessionId: null,
            balance: "",
            userName: "",
            pass: ""
        }
    }
    s();
    var a = "LoyalAuth";

    function h() {
        return !!d.sessionId
    }

    function c(v, w) {
        var u = v == 1 ? sessionStorage : localStorage;
        if (!w) {
            return u[a]
        }
        u[a] = w
    }

    function b(u) {
        return !!c(u)
    }

    function f(w, x) {
        var v, u;
        if (w == 0) {
            v = d
        } else {
            v = JSON.parse(c(w))
        } if (x == 0) {
            d = v
        } else {
            c(x, JSON.stringify(v))
        }
    }

    function e(A, B, y) {
        var v, x, z, u = A.split(",");

        function w(C, D) {
            if (C == "balance") {
                return sliceString(D, 3, "&nbsp;")
            }
            return D
        }
        for (v in u) {
            z = u[v];
            switch (B) {
            case "v<":
                $("#loy-" + z).val(d[z]);
                break;
            case "v>":
                d[z] = $("#loy-" + z).val();
                break;
            case "t":
                $("#loyal-" + z).html(w(z, d[z]));
                break;
            case "<":
                d[z] = y[z];
                break;
            case ">":
                y[z] = d[z];
                break;
            case "#>":
                x = $("#loy-" + z);
                y[x.attr("name")] = d[z] = x.val();
                break
            }
        }
    }

    function n(u) {}

    function k() {
        if (!r) {
            return
        }
        f(0, 1);
        if ($("#rememberLoyal").prop("checked")) {
            f(0, 2)
        }
    }
    if (!r) {
        $("#loyal-mem-box").hide();
        n("Не поддерживается память сессии");
        n("JSON in window: " + ("JSON" in window));
        n("sessionStorage in window: " + ("sessionStorage" in window));
        n("localStorage in window: " + ("localStorage" in window))
    } else {
        if (b(1)) {
            f(1, 0);
            n("Сеанс восстановлен из сессии")
        } else {
            if (b(2)) {
                f(2, 0);
                f(0, 1);
                $("#rememberLoyal").prop("checked", true);
                n("Сеанс восстановлен из хранилища")
            } else {
                n("Требуется авторизация. isAuth: " + h())
            }
        }
    }

    function j(v, u) {
        if (pgAddr && pgAddr[u]) {
            v[u] = pgAddr[u]
        }
    }
    HT.checkExt = function () {
        if (h()) {
            return
        }
        if (d.userName == "") {
            HT.errMsg.push("userName")
        }
        if (d.pass == "") {
            HT.errMsg.push("pass")
        }
    };

    function t() {
        HT.checkAll()
    }

    function p() {
        var u = this.id.split("-");
        e(u[1], "v>");
        t()
    }
    $("#loy-userName,#loy-pass").keyup(p).change(p);

    function o() {
        var u = h();
        $(".lautho-none").toggle(!u);
        $(".lautho-ok").toggle(u);
        if (u) {
            e("userName,balance", "t")
        }
    }
    $("#logoutLoyal").click(q);

    function q() {
        s();
        if (r) {
            sessionStorage.removeItem(a);
            localStorage.removeItem(a)
        }
        $("#Part0").empty();
        e("userName,pass", "v<");
        $("#continueButtonDiv").hide();
        $("#rememberLoyal").prop(false);
        o();
        t();
        return false
    }
    $("#resetLoyal").click(function () {
        g(function () {
            $("#Part0").html(applyTempl("TmResetFinished", {}))
        });
        return false
    });

    function l() {
        g_specParams = g_specParams || {};
        g_specParams.loyaltySession = d.sessionId
    }
    mainDraw = function (u) {
        if (!h()) {
            return
        }
        l();
        stdMainDraw(u)
    };

    function g(w) {
        $("#Part0").html(applyTempl("TmAuthoWait", {}));
        enableElem("#Submit", false);
        var v = new AsyncRequest(pgAddr.Authorization);
        var u = "userName,pass",
            x = {};
        e(u, "#>", x);
        j(x, "log");
        j(x, "err");
        v.request(x, function (y) {
            e("sessionId,balance", "<", y);
            k();
            l();
            if (w) {
                w(y)
            }
        }, function (z, y) {
            renderErrMsg($.extend({
                message: z
            }, y))
        }, function () {
            o();
            enableElem("#Submit", true);
            t()
        })
    }
    onResponse = function (x, v, u, w) {
        if (x.result == "expired") {
            g(function (y) {
                onSubmit()
            })
        } else {
            onResponseStd(x, v, u, w)
        }
    };
    onSubmit = function (u) {
        if (!h()) {
            t();
            if ($("#Submit").hasClass("disabled")) {
                return false
            }
            g(function () {
                onSubmitStd(u)
            });
            return false
        }
        l();
        return onSubmitStd(u)
    };
    doNext = function (x) {
        checkJSON();
        var z = x[0],
            B = {};
        B.trains = [{
            dir: 0,
            st0: HTR.name[0],
            st1: HTR.name[1],
            dt0: HTR.date[0].toString(),
            time0: z.time0,
            code0: HTR.code[0],
            code1: HTR.code[1],
            tnum: z.number
        }];
        B.loyCars = z.cars;
        B.loyInfo = {
            distance: z.distance,
            trDate0: z.trDate0
        };
        var w = JSON.stringify(B),
            A = pgAddr.CarsPg,
            y, u = {};
        sessionStorage.Travel = w;
        paramErrLog(u);
        for (y in u) {
            A += "&" + y + "=" + encodeURIComponent(u[y])
        }
        location.href = A
    };
    e("userName,pass", "v<");
    o();
    initPg(true);
    var m = $("#Part0").find("input:radio");
    if (m.length == 1) {
        m.attr("disabled", "disabled")
    }
}

function fillForm() {
    var a = HT.base;
    $("#FarTrains").attr("checked", !! (HT.tfl & 1));
    $("#SubTrains").attr("checked", !! (HT.tfl & 2));
    for (i = 0; i < 2; i++) {
        $("#Dir" + i).attr("checked", HT.dir == i);
        updateDate(i)
    }
    $("#DirToggle").attr("checked", HT.dir == 1);
    updateDir();
    HT.base = a;
    $("#base-s0").attr("checked", a == 0);
    $("#base-s10").attr("checked", a == 10);
    $("#base-s-box").toggle(a >= 0);
    $("#NoSeats").prop("checked", HT.checkSeats);
    HT.toCtrls()
}

function regPopstate() {
    if (HT.canRun && ("addEventListener" in window)) {
        window.addEventListener("popstate", function (a) {
            readParams();
            fillForm();
            mainDraw({})
        })
    }
}
var bFillTL = false;

function fillTimeLine() {
    if (bFillTL) {
        return
    }
    bFillTL = true;
    var a, b = "";
    for (a = 0; a <= 24; a += deltaT) {
        b += "<li><span>" + a + "</span></li>"
    }
    $(".time-line").html(b);
    $(".time-line").each(function () {
        updateTimeLine(this)
    });
    $(".time-line li").click(onTimeSeg);
    $("a.sh_hours").click(showTime);
    $('<div class="calen-cont"></div>').insertAfter(".sh_calendar,.calendar_pass")
}

function onStation(c) {
    var e = HT.Ndx(c),
        f = HT.ID(c);
    if (f != "name") {
        return
    }
    var a = $("#" + c),
        b = a.data("code");
    HT.name[e] = a.val();
    if (!b) {
        if (a.attr("placeholder") === HT.name[e]) {
            HT.name[e] = ""
        }
        HT.code[e] = 0
    } else {
        HT.code[e] = +b
    } if ((e | 1) == 1) {
        HT.checkAll()
    } else {
        if ((e | 1) == 3) {
            Tablo.update()
        }
    }
}

function isEmptyFld(b) {
    var a = $(b).val();
    return a == "" || a == $(b).attr("placeholder")
}

function erx(d, b) {
    var a = $(d).val();
    var c = (a == "" || a == $(d).attr("placeholder")) ? b : "x" + b;
    return lang("HTErr_" + c)
}
var Tablo = {
    errMsg: [],
    init: function (c) {
        var b, a = location.search.substring(1).split("&");
        if (c) {
            Sug2.requestURL = SuggesterURL;
            Sug2.minChars = 2;
            for (b in a) {
                if (a[b].indexOf("ti=") == 0) {
                    setTInt(2, a[b].substring(3));
                    break
                }
            }
            fillTimeLine()
        }
        Sug2.bind({
            input: "#name2",
            onStation: function (g) {
                $("#name2").data("code", g);
                onStation("name2")
            }
        });
        Sug2.bind({
            input: "#name3",
            onStation: function (g) {
                $("#name3").data("code", g);
                onStation("name3")
            }
        });
        var f = new TicketDate().now();

        function d(j) {
            var h = this.value.length == 0 || this.value.match(/^[-\./\d]+$/);
            if (!h) {
                var g = $(this).data("lastOk");
                if (g === undefined) {
                    g = ""
                }
                this.value = g;
                return
            }
            $(this).data("lastOk", this.value);
            Tablo.update()
        }
        $("#dateTablo0,#dateTablo1").val("").keyup(d).change(d).focus(function () {
            if (f.parse(this.value.split(",")[0])) {
                this.value = f.toString()
            }
        }).blur(function () {
            if (f.parse(this.value)) {
                this.value = f.toString("DOW")
            }
        }).nextAll(".calendar_pass").click(toggleCalendarTbl);
        setPlaceholders();

        function e(g) {
            Tablo.date[HT.Ndx(g.id)].parse(g.value.split(",")[0]);
            Tablo.update()
        }
        $("#dateTablo0").parent().find(".left").click(function () {
            stepDowDate("dateTablo0", -1, e)
        }).end().find(".right").click(function () {
            stepDowDate("dateTablo0", 1, e)
        });
        $("#dateTablo1").parent().find(".left").click(function () {
            stepDowDate("dateTablo1", -1, e)
        }).end().find(".right").click(function () {
            stepDowDate("dateTablo1", 1, e)
        });
        b = 0;
        while (b < a.length && a[b].indexOf("date_arr=") != 0) {
            b++
        }
        if (b < a.length) {
            this.date[1].parse(a[b].split("=")[1])
        }
        if (!this.date[1].isOk()) {
            this.date[1].now()
        }
        $("#dateTablo1").val(this.date[1].toString("DOW"));
        b = 0;
        while (b < a.length && a[b].indexOf("date_dep=") != 0) {
            b++
        }
        if (b < a.length) {
            this.date[0].parse(a[b].split("=")[1])
        }
        if (this.date[0].isOk()) {
            $("#dateTablo0").val(this.date[0].toString("DOW"))
        }
        $("#TabloSubmit").mouseover(showTabloTips).mouseout(hideSubmitTips);
        $("#tablo_form").submit(function () {
            if (!$("#TabloSubmit").hasClass("disabled")) {
                $("input[name=src_code]", this).val(HT.code[2]);

                function h(k) {
                    var j = $(k);
                    if (j.val() == j.attr("placeholder")) {
                        j.val("")
                    }
                }
                h("#name2");
                h("#nTrain");
                $("input[name=dst_code]", this).val(HT.code[3]);
                $("#SubmitWaitTablo").show();
                $("input[name=ti]").val((HT.tint[2][0] < HT.tint[2][1]) ? HT.tint[2][0] + "-" + HT.tint[2][1] : "");
                var g;
                for (g = 0; g < 2; g++) {
                    $("#dateTablo" + g).val(Tablo.date[g].toString())
                }
                return true
            }
            return false
        });
        this.update();
        if (c) {
            setPlaceholders()
        }
    },
    date: [new TicketDate(), new TicketDate()],
    drawStars: function (d) {
        var c, a = d + 2;
        var b = true;
        if (HT.code[a] == 0) {
            this.errMsg.push(erx("#name" + a, "st" + d));
            b = false
        }
        if (!this.date[d].isOk()) {
            this.errMsg.push(erx("#dateTablo" + d, "DT" + d));
            b = false
        }
        return b
    },
    SupSt: {
        "2000000": 1,
        "2004000": 1
    },
    update: function () {
        this.errMsg = [];
        var f = true;
        var d, j, c, a, e = [];
        for (d = 0; d < 2; d++) {
            e.push($("#dateTablo" + d).val());
            j = e[d].split(",")[0];
            if (!this.date[d].parse(j)) {
                this.date[d] = new TicketDate()
            } else {
                c = Tablo.DateRange[d];
                if (!dateInRange(this.date[d], c[0], c[1])) {
                    this.errMsg.push(lang("Date" + d + " must be in the range [A]..[B]", {
                        A: c[0],
                        B: c[1]
                    }));
                    f = false
                }
            }
        }
        var b = (e[0].length != 0 && e[0] != $("#dateTablo0").attr("placeholder")) ? 0 : 1;
        f = f && this.drawStars(1);
        if (!isEmptyFld("#name2") && HT.code[2] == 0) {
            f = false;
            this.errMsg.push(lang("HTErr_xst0"))
        }
        if (this.date[0].isOk() && this.date[1].isOk() && this.date[1].less(this.date[0])) {
            f = false;
            this.errMsg.push(lang("HTErr_past3"))
        }

        function g(k) {
            if ((HT.code[2 + k] in Tablo.SupSt) && HT.code[2 + k ^ 1] == 0) {
                return HT.name[2 + k]
            }
            return false
        }
        var h = g(0) || g(1);
        if (h) {
            f = false;
            this.errMsg.push(lang("HTErr_Cant select [S] superstation", {
                S: h
            }))
        }
        $("#TabloSubmit").toggleClass("disabled", !f);
        $("#SubmitWaitTablo").hide()
    },
    DateRange: [
        [-7, 7],
        [-1, 7]
    ]
};

function dateInRange(e, d, c) {
    var f = new TicketDate().now();
    f.addDays(d);
    if (e.less(f)) {
        return false
    }
    f = new TicketDate().now();
    f.addDays(c);
    return e.less(f)
}
var sugFocus = ["name0", "name2"];

function openTabs(b, a) {
    sugFocus[b ^ 1] = Sug.lastFocusID;
    return changePassTab(a)
}

function changePassTab(b, d) {
    var c = $(b).parent().attr("id");
    $("#" + c).find("li").each(function () {
        $(this).removeClass("current");
        $(this).removeClass("sel");
        $("#" + a).addClass("nosel");
        var e = $(this).attr("id");
        $("#" + e + "_Output").hide()
    });
    var a = $(b).attr("id");
    $(this).removeClass("nosel");
    $("#" + a).addClass("current");
    $("#" + a).addClass("sel");
    $("#" + a + "_Output").show();
    Sug.lastFocusID = sugFocus[d];
    Sug.aflags = d == 0 ? HT.tfl : 1
}

function newSetText(h) {
    this.oldSetText(h);
    var b, c = false,
        g = HT.Ndx(h);
    var a = HT.Val(h, HT.Ctlv("name", g));
    var e = Sug.cvtRus(a);
    var d = Sug.findStDir(e);
    if (d >= 0) {
        c = Sug.stations[d].id;
        HT.Ctlv("name", g, Sug.stations[d].name)
    }
    if (!c) {
        c = '<span class="red">' + Lang.Errors["Station is undefined"] + "</span>";
        HT.code[g] = 0
    } else {
        HT.code[g] = parseInt(c)
    }
    $("#st_status" + g).html(c);
    if (g & 2) {
        Tablo.update()
    } else {
        HT.checkAll()
    }
}

function cvt1251(a) {
    var b = parseInt(a, 16);
    if (b == 168) {
        return "Ё"
    }
    if (b == 184) {
        return "ё"
    }
    if (b >= 192) {
        return String.fromCharCode(b - 192 + 1040)
    }
    return " "
}

function decodeURIComponenentExt(b) {
    var g = "";
    try {
        g = decodeURIComponent(b)
    } catch (f) {
        var j, a = 0,
            h = b.length;
        while (a < h) {
            j = b.charAt(a++);
            if (j != "%") {
                g += j
            } else {
                g += cvt1251(b.substring(a, a + 2));
                a += 2
            }
        }
    }
    return g
}

function readParams() {
    HT.log = false;
    HT.errFl = false;
    HT.checkSeats = true;
    HT.base = -1;
    if (location.hash.charAt(0) == "#") {
        var b = location.hash.substring(1).split("|");
        for (var a in b) {
            var c = b[a].split("=");
            var d = c[0].toLowerCase();
            if (d == "tfl" || d == "dir") {
                HT[d] = parseInt(c[1])
            } else {
                if (c[0] == "checkSeats") {
                    HT.checkSeats = c[1] != "0"
                } else {
                    if (HT.ID(d) == "st") {
                        HT.name[HT.Ndx(d)] = decodeURIComponenentExt(c[1])
                    } else {
                        if (HT.ID(d) == "dt") {
                            HT.date[HT.Ndx(d)].parse(c[1])
                        } else {
                            if (HT.ID(d) == "ti") {
                                setTInt(HT.Ndx(d), c[1])
                            } else {
                                if (HT.ID(d) == "code") {
                                    HT.code[HT.Ndx(d)] = parseInt(c[1])
                                } else {
                                    if (d == "base") {
                                        HT.base = +c[1]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (location.search.charAt(0) == "?") {
        var b = location.search.substring(1).split("&");
        for (var a in b) {
            var c = b[a].split("=");
            var d = c[0].toLowerCase();
            if (d == "log") {
                HT.log = c[1]
            } else {
                if (d == "err") {
                    HT.errFl = d
                }
            }
        }
    }
}

function buildParams() {
    var b = {};
    b.dir = HT.dir;
    b.tfl = HT.tfl;
    b.checkSeats = HT.checkSeats ? 1 : 0;
    if (!HT.buy) {
        b.withoutSeats = "y"
    }
    if (HT.base >= 0) {
        b.base = HT.base
    }
    for (var a = 0; a < 2; a++) {
        if (HT.name[a]) {
            b["st" + a] = HT.name[a]
        }
        if (HT.code[a]) {
            b["code" + a] = HT.code[a]
        }
        if (HT.date[a].isOk()) {
            b["dt" + a] = HT.date[a].toString()
        }
        if (HT.tint[a][0] < HT.tint[a][1]) {
            b["ti" + a] = HT.tint[a][0] + "-" + HT.tint[a][1]
        }
    }
    if (HT.log) {
        b.log = HT.log
    }
    if (HT.errFl) {
        b.nopack = 1
    }
    if (HT.errFl) {
        b.err = HT.errFl
    }
    return b
}
var AnchLst = {
    tfl: 1,
    dir: 1,
    checkSeats: 1,
    withoutSeats: 1,
    base: 1,
    "st#": 1,
    "dt#": 1,
    "ti#": 1,
    "code#": 1
};

function mkAnchor(h) {
    var g = [
        [],
        []
    ],
        f, e, c, b = "";
    for (e in h) {
        f = e.replace(/(0|1)/, "#");
        c = (f in AnchLst) ? 1 : 0;
        g[c].push(e + "=" + encodeURIComponent(h[e]))
    }
    for (e in g[0]) {
        b += "&" + g[0][e]
    }
    b += "#" + g[1].join("|");
    return b
}

function anchorOnly(b) {
    if (!b) {
        b = mkAnchor(buildParams())
    }
    return b.substring(b.indexOf("#"))
}

function mkGetParams(e) {
    var d, b = "",
        c = "";
    for (d in e) {
        c += b + d + "=" + encodeURIComponent(e[d]);
        b = "&"
    }
    return c
}

function packArr2(e, d, c) {
    var a, b = "";
    for (a in e) {
        b += e[a].join(c) + d
    }
    return b.substring(0, b.length - d.length)
}

function setTInt(d, c) {
    if (!c) {
        HT.tint[d] = [0, -1]
    } else {
        var a = c.split("-");
        for (var b = 0; b < 2; b++) {
            HT.tint[d][b] = parseInt(a[b])
        }
    }
}

function xchgStations() {
    HT.name = [HT.name[1], HT.name[0]];
    HT.code = [HT.code[1], HT.code[0]];
    var a, b;
    for (b = 0; b < 2; b++) {
        $("#name" + b).val(HT.name[b]).data("code", HT.code[b])
    }
}

function toggleFar() {
    if ((HT.tfl ^= 1) == 0) {
        HT.tfl = 2;
        $("#SubTrains").attr("checked", true)
    }
    updateTypes()
}

function toggleSub() {
    if ((HT.tfl ^= 2) == 0) {
        HT.tfl = 1;
        $("#FarTrains").attr("checked", true)
    }
    updateTypes()
}

function sellTime() {
    if (stCountry(HT.code[1]) == 10) {
        return 60
    }
    return 45
}
var SNGCodes = {
    "26": "Эст",
    "25": "Лат",
    "24": "Литва",
    "21": "Белоруссия",
    "22": "Украина",
    "23": "Молд",
    "57": "Айзер",
    "58": "Арм",
    "28": "Груз",
    "27": "Казах",
    "59": "Кирг",
    "29": "Узб",
    "66": "Тадж",
    "67": "Турк",
    "42": "Абх"
};

function isKalinRestriction(b) {
    var a, d = 0;
    for (a = 0; a < 2; a++) {
        if (Math.floor(b.code[a] / 1000 + 0.1) == 2058) {
            d |= 1 << a
        }
    }
    if (d == 0 || d == 3) {
        return false
    }
    var e = stCountry(b.code[(d - 1) ^ 1]);
    if (e in SNGCodes) {
        return false
    }
    return true
}

function checkCountry(a) {
    return 2
}

function updateTypes() {
    Sug2.aflags = HT.tfl;
    var f = (HT.tfl & 1);
    var g = HT.tfl == 2;
    f = f && HT.code[0] != 0 && HT.code[1] != 0 && !isKalinRestriction(HT) && Math.min(checkCountry(HT.code[0]), checkCountry(HT.code[1])) != 0;
    if (f) {
        var b, d, h = Sug2.getStations();
        for (d = 0; f && d < 2; d++) {
            var c = h[HT.code[d]];
            if (c) {
                g = !c.L;
                f = !g;
                if (g) {
                    break
                }
            }
        }
    }
    HT.buy = f && HT.checkSeats;
    var e = $("#Submit1");
    if (e.length == 1) {
        $("#Submit").toggle( !! HT.buy);
        $("#Submit1").toggle(!HT.buy)
    }
    $("#NoSeatsBar").toggle(f != 0);
    if (g_bInit == 0) {
        HT.base = -1;
        if (g) {
            var a = $("input[id^=base-s]:checked");
            if (a.length == 1) {
                HT.base = +(a[0].id.substring(6))
            }
        }
        $("#base-s-box").toggle(g)
    }
    CalenHT.buyMode(HT.buy)
}

function toggleDir() {
    if (this.id == "DirToggle") {
        HT.dir ^= 1
    } else {
        HT.dir = HT.Ndx(this.id);
        $("#Dir" + HT.dir).attr("checked", true);
        var a = HT.dir ^ 1;
        $("#Dir" + a).attr("checked", false)
    }
    updateDir()
}

function updateDir() {
    $(".back-fld").toggleClass("disabled", HT.dir == 0);
    $("#DirToggle").toggleClass("backward", HT.dir);
    HT.checkAll()
}

function setStation(b, a) {
    HT.Ctlv("name", b, a);
    HT.name[b] = a;
    Sug.curStationID = "name" + b;
    Sug.locateCode(a, function (c) {
        HT.code[b] = c;
        HT.checkAll()
    })
}

function cvtUp(a) {
    if (!a) {
        return ""
    }
    return a.toUpperCase()
}

function fixStHist() {}

function setupDate(b, a) {
    HT.date[b] = new TicketDate().now();
    HT.date[b].addDays(a);
    updateDate(b)
}

function stepDate(b, a) {
    if ($("#date" + b).parents(".disabled").length > 0) {
        return
    }
    if (a < 0 && $("#date" + b).parent().find(".date-arrow.left").hasClass("disabled")) {
        return
    }
    HT.date[b].addDays(a);
    updateDate(b)
}

function bkDateRel(a) {
    if (!HT.date[0].isOk()) {
        return
    }
    HT.date[1] = HT.date[0].clone();
    HT.date[1].addDays(a);
    updateDate(1)
}

function updateDate(a) {
    var b;
    if (typeof (a) == "number") {
        b = a;
        $("#date" + a).val(HT.date[a].toString("DOW"))
    } else {
        b = HT.Ndx(a.id)
    }
    $("#date" + b).toggleClass("bad-date", !HT.date[b].isOk()).parent().find(".date-arrow.left").toggleClass("disabled", !HT.date[b].isOk() && HT.lessDate(HT.date[b]));
    HT.checkAll()
}

function onDateChange() {
    var a = new TicketDate();
    if (a.parse(this.value)) {
        HT.date[HT.Ndx(this.id)] = a;
        updateDate(this)
    } else {
        $(this).addClass("bad-date")
    }
}

function onDateKeyUp() {
    var a = new TicketDate();
    if (a.parse(this.value)) {
        updateDate(this)
    } else {
        $(this).addClass("bad-date")
    }
}
var actTDir = -1,
    actT = -1;
var lastHourBox = false;

function showTime() {
    var a = $(this).parents(".disabled");
    if (a.length != 0) {
        return
    }
    if (lastHourBox) {
        return hideTime()
    }
    lastHourBox = $(this).attr("href");
    $(lastHourBox).show();
    $("body").click(hideTime);
    return false
}

function hideTime() {
    if (lastHourBox) {
        $(lastHourBox).fadeOut(400);
        lastHourBox = false;
        $("body").unbind("click", hideTime)
    }
    return lastHourBox
}

function onTimeSeg(c) {
    var a = parseInt($(this).text());
    var f = $(this).parents(".time-line").attr("id");
    var e = parseInt(f.substring(2));
    if (actTDir < 0) {
        actTDir = e;
        actT = a
    } else {
        if (e == actTDir) {
            HT.tint[e] = (a == actT) ? [0, -1] : [Math.min(actT, a), Math.max(a, actT)];
            actTDir = -1
        } else {
            var b = "TL" + actTDir;
            actTDir = e;
            actT = a;
            updateTimeLine(document.getElementById(b))
        }
        hideTime()
    }
    updateTimeLine(document.getElementById(f));
    c.preventDefault();
    c.stopPropagation()
}

function clearTInterval(a) {
    HT.tint[a] = [0, -1];
    updateTimeLine(document.getElementById("TL" + a))
}

function updateTimeLine(b) {
    var c = HT.Ndx(b.id);
    $(b).find("li").each(function () {
        var e = parseInt($(this).text());
        var d = actTDir != c && e >= HT.tint[c][0] && e <= HT.tint[c][1];
        if (d) {
            $(this).addClass("time-seg-sel")
        } else {
            $(this).removeClass("time-seg-sel")
        } if (actTDir == c && actT == e) {
            $(this).addClass("time-seg-act")
        } else {
            $(this).removeClass("time-seg-act")
        }
    });
    var a = HT.tint[c];
    $("#TR" + c).html(a[0] > a[1] ? lang("Auto-Select Time") : lang("Interval [from] [to]", {
        from: a[0],
        to: a[1]
    }))
}
var g_formMode = "expand";

function formToggle(a) {
    if (a == g_formMode) {
        return
    }
    g_formMode = a;
    if (a == "expand") {
        $("#XMax").hide();
        $(".x1,#XMin").show()
    } else {
        $("#XMax").show();
        $(".x1,#XMin").hide()
    }
}
var submitLvl = 0;

function updateSubmit(c) {
    var a = submitLvl;
    submitLvl += c;
    if (submitLvl == 1 && a == 0) {
        $("#Submit,#Submit1").addClass("disabled");
        $("#SubmitWait").show();
        if (window.showWaitPanel) {
            for (var b = 0; b <= HT.dir; b++) {
                showWaitPanel(b)
            }
        }
    } else {
        if (submitLvl == 0 && a == 1) {
            $("#Submit,#Submit1").removeClass("disabled");
            $("#SubmitWait").hide()
        }
    }
}
var CalenHT = {
    mainID: "#ticketbuyforma_horizontalTwo",
    divID: "body",
    edID: "",
    dT: 0,
    foreCls: "foretime",
    toggle: function (a) {
        this.edID = false;
        this.parent_toggle(a);
        if (this.edID) {
            this.lastDir = HT.Ndx(this.edID)
        }
    },
    buyMode: function (a) {
        this.foreCls = a ? "foretime" : "select-time";
        this.dT = 0
    },
    parent_toggle: Calen_toggle,
    show: Calen_show,
    insMonths: Calen_insMonth,
    monthChange: Calen_monthChange,
    onSelect: function (c, b) {
        var a = calenDate(b);
        if (a.isOk()) {
            HT.date[this.lastDir] = a;
            $("#date" + this.lastDir).val(a.toString()).focus();
            HT.checkAll()
        }
    },
    deltaCheck: function () {
        var a = sellTime();
        if (a != this.dT) {
            this.dT = a;
            return true
        }
        return false
    },
    lastDir: 0
};

function calenDate(c) {
    var b = new TicketDate();
    var a = $.trim($(c).parents(".month").find(".month_info").text());
    if (!b.parse(a)) {
        alert("Invalid date: " + a)
    } else {
        b.day = parseInt($(c).text(), 10)
    }
    return b
}
$(function () {
    $('<div id="Test-C" style="display:none; position:absolute; width:600px; height:150px; background-color:#FF0; border:1px solid #000; z-index:800;"></div>').appendTo("body");
    $(CalenHT.mainID).appendTo(CalenHT.divID)
});

function Calen_toggle(e) {
    var a = $(e).parents(".disabled");
    if (a.length != 0) {
        return
    }
    var h = $(e).parent();
    for (;;) {
        if (h.length == 0) {
            return
        }
        if (this.edID = h.find(":text").attr("id")) {
            break
        }
        h = h.parent()
    }
    var g = $(this.mainID).css("display");
    var f = g == "none";
    this.show(f, e);
    if (f) {
        var b = $(e).next();
        var c = b.offset();
        var j = c.top + $(e).height();
        var k = Math.max(0, c.left - 300);
        $(this.mainID).css("top", j).css("left", k)
    }
}

function Calen_show(a, c) {
    var d;
    if (a) {
        $(this.mainID).appendTo(this.divID)
    }
    if (this.deltaCheck()) {
        $(this.mainID + " .months_wrap").empty();
        this.insMonths(null, 3, "append");
        d = this;
        $(this.mainID + " .prev-month").click(function (f) {
            d.monthChange(f, -1)
        });
        $(this.mainID + " .next-month").click(function (f) {
            d.monthChange(f, 1)
        })
    }
    d = this;

    function b() {
        d.show(false)
    }
    if (a) {
        $(d.mainID).fadeIn(50, function () {
            $(document).click(b)
        })
    } else {
        $(document).unbind("click");
        $(d.mainID).fadeOut(50, function () {
            $(this).hide()
        })
    }
}

function Calen_insMonth(b, o, m) {
    var g, f, c, p, e = new TicketDate().now(),
        k = -this.dT,
        d = this.edID;
    if (d) {
        d = $("#" + d).val()
    }
    if (d) {
        d = d.split(",")[0];
        d = new TicketDate(d);
        if (!d.isOk()) {
            d = 0
        }
    }
    if (b == null) {
        b = e.clone();
        b.day = 1
    }
    var r = b.dayOfWeek(),
        q = b.calcDaysBetween(e) + 1;
    for (g = 0; g < o; g++) {
        var a = "",
            l = TDATE.MonthLen(b.month, b.year);
        for (f = 0; f < 7; f++) {
            a += '<li class="week-days';
            if (f == 6) {
                a += " seventh"
            } else {
                if (f == 5) {
                    a += " sixth"
                }
            }
            a += '"><span>' + lang(["WeekDaysShort", f]) + "</span></li>"
        }
        for (f = 0; f < r; f++) {
            a += '<li><span class="foretime"></span></li>'
        }
        for (c = 1; c <= l; c++) {
            a += "<li";
            ++r;
            if (r == 6) {
                a += ' class="sixth"'
            }
            if (r == 7) {
                r = 0;
                a += ' class="seventh"'
            }
            a += '><span class="';
            if (--q > 0) {
                a += this.foreCls
            } else {
                a += "select-time";
                if (q == 0) {
                    a += " current"
                } else {
                    if (q > k) {
                        a += " near-time"
                    }
                }
            } if (d && d.year == b.year && d.month == b.month && d.day == c) {
                a += " selected"
            }
            a += '">' + c + "</span></li>"
        }
        $(this.mainID + " .months_wrap")[m](applyTempl("MonthTempl", {
            monthNum: b.toString(true),
            monthName: b.monthName(),
            Days: a
        }));
        b.nextMonth(1)
    }
    var h = this;
    $(".select-time").click(function (j) {
        h.onSelect(j, this)
    });
    this.dT = 0
}

function Tablo_insMonth(c, p, o) {
    var h = HT.Ndx(this.edID);
    var f, g, e = new TicketDate().now(),
        b = Tablo.DateRange[h];
    if (c == null) {
        c = e.clone();
        c.day = 1
    }
    for (g = 0; g < p; g++) {
        var s = c.dayOfWeek(),
            a = "";
        for (f = 0; f < s; f++) {
            a += '<li><span class="foretime"></span></li>'
        }
        var d = 1,
            m = TDATE.MonthLen(c.month, c.year);
        for (; d <= m; d++) {
            var q = [],
                l = c.clone();
            l.day = d;
            a += "<li";
            if (++s == 7) {
                dw = 0;
                a += ' class="seventh"'
            }
            if (dateInRange(l, b[0], b[1])) {
                q.push("select-time", "near-time")
            }
            if (l.equals(e)) {
                q.push("current")
            }
            a += '><span class="' + q.join(" ") + '">' + d + "</span></li>"
        }
        $(this.mainID + " .months_wrap")[o](applyTempl("MonthTempl", {
            monthNum: c.toString(true),
            monthName: c.monthName(),
            Days: a
        }));
        c.nextMonth(1)
    }
    var k = this;
    $(".select-time").click(function (j) {
        k.onSelect(j, this)
    });
    this.dT = 0
}
var cscrollLock = 0;

function Calen_monthChange(f, e) {
    var b = 500;
    f.preventDefault();
    f.stopPropagation();
    if (cscrollLock != 0) {
        return
    }
    this.deltaCheck();
    var h = e > 0 ? {
        rem: ":first",
        ofs: 12,
        ins: ":last",
        fn: "append"
    } : {
        rem: ":last",
        ofs: -12,
        ins: ":first",
        fn: "prepend"
    };
    var d, c = $(this.mainID + " .month" + h.ins + " .month_info").text();
    if (!c) {
        return
    }
    d = new TicketDate(c);
    if (!d.isOk()) {
        return alert("Invalid date: " + d)
    }
    var g = new TicketDate().now();
    g.day = 1;
    g.nextMonth(h.ofs);
    if (g.equals(d)) {
        return
    }
    d.nextMonth(e);
    var a = $(this.mainID + " .month");
    cscrollLock++;
    a.filter(h.rem).animate({
        width: "hide"
    }, b, function () {
        $(this).remove();
        cscrollLock--
    });
    this.insMonths(d, 1, h.fn);
    $(this.mainID + " .month" + h.ins).animate({
        width: "hide"
    }, 0).animate({
        width: "show"
    }, b);
    return false
}

function toggleCalendarHT() {
    CalenHT.toggle(this)
}
var CalenTbl = {
    mainID: "#ticketbuyforma_horizontalTwo",
    divID: "body",
    edID: "",
    dT: 0,
    foreCls: "select-time",
    toggle: function (a) {
        this.edID = false;
        this.parent_toggle(a)
    },
    parent_toggle: Calen_toggle,
    show: Calen_show,
    insMonths: Tablo_insMonth,
    monthChange: Calen_monthChange,
    onSelect: function (c, b) {
        var a = calenDate(b);
        if (this.edID && a.isOk()) {
            $("#" + this.edID).val(a.toString("DOW"))
        }
        Tablo.update()
    },
    deltaCheck: function () {
        if (this.dT == 7) {
            return false
        }
        this.dT = 7;
        return true
    },
    dtId: ""
};

function toggleCalendarTbl() {
    CalenTbl.toggle(this)
}

function showSubmitTips() {
    if (HT.bErrTr) {
        for (var a in HT.errMsg) {
            HT.errMsg[a] = lang("HTErr_" + HT.errMsg[a])
        }
        HT.bErrTr = false
    }
    showErrTips(HT.errMsg, $("#Submit,#Submit1").filter(function () {
        return $(this).css("display") != "none"
    }))
}

function showTabloTips() {
    showErrTips(Tablo.errMsg, $("#TabloSubmit"))
}

function showErrTips(f, h) {
    if (f.length == 0) {
        return
    }
    var c, g = "",
        b, k;
    for (c in f) {
        k = htmlEscape(f[c]);
        b = applyTempl("RFSubmitMsgTempl", {
            msg: k
        });
        if (b == "") {
            b = "<div>" + k + "</div>"
        }
        g += b
    }
    k = applyTempl("RFSubmitTipTempl", {
        txt: g
    });
    if (k.length == 0) {
        k = '<div id="RFSubmitTip" style="position:absolute; padding:0.5em 1em; background-color:#FFE7E7; border:1px solid #D89898;z-index:120">' + g + "</div>"
    }
    var a = h.offset();
    var d = $(k).appendTo("body");
    var j = Math.max(a.left + h.width() - d.width(), 5);
    d.css("left", j).css("top", a.top + h.outerHeight() + 4)
}

function hideSubmitTips() {
    $("#RFSubmitTip").remove()
};