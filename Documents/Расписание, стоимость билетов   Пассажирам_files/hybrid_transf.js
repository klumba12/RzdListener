var servURL = TicketLinks.TrainList_JSON;
var g_frameRate = 1000;
var g_transferSearchMode = "AUTO";
var SlotsLim = 30;

function isTicketRoute(b, d) {
    var e = checkCountry(d.code[0]),
        c = checkCountry(d.code[1]);
    var a = Math.min(e, c);
    if (a == 1) {
        HTR.isFwdOnly |= 1
    } else {
        if (a == 0) {
            HTR.isFarCountry |= 1
        }
    } if (a - b <= 0) {
        return false
    }
    if (isKalinRestriction(d)) {
        HTR.isKalinRestriction |= 1;
        return false
    }
    return true
}
var HTR = {
    dir: 0,
    tfl: 3,
    name: ["", ""],
    code: [0, 0],
    tint: [
        [0, -1],
        [0, -1]
    ],
    date: [new TicketDate().now(), new TicketDate().now()],
    subFl: 0,
    subOnly: [false, false],
    is6Only: [false, false],
    is6000: [false, false],
    isKalinRestriction: 0,
    isFarCountry: 0,
    isFwdOnly: 0,
    showAll: [false, false],
    canSel: [true, true],
    flCost: [false, false],
    bBase: false,
    MvMode: [{}, {}]
};
var HTRFlds = {
    name: 1,
    code: 1,
    tint: 1,
    date: 1
};
var onSubmit = onSubmitStd;

function onSubmitStd(a) {
    location.href = anchorOnly();
    mainDraw(a);
    return false
}

function is6000(b) {
    var a = +b;
    return !(isNaN(a) || Math.floor(a / 1000) != 6)
}
var g_drawCnt = 0,
    g_MvMode = ["", ""],
    g_specParams = {};
var mainDraw = stdMainDraw;

function stdMainDraw(a) {
    if (submitLvl != 0) {
        return
    }
    if ((HT.code[0] | HT.code[1]) == 0) {
        return
    }
    var b = ++g_drawCnt;
    setTimeout(function () {
        if (b != g_drawCnt) {
            return
        }
        try {
            HTR.subFl = HTR.isKalinRestriction = HTR.isFarCountry = HTR.isFwdOnly = 0;
            HTR.bBase = HT.base >= 0;
            HTR.nBase = HT.base;
            var d;
            for (d = 0; d < 2; d++) {
                HTR.dir = HT.dir;
                HTR.tfl = HT.tfl;
                HTR.name[d] = HT.name[d];
                HTR.code[d] = HT.code[d];
                HTR.tint[d][0] = HT.tint[d][0];
                HTR.tint[d][1] = HT.tint[d][1];
                HTR.date[d] = HT.date[d].clone();
                HTR.subOnly[d] = d <= HT.dir;
                HTR.is6Only[d] = false;
                HTR.is6000[d] = false;
                HTR.flCost[d] = true;
                HTR.MvMode[d] = {};
                g_MvMode[d] == ""
            }
            for (d = 0; d <= HT.dir; d++) {
                HTR.canSel[d] = isTicketRoute(d, HTR)
            }
            HT.clear();
            formToggle("collapse");
            var c = buildParams();
            $.extend(c, a || {}, g_specParams);
            updateSubmit(1);
            fixStHist();
            askJSON(servURL, c, function (g, e, h) {
                onResponse(g, e, h);
                updateSubmit(-1)
            }, false, function (g, e, h) {
                updateSubmit(-1);
                renderErrMsg({
                    message: lang("Server Error")
                })
            }, new RLocker(0))
        } catch (f) {
            showError(f)
        }
    }, g_frameRate)
}

function RLocker(a) {
    this.redir = a;
    this.index = ++rindex
}
var rindex = 0;
var rlockers = [new RLocker(0), new RLocker(1), new RLocker(2), new RLocker(3), new RLocker(4)];

function addRLocker(a) {
    if (a.index < rlockers[a.redir].index) {
        return
    }
    if (a.redir > 0 && a.index < rlockers[0].index) {
        return
    }
    rlockers[a.redir] = a
}

function isReject(a) {
    if (rlockers[a.redir].index > a.index) {
        return true
    }
    if (a.redir > 0 && rlockers[0].index > a.index) {
        return true
    }
    return false
}
var HT_TabId = null;
var lastMD = 0;

function askJSON(d, f, e, a, c, b) {
    addRLocker(b);
    lastMD = ("md" in f) ? f.md : 0;
    if (HT_TabId != null) {
        f.SESSION_ID = HT_TabId
    }
    $.ajax({
        url: d,
        type: "get",
        dataType: "json",
        data: f,
        success: function (h, g, i) {
            if (isReject(b)) {
                return
            }
            if ("SESSION_ID" in h) {
                HT_TabId = h.SESSION_ID
            } else {
                if ("sessExpired" in h) {
                    HT_TabId = null
                }
            }
            h.rlocker = b;
            e(h, g, i)
        },
        complete: function () {
            if (isReject(b)) {
                return
            }
            if (a) {
                a()
            }
        },
        error: function (h, g, i) {
            if (isReject(b)) {
                return
            }
            if (c) {
                c(h, g, i)
            }
        }
    })
}

function askSubCost(a) {
    var b = $("#Part" + a + " .subtr-cost-box").show();
    var c = {
        date: HT.date[a].toString(),
        st_codeF: HTR.code[0],
        st_codeL: HTR.code[1]
    };
    if (HT.log) {
        c.log = HT.log
    }
    $.ajax({
        url: $.trim(applyTempl("SubTrCostLink", {})),
        type: "get",
        dataType: "xml",
        data: c,
        success: function (e, d, i) {
            var f = $("Route", e);
            if (f.length == 0) {
                b.html("");
                return
            }
            var g = f.find("Tariff[Type=X]").attr("Cost");
            if (g) {
                var h = "";
                $(f.find("Tariff")).each(function () {
                    var k, j = $(this).attr("Type");
                    if (j in SubTariff) {
                        k = SubTariff[j]
                    } else {
                        if (j.match(/^G\/\d+$/)) {
                            k = "Ручная кладь, " + j.substring(2) + " кг"
                        } else {
                            return
                        }
                    }
                    h += applyTempl("SubTrCostRow", {
                        label: k,
                        cost: $(this).attr("Cost")
                    })
                });
                b.html(applyTempl("SubTrCostMsg", {
                    Cost: g,
                    FullList: h,
                    prompt: lang(["Ticket", (HTR.is6Only[a]) ? "Cost of travel" : "Cost of travel in local train"])
                }))
            }
        },
        error: function (e, d, f) {
            b.html("")
        }
    })
}
var SubTariff = {
    X: "Разовый полный",
    "XД": "Разовый детский",
    "G/Ж": "Живность",
    "G/Т": "Телевизор",
    "G/В": "Велосипед",
    "Y/M01": "Абонементный билет сроком действия 1 месяц",
    "Y/M02": "Абонементный билет сроком действия 2 месяца",
    "Y/M03": "Абонементный билет сроком действия 3 месяца",
    "Y/M04": "Абонементный билет сроком действия 4 месяца",
    "Y/M05": "Абонементный билет сроком действия 5 месяцев",
    "Y/M06": "Абонементный билет сроком действия 6 месяца",
    "Y/M12": "Абонементный билет сроком действия 12 месяцев",
    "Y/D05": "Абонементный билет сроком действия 5 дней",
    "Y/D10": "Абонементный билет сроком действия 10 дней",
    "Y/D15": "Абонементный билет сроком действия 15 дней",
    "Y/D20": "Абонементный билет сроком действия 20 дней",
    "Y/D25": "Абонементный билет сроком действия 25 дней",
    "YВ/M01": "Абонементный билет «выходного дня» сроком действия 1 месяц",
    "YВ/M02": "Абонементный билет «выходного дня» сроком действия 2 месяца",
    "YВ/M03": "Абонементный билет «выходного дня» сроком действия 3 месяца",
    "YВ/M04": "Абонементный билет «выходного дня» сроком действия 4 месяца",
    "YВ/M05": "Абонементный билет «выходного дня» сроком действия 5 месяцев",
    "YВ/M06": "Абонементный билет «выходного дня» сроком действия 6 месяца",
    "YВ/M12": "Абонементный билет «выходного дня» сроком действия 12 месяцев",
    "YВД/M01": "Абонементный билет «выходного дня» детский сроком действия 1 месяц",
    "YВД/M02": "Абонементный билет «выходного дня» детский сроком действия 2 месяца",
    "YВД/M03": "Абонементный билет «выходного дня» детский сроком действия 3 месяца",
    "YВД/M04": "Абонементный билет «выходного дня» детский сроком действия 4 месяца",
    "YВД/M05": "Абонементный билет «выходного дня» детский сроком действия 5 месяцев",
    "YВД/M06": "Абонементный билет «выходного дня» детский сроком действия 6 месяца",
    "YВД/M12": "Абонементный билет «выходного дня» детский сроком действия 12 месяцев",
    "YР/M01": "Абонементный билет «рабочего дня» сроком действия 1 месяц",
    "YР/M02": "Абонементный билет «рабочего дня» сроком действия 2 месяца",
    "YР/M03": "Абонементный билет «рабочего дня» сроком действия 3 месяца",
    "YР/M04": "Абонементный билет «рабочего дня» сроком действия 4 месяца",
    "YР/M05": "Абонементный билет «рабочего дня» сроком действия 5 месяцев",
    "YР/M06": "Абонементный билет «рабочего дня» сроком действия 6 месяца",
    "YР/M12": "Абонементный билет «рабочего дня» сроком действия 12 месяцев",
    "YР/D10": "Абонементный билет «рабочего дня» сроком действия 10 дней",
    "YР/D15": "Абонементный билет «рабочего дня» сроком действия 15 дней",
    "YР/D20": "Абонементный билет «рабочего дня» сроком действия 20 дней",
    "YР/D25": "Абонементный билет «рабочего дня» сроком действия 25 дней",
    "YК/D05": "Абонементный билет на 5 определенных дней",
    "YК/D06": "Абонементный билет на 6 определенных дней",
    "YК/D07": "Абонементный билет на 7 определенных дней",
    "YК/D08": "Абонементный билет на 8 определенных дней",
    "YК/D09": "Абонементный билет на 9 определенных дней",
    "YК/D10": "Абонементный билет на 10 определенных дней",
    "YК/D11": "Абонементный билет на 11 определенных дней",
    "YК/D12": "Абонементный билет на 12 определенных дней",
    "YК/D13": "Абонементный билет на 13 определенных дней",
    "YК/D14": "Абонементный билет на 14 определенных дней",
    "YК/D15": "Абонементный билет на 15 определенных дней",
    "YК/D16": "Абонементный билет на 16 определенных дней",
    "Z/D10": "Абонементный билет на 10 поездок",
    "Z/D20": "Абонементный билет на 20 поездок",
    "Z/D60": "Абонементный билет на 60 поездок",
    "Z/D90": "Абонементный билет на 90 поездок"
};
var lastSubList = null,
    lastSubCon = null;

function toggleSubCost(b) {
    if ($("#tariffs-box").css("display") == "none") {
        lastSubCon = $(b).parent();
        var c = lastSubCon.find(".tariff");
        lastSubList = c;
        var d = $(b).parent().find(".tariff-pos").offset();
        $("#tariffs-box").show().append(c).prependTo("body");
        c.css("left", d.left).css("top", d.top);
        c.slideDown(200, function () {
            $("body").bind("click", hideSubCostList)
        }).find("tr").mouseover(function () {
            $(this).addClass("active-row")
        }).mouseout(function () {
            $(this).removeClass("active-row")
        })
    } else {
        hideSubCostList()
    }
    return false
}

function hideSubCostList() {
    if (lastSubList == null) {
        return
    }
    lastSubList.slideUp(200, function () {
        lastSubCon.append($("#tariffs-box .tariff"));
        $("#tariffs-box").hide()
    });
    lastSubList = null;
    $("body").unbind("click", hideSubCostList)
}
var BrandIcons = {
    "САПСАН": "/images/sapsan2.gif",
    "АЛЛЕГРО": "/images/allegro.gif",
    "ЛЕВ ТОЛСТОЙ": "/images/lev.gif"
};
var lastHTResult = "";
var onResponse = onResponseStd;

function onResponseStd(f, b, a, c) {
    $("#continueButtonDiv").show();
    try {
        HT.fromJSON(f, c);
        if (f.TransferSearchMode) {
            g_transferSearchMode = f.TransferSearchMode
        }
        if (c === undefined) {
            if (lastHTResult != "RID") {
                $("#Part1,#Part0").empty()
            }
            MidPoints = ["*", "*"];
            resetTransTime(0);
            resetTransTime(1)
        } else {
            if (lastHTResult != "RID") {
                $("#Part" + c).empty()
            }
            MidPoints[c] = "*";
            resetTransTime(c)
        } if (f.result == "OK") {
            if (c === undefined) {
                for (var d in HT.tp) {
                    renderPanel(d)
                }
            } else {
                renderPanel(c)
            }
        } else {
            if (f.result == "RID") {
                renderWait(f, c)
            } else {
                if (f.error) {
                    f.message = f.error
                }
                if (!("message" in f) && f.info) {
                    f.message = lang("Server Error")
                }
                renderErrMsg(f, c)
            }
        }
    } catch (g) {
        showError(g)
    }
    lastHTResult = f.result
}
var SQLres = ["SELECT", "FROM", "WHERE", "LEFT OUTER JOIN", "JOIN", "AND", "OR", "ORDER BY", "DESC", "ON", "AS", "UPDATE", "SET", "VALUES", "INSERT INTO", "IN"];

function htmlEOL(u) {
    var j = htmlEscape(u);
    j = j.replace(/\n/g, "<br>");
    j = j.replace("\t", "    ");
    j = j.replace(" ", "&nbsp;");
    var c, f, g;
    do {
        f = j.indexOf("sql=", f);
        c = j.indexOf("original exception:", f);
        if (f < 0 || c < f) {
            break
        }
        f += 4;
        var o = j.substring(0, f),
            a = " " + j.substring(f, c) + " ",
            h = j.substring(c);
        var t, r = 0;
        for (;;) {
            t = a.indexOf("'", r);
            if (t < 0) {
                break
            }
            r = a.indexOf("'", t + 1);
            if (r < 0) {
                break
            }
            r++;
            var p = a.substring(0, t),
                n = a.substring(t, r),
                l = a.substring(r);
            r += 7;
            a = p + "<i>" + n + "</i>" + l
        }
        for (g in SQLres) {
            a = a.replace(new RegExp(" " + SQLres[g] + " ", "g"), " <b>" + SQLres[g] + "</b> ")
        }
        j = o + '<span class="sql">' + a + "</span>" + h
    } while (f < j.length);
    return j
}

function mkErrDet(a) {
    if (HT.errFl && ("errInfo" in a)) {
        return applyTempl("ErrorDetails", {
            errInfo: htmlEOL(a.errInfo)
        })
    } else {
        if (HT.errFl && ("info" in a)) {
            return applyTempl("ErrorDetails", {
                errInfo: htmlEOL(a.info)
            })
        } else {
            return ""
        }
    }
}

function renderErrMsg(e, a) {
    var b, c, f, g = "";
    if ("invList" in e) {
        for (b in e.invList) {
            c = "HTErr_" + e.invList[b];
            f = htmlEOL(lang(c));
            if (f != c) {
                g += applyTempl("InvParamItem", {
                    message: f
                })
            }
        }
    }
    if (a == undefined) {
        $("#Part1").hide();
        a = 0
    }
    if (g) {
        g = applyTempl("InvParamsList", {
            InvParamItems: g
        })
    }
    if (e.sessExpired) {
        c = applyTempl("SessExpiredMsg", {})
    } else {
        c = applyTempl("TotalError", $.extend({
            InvParamsList: g,
            ErrorDetails: mkErrDet(e),
            message: htmlEscape(e.message)
        }, e))
    }
    $("#Part" + a).show().html(c)
}

function showWaitPanel(a) {
    if (lastHTResult == "RID") {
        return
    }
    $("#Part" + a).show().html(applyTempl("WaitPanel", makeDirDef(a)))
}
var redefFlds = ["rid", "redir", "md"];

function renderWait(b, a) {
    if (a === undefined) {
        for (var c = 0; c <= HT.dir; c++) {
            showWaitPanel(c)
        }
    } else {
        showWaitPanel(a)
    }
    setTimeout(function () {
        var f, d, e = buildParams();
        for (f in redefFlds) {
            d = redefFlds[f];
            if (d in b) {
                e[d] = b[d]
            }
        }
        if (b.RID) {
            e.rid = b.RID
        }
        $.extend(e, g_specParams);
        askJSON(servURL, e, function (i, h, g) {
            onResponse(i, h, g, a)
        }, false, function (h, g, i) {
            b.result = "Error";
            b.message = "AJAX Error: " + g + " = " + i;
            renderErrMsg(b)
        }, b.rlocker)
    }, g_frameRate)
}
var DirNm = ["FORWARD:", "BACKWARD:"];

function dirStr(a) {
    return HT.dir == 0 ? "" : lang(DirNm[a])
}

function makeDirDef(a) {
    return $.extend({
        Dir: dirStr(a),
        from: HT.name[a],
        where: HT.name[a ^ 1],
        DepDate: HT.date[a].toString("DOW")
    }, HT.tp[a])
}

function drawTrainsCount(a) {
    var b = $("#Part" + a + " .trslot").filter(":visible").length;
    var c = lang(HT.tp[a].state + " results: [N] from [Cnt]", {
        N: b,
        Cnt: HT.tp[a].list.length
    });
    $("#Part" + a + " .trains-count").html(c)
}
var LimitFlags = [false, false];

function filteredList(dir, tmpl) {
    var TL = "",
        cnt = 0;
    var mp = MidPoints[dir].toLocaleLowerCase();
    var m, j, ti = [0, 0],
        cf = CategFilters[dir],
        tfs = TransTypes[dir],
        carf = CarsMaps[dir];
    var tf = [+tfs.charAt(0), +tfs.charAt(1)];
    var bLimit = !HTR.showAll[dir],
        s10 = isShow10(dir) && LimitFlags[dir];
    var t0, mvm = g_MvMode[dir];
    if (bLimit && HT.tp[dir].list.length > 0) {
        var dtx = new Date(),
            ds = HTR.bBase ? HT.tp[dir].list[0].date0 : new TicketDate().now().toString();
        t0 = TDATE.ToMins(ds, dtx.getHours() + ":" + dtx.getMinutes())
    }
    for (j = 0; j < 2; j++) {
        ti[j] = TransTime[dir][j] * 60
    }
    with(HT.tp[dir]) {
        for (j in list) {
            var slot = list[j];
            if (bLimit) {
                if (carf < MagicCarsf) {
                    if (!slot.chkCarMap(carf)) {
                        continue
                    }
                }
                if (s10 && slot.startT() < t0) {
                    continue
                }
                if (mvm != "") {
                    var s = slot.mvModeHd();
                    if (s != "" && s != mvm) {
                        continue
                    }
                }
                if (HT.tp[dir].state == "Transfers") {
                    if (mp != "*" && mp != slot.midPt.toLocaleLowerCase()) {
                        continue
                    }
                    var tt = TTIME.ToMins(slot.delay);
                    if (tt < ti[0] || tt > ti[1]) {
                        continue
                    }
                    if (tf[0] != 0 && slot.getCurCase(0).type + 1 != tf[0]) {
                        continue
                    }
                    if (tf[1] != 0 && slot.getCurCase(1).type + 1 != tf[1]) {
                        continue
                    }
                }
            }
            var tpr = slot.getProps(dir, j, carf);
            TL += applyTempl(tmpl, $.extend({
                slot: j,
                carrierLink: (tpr.carrier == "ФПК") ? applyTempl("TmFPCRef", {}) : tpr.carrier
            }, tpr));
            ++cnt;
            if (bLimit && s10 && cnt >= 10) {
                break
            }
        }
    }
    if ("ltd" in HT.tp[dir]) {
        TL += applyTempl("TrainsLimited", {})
    }
    return TL
}

function drawMsgList(d) {
    var ML = "";
    with(HT.tp[d]) {
        for (var i in msgList) {
            if (msgList[i] == "null") {
                continue
            }
            var m = msgList[i];
            $.extend(m, {
                errInfo: (HT.errFl && "addInfo" in m) ? htmlEOL(m.addInfo) : ""
            });
            ML += applyTempl("MsgListItem", m)
        }
    }
    if (HTR.isKalinRestriction) {
        ML += applyTempl("KaliningradRestriction", {})
    }
    if (HTR.isFarCountry) {
        ML += applyTempl("FarCountryMsg", {})
    }
    if (HTR.isFwdOnly && d == 1) {
        ML += applyTempl("FwdOnlyMsg", {})
    }
    return ML
}

function isSubTr(a) {
    return HTR.is6000[a]
}

function toggleCars() {
    var g = new FindSlot(this);
    var i = HT.tp[g.d].list[g.n];
    var c = g.slot.find(".cars-box");

    function j(k) {
        k.slideUp("fast", function () {
            $(this).remove()
        })
    }
    j(g.part.find(".cars-box"));
    if (c.length == 0) {
        c = $(applyTempl("TmCarsBox", {})).appendTo(g.slot).hide().slideDown("fast");
        var e = i.carsFull;

        function b() {
            var l, k = "";
            for (l in e) {
                k += applyTempl("TmCarItem", e[l])
            }
            c.html(applyTempl("TmCarsList", {
                CarsList: k
            }));
            c.find(":radio").click(function () {
                c.find(":radio").not(this).prop("checked", false);
                $(this).prop("checked", true)
            })
        }
        if (e) {
            b()
        } else {
            c.html(applyTempl("TmWaitCars", {}));
            c.find("a[href=#cars-close]").click(function () {
                if (i.askCars) {
                    i.askCars.cancel();
                    i.askCars = null;
                    j(c)
                }
                return false
            });

            function h() {
                i.askCars = null
            }

            function d(k) {
                h();
                c.empty();
                i.carsFull = e = k.lst[0].cars;
                b()
            }

            function a(k) {
                c.html("Error: " + k);
                h()
            }
            var f = i.askCars;
            if (f) {
                c.append("<div>" + lang("Previous request found") + "</div>");
                f.addHandler(d, 0, 1);
                f.addHandler(a, 1, 1)
            } else {
                i.askCars = f = new AsyncRequest(PgAddr.Cars, g_frameRate);
                f.request({}, d, a)
            }
        }
    }
    return false
}
var renderSt = {
    Trains: function (d) {
        var j, TL = filteredList(d, "SingleTrain");
        var bMsg = lastMD == 0 && HT.tp[d].list.length == 0;
        var sh10 = isShow10(d),
            mvMd = HTR.MvMode[d];
        var mvc = 0;
        for (j in mvMd) {
            mvc++
        }
        var bTool = true;
        var tl = (g_transferSearchMode == "MANUAL" && bMsg) || g_transferSearchMode == "AUTO";
        with(HT.tp[d]) {
            $("#Part" + d).show().html(applyTempl("DirHeader", {
                Dir: dirStr(d),
                flCost: HTR.flCost[d],
                from: shortSt(from),
                where: shortSt(where),
                DepDate: date.toString("DOW"),
                ToolBar: !bTool ? "" : applyTempl("ToolBarWithoutTransfers", {
                    Dir: d,
                    show10: sh10,
                    isMvMode: mvc
                }),
                MsgList: drawMsgList(d),
                SubTrainsMsg: isSubTr(d) ? applyTempl("SubTrainsMsg", {}) : "",
                TransfersLink: tl ? applyTempl("TransfersLink", {}) : "",
                DirStaticMsg: bMsg ? "" : applyTempl("DirStaticMsg", {}),
                BenefitsLink: (HTR.subFl & (1 << d)) ? applyTempl("SubBenefitsLink", {
                    date0: HTR.date[d].toString(),
                    station0: HTR.name[d],
                    station1: HTR.name[d ^ 1],
                    code0: HTR.code[d],
                    code1: HTR.code[d ^ 1]
                }) : "",
                TListEmpty: list.length == 0,
                TListNotEmpty: list.length != 0,
                TrainsList: TL
            }))
        }
        var part = $("#Part" + d);
        part.find("input[name=limit]").attr("checked", LimitFlags[d]);
        part.find(".pv0-ref").click(printVer0);
        part.find("a[href^=#Cars-]").click(toggleCars);
        if (mvc != 0) {
            var MV = $("#Part" + d + " select[name=MvMode]");

            function opt(v, t) {
                var c = (v == g_MvMode[d]) ? " selected" : "";
                return '<option value="' + v + '"' + c + ">" + t + "</option>"
            }
            MV.append(opt("", lang("All")));
            for (j in mvMd) {
                MV.append(opt(j, j))
            }
            MV.change(function () {
                g_MvMode[d] = this.options[this.selectedIndex].value
            })
        }
        if (isSubTr(d)) {
            askSubCost(d)
        }
    },
    Transfers: function (h) {
        var b, e = HT.tp[h],
            a = filteredList(h, "TransfItem");
        var g = lastMD == 0 && HT.tp[h].list.length == 0;
        $("#Part" + h).show().html(applyTempl("TransHeader", $.extend({
            From: capitalize(e.from),
            Where: capitalize(e.where),
            date: e.date.toString("DOW"),
            Dir: dirStr(h),
            MsgList: drawMsgList(h),
            ToolBar: g ? "" : applyTempl("ToolBarWithTransfers", {
                Dir: h,
                show10: isShow10(h)
            }),
            SubTrainsMsg: isSubTr(h) ? applyTempl("SubTrainsMsg", {}) : "",
            TransfStaticMsg: g ? "" : applyTempl("TransfStaticMsg", {}),
            DirectLink: g ? "" : applyTempl("DirectLink", {}),
            TransfList: a
        }, e)));
        var c = $("#Part" + h + " select[name=MidPt]");
        for (mp in e.midLst) {
            c.append('<option value="' + mp + '">' + capitalize(mp) + "</option>")
        }
        var f = $("#Part" + h + " a[name=toggleParts]");
        if (f.length != 0) {
            onTransInfo(f[0])
        }
    },
    Error: function (a) {
        HT_TabId = null;
        $("#Part" + a).show().html(applyTempl("DirError", $.extend(makeDirDef(a), {
            MsgList: drawMsgList(a)
        })))
    }
};
var dirLocks = [0, 0];

function isShow10(a) {
    return HTR.subOnly[a] && HT.date[a].equals(new TicketDate().now())
}

function renderPanel(d) {
    if (SortModes[d] != HT.tp[d].sortMode) {
        HT.tp[d].sortMode = SortModes[d];
        HT.tp[d].resort()
    }
    var st, i, j;
    dirLocks = [0, 0];
    st = HT.tp[d].state;
    if (st in renderSt) {
        renderSt[st](d)
    }
    var tfl = 0;
    with(HT.tp[d]) {
        if (state == "Trains") {
            for (i in list) {
                tfl |= 1 << list[i].type
            }
        } else {
            for (i in list) {
                for (j = 0; j < 2; j++) {
                    tfl |= 1 << list[i].getCurCase(j).type
                }
            }
        }
    }
    $("#Part" + d).find(".sort-mode").click(function () {
        sortSlotsExt(this)
    }).end().find(".sort-mode[name=" + HT.tp[d].sortMode + "]").addClass("mvmode-change").end();
    if (HT.ID(HT.tp[d].sortMode) == "cost") {
        $("#Part" + d + " .sort-mode[name=cost-x]").addClass("mvmode-change").parent().append(applyTempl("SortDir" + HT.Ndx(HT.tp[d].sortMode), {}))
    }
    $("#Part" + d + " .toolbar").find(".car-checkers")[tfl == 2 ? "hide" : "show"]().end().find("#CritAll").val(HT.tp[d].sortMode).end().find("input[name=T0]").val(TransTime[d][0]).end().find("input[name=T1]").val(TransTime[d][1]).end().find("input[name=limit]").attr("checked", LimitFlags[d]).end().find("select[name=MidPt]").val(MidPoints[d]).end().find("select[name=CritCost]").val(CategFilters[d]).end().find("input[name=show-all]").attr("checked", HTR.showAll[d]).end().find("select[name=TrFilter]").val(TransTypes[d]).end();
    $("#Part" + d + " .full-st-but").click(function (e) {
        if (lastStTip) {
            lastStTip.hide()
        }
        lastStTip = $(this).next().show();
        $(document).click(function () {
            $(document).unbind("click");
            if (lastStTip == null) {
                return true
            }
            lastStTip.hide();
            lastStTip = null;
            return false
        });
        e.stopPropagation();
        e.preventDefault();
        return false
    });
    $("#Part" + d + " .trslot").each(function () {
        var n = +$(":hidden", this).val();
        if (!HT.tp[d].list[n].canSelect()) {
            $(":radio", this).css("visibility", "hidden")
        }
    }).find(".pv-ref").click(openPrintVer);
    setCarsMap(d);
    drawTrainsCount(d)
}
var lastStTip = null;

function FindSlot(b) {
    var a = ".trslot";
    this.slot = $(b).parents(a);
    this.part = $(b).parents("div[id^=Part]");
    this.d = HT.Ndx(this.part.attr("id"));
    this.n = this.slot.find(":hidden").val()
}

function FindDir(a) {
    this.part = $(a).parents("div[id^=Part]");
    this.d = HT.Ndx(this.part.attr("id"))
}

function selectSlot(b) {
    var c = new FindSlot(b);
    var a = c.part.find(".trslot:visible").not(c.slot[0]);
    if (HT.tp[c.d].list.length < SlotsLim && a.length != 0) {
        a.slideUp(200, function () {
            drawTrainsCount(c.d)
        })
    } else {
        a.hide();
        drawTrainsCount(c.d)
    }
    a.find(":radio").attr("checked", false);
    c.slot.find(":radio").attr("checked", true);
    c.part.find(".t-expand").show();
    c.part.find(".toolbar,div[name=header]").hide();
    HT.tp[c.d].sel = c.n;
    if (HT.isSelOk()) {
        $("#continueButton").removeClass("disabledImit")
    }
}

function tExpand(a) {
    var b = $(a).hide().parents("div[id^=Part]");
    var c = new FindDir(a);
    if (HT.tp[c.d].list.length < SlotsLim) {
        b.find(".trslot").show()
    } else {
        b.find(".trslot").show()
    }
    b.find(".toolbar,div[name=header]").show();
    drawTrainsCount(c.d)
}

function searchSpecial(a, d) {
    var c = new FindSlot(a);
    var b = c.d;
    if (dirLocks[b]) {
        return
    }
    dirLocks[b]++;
    $(a).addClass("disabled");
    showWaitPanel(b);
    askJSON(servURL, $.extend(buildParams(), {
        redir: b,
        md: d
    }), function (g, f, e) {
        onResponse(g, f, e, b)
    }, function () {
        dirLocks[b] = 0;
        $(a).removeClass("disabled")
    }, function (f, e, g) {}, new RLocker(b + 1))
}

function searchTransfOnly(a) {
    searchSpecial(a, 1)
}

function searchWithoutTransf(a) {
    searchSpecial(a, 2)
}
var CategFilters = ["0", "0"];

function sortByCost(a) {
    CategFilters[new FindSlot(a).d] = $(a).val()
}
$(function () {
    $(".car-checkers a[name=all]").live("click", function () {
        setCarsMap(this, true)
    });
    $(".car-checkers a[name=nothing]").live("click", function () {
        setCarsMap(this, false)
    });
    $(".car-checkers input:checkbox").live("click", function () {
        setCarsMap(this)
    })
});
var CarsMaps;
$(function () {
    CarsMaps = [MagicCarsf, MagicCarsf]
});

function setCarsMap(f, e) {
    if (e !== undefined) {
        var b = $(f).parents(".car-checkers").find("input:checkbox");
        if (e) {
            b.attr("checked", "checked")
        } else {
            b.removeAttr("checked")
        }
    }
    var a = 0,
        c = typeof f;
    if (c == "string" || c == "number") {
        a = CarsMaps[+f];
        $("#Part" + f + " .car-checkers").find("input:checkbox").each(function () {
            var g = HT.Ndx(this.name) - 1;
            this.checked = (a & (1 << g))
        });
        return
    }
    var d = new FindSlot(f);
    $(f).parents(".car-checkers").find("input:checkbox").each(function () {
        if (this.checked) {
            var g = HT.Ndx(this.name) - 1;
            a |= 1 << g
        }
    });
    HT.tp[d.d].carsf = CarsMaps[d.d] = a
}
var TransTypes = ["00", "00"];

function filterByType(a) {
    TransTypes[new FindSlot(a).d] = $(a).val()
}
var SortModes = ["time0", "time0"];

function sortSlots(b, c) {
    var a = new FindSlot(b);
    if (c == "cost-x") {
        var d = HT.tp[a.d].sortMode;
        c = d == "cost0" ? "cost1" : "cost0"
    }
    HT.tp[a.d].sortMode = SortModes[a.d] = c ? c : b.value;
    HT.tp[a.d].resort();
    renderPanel(a.d)
}
var MidPoints = ["*", "*"];

function setMidPt(a) {
    MidPoints[new FindSlot(a).d] = $(a).val()
}

function sortSlotsExt(a) {
    if (a === undefined) {
        return $("#Info1").append("sortSlotsExt for empty object<br>")
    }
    $(a).parents("div[id^=Part]").find(".sort-mode").removeClass("sort-mode-current");
    setTimeout(function () {
        sortSlots(a, $(a).attr("name"))
    }, 20)
}

function toggleLimit(a) {
    var b = new FindSlot(a);
    LimitFlags[b.d] = a.checked
}

function setShowAll(a) {
    var b = new FindDir(a);
    HTR.showAll[b.d] = !! $(a).attr("checked")
}
var TransTimeDef = {
    1: [3, 6],
    2: [0.5, 3],
    3: [0.5, 3]
};
var TransTime = [
    [1, 2],
    [1, 2]
];

function resetTransTime(b) {
    for (var a = 0; a < 2; a++) {
        TransTime[b][a] = TransTimeDef[HT.tfl][a]
    }
}

function loadTime(b, f) {
    var e = $("#Part" + b + " input[name=T" + f + "]");
    var a = e.val().replace(",", ".");
    var f = +a;
    if (isNaN(f) || f < 0 || f > 24) {
        e.addClass("field-error").focus()
    } else {
        e.removeClass("field-error")
    }
    return f
}

function recalcPart(a) {
    var d = new FindDir(a);
    if (HT.tp[d.d].state == "Transfers") {
        var c, b = [0, 0];
        for (c = 0; c < 2; c++) {
            b[c] = loadTime(d.d, c)
        }
        if (isNaN(b[0]) || isNaN(b[1])) {
            return
        }
        if (b[0] >= b[1]) {
            return alert(Lang.Errors["Interchange interval time"])
        }
        for (c = 0; c < 2; c++) {
            TransTime[d.d][c] = b[c]
        }
    }
    HT.tp[d.d].resort();
    renderPanel(d.d)
}

function onTransInfo(k) {
    s = new FindSlot(k);
    var h, g, f, d = s.slot.find(".trdetails")[0];
    if (d == undefined) {
        var e = HT.tp[s.d].list[s.n];
        var b = $.extend(e, {});
        for (g in e.cases) {
            var n = "",
                l = e.cases[g],
                c = parseInt(g) ^ 1;
            for (f in l) {
                n += applyTempl("TransTrainItem", l[f].getProps(s.d, s.n, CarsMaps[s.d]))
            }
            b["Part" + g] = n;
            b["station" + g] = e.getCurCase(g)["station" + c]
        }
        $(applyTempl("TransfDetails", b)).appendTo(s.slot).hide().slideDown(200);
        g = 0;
        s.slot.find(".trpart").data("isCollapsed", true).each(function () {
            $(".trcase", this).click(changeCase).mouseover(function () {
                onCaseMouse(this, true)
            }).mouseout(function () {
                onCaseMouse(this, false)
            }).eq((h = HT.tp[s.d].list[s.n]).cur[g]).show().find(".expand-place").html(h.cases[g++].length > 1 ? applyTempl("CasesExpand", {}) : "")
        });
        $(k).html(lang("Collapse") + '<img src="/images/expand-cases.png" alt="" />')
    } else {
        $(d).slideUp(300, function () {
            $(this).remove()
        });
        $(k).html(lang("More details") + '<img src="/images/collapse-cases.png" alt="" />')
    }
}
var GrayCase = "trcase-grey";

function onCaseMouse(c, f) {
    $(c).toggleClass("active-case", f);
    var e = $(c).parents(".trpart");
    if (!f) {
        e.find(".trcase").removeClass(GrayCase)
    } else {
        var a = 0,
            b = new FindSlot(c);
        var d = b.slot.find(".trpart").index(e[0]);
        e.find(".trcase").each(function () {
            if (!HT.tp[b.d].list[b.n].isCompatible(d, a++)) {
                $(this).addClass(GrayCase)
            }
        })
    }
}

function changeCase() {
    if ($(this).hasClass(GrayCase)) {
        return alert(Lang.Errors["Incompatible options"])
    }
    var d = $(this).parents(".trpart");
    var a = d.find(".trcase").index(this);
    var b = new FindSlot(this);
    var c = d.parents(".trdetails").find(".trpart").index(d[0]);
    if (d.data("isCollapsed")) {
        return
    }
    var e = HT.tp[b.d].list[b.n];
    if (e.cases[c].length == 1) {
        return alert("Single Case")
    }
    e.setCurSel(c, a);
    b.slot.find("span[name=delay-s]").text(cvtTimeLen(e.delay)).end().find("span[name=timeInWay-s]").text(cvtTimeLen(e.timeInWay)).end().find("span[name=delay]").text(e.delay).end().find("span[name=timeInWay]").text(e.timeInWay).end().find("span[name=time0]").text(e.getCurCase(0).time0).end().find("span[name=time1]").text(e.getCurCase(1).time1).end().find("span[name=midpt0]").text(e.getCurCase(0).station1).end().find("span[name=midpt1]").text(e.getCurCase(1).station0).end();
    d.find(".expand-place").empty();
    $(".expand-place", this).html(applyTempl("CasesCollapse", {}))
}

function toggleCases(e, b) {
    var d = $(b).parents(".trpart");
    var a = $(b).parents(".trcase");
    var c = d.data("isCollapsed");
    a.find(".expand-place").html(applyTempl(c ? "CasesCollapse" : "CasesExpand", {}));
    d.data("isCollapsed", !c);
    if (c) {
        d.find(".trcase").show(100)
    } else {
        d.find(".trcase").not(a).hide(100)
    }
    e.stopPropagation()
}

function PVExt(c, e) {
    var b = (HTR.subFl >> c) & 1;
    var g = HTR.subOnly[c];
    var a = HT.tp[c].list;
    var d = false;
    if (HTR.nBase > 0) {
        var f = new TicketDate().now();
        f.addDays(HTR.nBase);
        d = f.toString()
    }
    return $.extend({}, {
        trainsCnt: a.length,
        hdrDepDate: (g && !HTR.bBase && a.length) ? a[0].date0 : false,
        hdrBaseDate: d,
        today: new TicketDate().now().toString(),
        isBase: HTR.bBase,
        isCarCateg: !b,
        isDate: !g
    }, e)
}

function printVer0() {
    var f = new FindDir(this);
    var e, c = "",
        b = HT.tp[f.d].list;
    var d = PVExt(f.d, {});
    for (e in b) {
        c += applyTempl("PVTrain", $.extend(b[e].getProps(f.d, 0), d))
    }
    var a = window.open("", "", "scrollbars=yes,width=800,height=600,toolbar=yes,menubar=yes,resizable=yes");
    a.document.write(applyTempl("PVBody", {
        PVBodySpec: applyTempl("PVPart", $.extend({
            station0: HTR.name[0],
            station1: HTR.name[1],
            Trains: c
        }, d))
    }));
    a.focus();
    a.setTimeout("window.print ()", 3000);
    return false
}

function openPrintVer() {
    var k = new FindSlot(this);
    var e;
    var d, c, g = window.open("", "", "scrollbars=yes,width=800,height=600,toolbar=yes,menubar=yes,resizable=yes");
    var h = HT.tp[k.d].state;
    var b = HT.tp[k.d].list[k.n];
    var f = PVExt(k.d, {});
    g.document.write(applyTempl("PVBody", {
        PVBodySpec: applyTempl("PVBody" + h, b.getProps(k.d, k.n, MagicCarsf))
    }));
    if (h == "Trains") {
        var a = b.getProps(k.d, k.n);
        e = applyTempl("PVTrain", $.extend({}, a, f));
        $("#PVPart", g.document).append(applyTempl("PVPart", $.extend(a, {
            Trains: e
        }, f)))
    } else {
        for (d = 0; d < 2; d++) {
            e = "";
            for (c in b.cases[d]) {
                e += applyTempl("PVTrain", b.cases[d][c].getProps(k.d, k.n, MagicCarsf))
            }
            $("#PVPart" + d, g.document).append(applyTempl("PVPart", $.extend(b.getCurCase(d).getProps(k.d, k.n), {
                Trains: e
            }, f)))
        }
    }
    g.focus();
    g.setTimeout("window.print ()", 3000);
    return false
}
var guard3 = false;

function onSelectedTrains() {
    if (guard3) {
        return alert("Busy")
    }
    if (!HT.isSelOk()) {
        return alert(Lang.Errors["Trains not selected"])
    }
    if (!HT_TabId) {
        return alert(lang("Session expired. Please perform search once again."))
    }
    var i, res = [];
    for (i = 0; i <= HT.dir; i++) {
        with(HT.tp[i]) {
            if (sel >= 0) {
                list[sel].buildRes(i, res)
            }
        }
    }
    if (res.length == 0) {
        return alert(Lang.Errors["Interurban trains not selected"])
    }
    try {
        doNext(res)
    } catch (e) {}
}

function doNextStd(m) {
    checkJSON();
    if (!("sessionStorage" in window)) {
        return alert("Браузер не поддерживает sessionStorage. Покупка билета невозможна.")
    }
    var h, l, b, n = [];
    for (h in m) {
        l = +m[h].dir;
        b = {
            dir: l,
            tnum: m[h].number,
            st0: m[h].station0,
            st1: m[h].station1,
            dt0: m[h].date0,
            dt1: m[h].date1,
            time0: m[h].time0,
            time1: m[h].time1,
            code0: m[h].code0,
            code1: m[h].code1
        };
        n.push(b)
    }
    var a = JSON.stringify({
        trains: n
    });
    try {
        sessionStorage.setItem("Travel", a);
        var j, c = TicketLinks.IU_CarChoice,
            g = {};
        paramErrLog(g);
        for (j in g) {
            c += "&" + j + "=" + encodeURIComponent(g[j])
        }
        location.href = c
    } catch (k) {
        alert("Произошла ошибка записи в сессию.")
    }
}
var doNext = doNextStd