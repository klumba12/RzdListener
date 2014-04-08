function htmlEscape(a) {
    if (!a) {
        return ""
    }
    a = a.toString();
    var b = a.replace(/</g, "&lt;");
    b = b.replace(/>/g, "&gt;");
    b = b.replace(/\"/g, "&quot;");
    return b
}

function zfill(b, a) {
    b = b.toString();
    while (b.length < a) {
        b = "0" + b
    }
    return b
}

function enableElem(b, a) {
    $(b).attr("disabled", !a).toggleClass("disabled", !a)
}

function applyTempl(d, b) {
    var a, c = document.getElementById(d);
    if (c) {
        a = c.innerHTML
    } else {
        if (d in window) {
            a = window[d]
        } else {
            return ""
        }
    }
    return applyTemplS(a, b)
}

function applyTemplS(e, d) {
    var c, b = 0,
        a, f;
    for (c in d) {
        e = e.replace(new RegExp("(`|%60|\\$)" + c + "(`|%60|\\$)", "g"), d[c])
    }
    for (;;) {
        b = e.indexOf("<!--if ", b);
        if (b < 0) {
            break
        }
        a = e.indexOf(" ", b + 7);
        if (b < 0) {
            break
        }
        c = e.substring(b + 7, a);
        if (f = c.charAt(0) == "!") {
            c = c.substring(1)
        }
        if (!(c in d) || (d[c])) {
            b = a + 4
        } else {
            a = e.indexOf("<!--endif " + c, a);
            if (a < 0) {
                break
            }
            a = e.indexOf(">", a);
            if (a < 0) {
                break
            }
            e = e.substring(0, b) + e.substring(a + 1)
        }
    }
    return e
}

function applyTemplV(c, a) {
    var b, d = "";
    for (b in a) {
        d += applyTempl(c, a[b])
    }
    return d
}

function lang(c, b) {
    var d = false;
    if ("Lang" in window) {
        if (!$.isArray(c)) {
            if (Lang[c]) {
                d = Lang[c]
            }
        } else {
            d = Lang;
            for (var a = 0; d && a < c.length; a++) {
                d = (c[a] in d) ? d[c[a]] : false
            }
        }
    }
    d = d || c;
    if (b !== undefined) {
        for (var a in b) {
            d = d.replace(new RegExp("\\[" + a + "\\]", "g"), b[a])
        }
    }
    return d
}

function capitalize(f) {
    var h, a = true,
        g = "";
    for (var e = 0; e < f.length; e++) {
        h = f.charAt(e);
        h = a ? h.toUpperCase() : h.toLowerCase();
        a = h == " " || h == "-" || h == "(";
        g += h
    }
    return g
}

function showError(b) {
    var a = b.name ? b.name : "Error";
    a += ": " + b.message;
    if (b.fileName) {
        a += "\nFile: " + b.fileName
    }
    if (b.lineNumber) {
        a += "\nLine: " + b.lineNumber
    }
    if (b.stack) {
        a += "\nStack:\n" + b.stack
    }
    alert(a)
}

function stepDateElem(c, b, a) {
    if (typeof (c) == "string") {
        c = document.getElementById(c)
    }
    if (!c) {
        return
    }
    var e = new TicketDate(c.value);
    if (!e.isOk()) {
        return
    }
    e.addDays(b);
    c.value = e.toString();
    var f = typeof (a);
    if (f == "function") {
        a(c)
    }
}

function stepDowDate(c, b, a) {
    if (typeof (c) == "string") {
        c = document.getElementById(c)
    }
    if (!c) {
        return
    }
    var e = new TicketDate(c.value.split(",")[0]);
    if (!e.isOk()) {
        return
    }
    e.addDays(b);
    c.value = e.toString("DOW");
    var f = typeof (a);
    if (f == "function") {
        a(c)
    }
}

function setCookie(b, d, a, f, c, e) {
    document.cookie = b + "=" + escape(d) + ((a) ? "; expires=" + a : "") + ((f) ? "; path=" + f : "") + ((c) ? "; domain=" + c : "") + ((e) ? "; secure" : "")
}
var TransLit = function () {
    var c = "А:A;Б:B;В:V;Г:G;Д:D;Е:E;Ё:YO;Ж:ZH;З:Z;И:I;Й:Y;К:K;Л:L;М:M;Н:N;О:O;П:P;Р:R;С:S;Т:T;У:U;Ф:F;Х:KH;Ц:TC;Ч:CH;Ш:SH;Щ:SHC;Ъ:';Ы:Y;Ь:';Э:E';Ю:YU;Я:YA";
    var b = {};

    function a(f) {
        var e, g, d = f.split(";");
        for (e in d) {
            g = d[e].split(":");
            b[g[0]] = g[1]
        }
    }
    a(c);
    a(c.toLowerCase());
    return {
        map: b
    }
}();

function transliterate(e) {
    var d, g, b = e.length,
        f = "",
        a = TransLit.map;
    for (d = 0; d < b; d++) {
        g = e.charAt(d);
        f += (g in a) ? a[g] : g
    }
    return f
}

function datePickerLoc(b) {
    function a(d) {
        var c, e = [];
        for (c = 1; c != 8; c++) {
            e[c % 7] = d[c - 1]
        }
        return e
    }
    return $.extend({}, {
        dateFormat: "dd.mm.yy",
        monthNames: Lang.Months,
        monthNamesShort: Lang.MonthsShort,
        dayNames: a(Lang.WeekDays),
        dayNamesMin: a(Lang.WeekDaysShort),
        firstDay: 1
    }, b)
}

function moneyFmt(a) {
    var c = Math.floor(a);
    var b = c.toString();
    i = b.length - 3;
    while (i > 0) {
        b = b.substring(0, i) + "&nbsp;" + b.substring(i);
        i -= 3
    }
    if (a - c >= 0.01) {
        b += (a - c).toFixed(2).substring(1)
    }
    return b
}

function paramErrLog(e) {
    var a = {
        log: 1,
        err: 1
    }, b, d, c = location.search.substring(1).split("&");
    for (b in c) {
        d = c[b].split("=");
        if (d[0] in a) {
            e[d[0]] = decodeURIComponent(d[1])
        }
    }
    return e
}

function AsyncRequest(c, b) {
    this.type = "post";
    b = b || 1000;
    var g = [],
        d = [];
    var f = null;
    this.isActive = function () {
        return f != null
    };

    function e() {
        f = new Object();
        f.ok = true;
        return f
    }

    function a(h) {
        h.ok = false;
        if (h == f) {
            f = null
        }
    }
    this.addHandler = function (k, j, l) {
        var h = j ? d : g;
        if (l) {
            h.length = 0
        }
        if (k) {
            h.push(k)
        }
    };
    this.request = function (k, n, m, j) {
        paramErrLog(k);
        var o = this.type;
        this.cancel();
        this.addHandler(n);
        this.addHandler(m, 1);
        var h = e();

        function q(u, s) {
            if (!h.ok) {
                return
            }
            for (var t in d) {
                d[t](u, s)
            }
            if (j) {
                j()
            }
            a(h)
        }

        function r(s) {
            if (!h.ok) {
                return
            }
            if (s.error !== undefined) {
                return q(s.error || lang("Server Error"), s)
            }
            if (s.result == "RID") {
                k.rid = s.RID;
                setTimeout(l, b);
                return
            }
            a(h);
            for (var t in g) {
                g[t](s)
            }
            g.length = 0;
            if (j) {
                j()
            }
        }

        function l() {
            if (!h.ok) {
                return
            }
            $.ajax({
                url: c,
                data: k,
                type: o,
                dataType: "json",
                success: r,
                error: function (t, s, u) {
                    q("Ошибка запроса. " + s + ": " + u)
                }
            })
        }
        l()
    };
    this.cancel = function () {
        g.length = 0;
        d.length = 0;
        if (f) {
            a(f)
        }
    }
}

function checkJSON() {
    if ("JSON" in window) {
        return
    }
    window.JSON = {
        stringify: function (obj) {
            var t = typeof (obj);
            if (t != "object" || obj === null) {
                if (t == "string") {
                    obj = '"' + obj + '"'
                }
                return String(obj)
            } else {
                var n, v, json = [],
                    arr = (obj && obj.constructor == Array);
                for (n in obj) {
                    v = obj[n];
                    t = typeof (v);
                    if (t == "string") {
                        v = '"' + v + '"'
                    } else {
                        if (t == "object" && v !== null) {
                            v = JSON.stringify(v)
                        }
                    }
                    json.push((arr ? "" : '"' + n + '":') + String(v))
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}")
        },
        parse: function (str) {
            if (str === "") {
                str = '""'
            }
            eval("var p=" + str + ";");
            return p
        }
    }
}

function clearForm(c) {
    var a = document.forms[c];
    for (var b = 0; b < a.elements.length; b++) {
        if (a.elements[b].type == "text") {
            a.elements[b].value = ""
        }
        if (a.elements[b].type == "select-one") {
            a.elements[b].value = ""
        }
        if (a.elements[b].type == "checkbox") {
            a.elements[b].checked = false
        }
        if (a.elements[b].type == "radio") {
            a.elements[b].value = "0";
            a.elements[b].checked = false
        }
    }
}

function setPlaceholders() {
    if (Modernizr.input.placeholder) {
        return
    }
    $("input[placeholder]").each(function () {
        var a = $(this).attr("placeholder");
        if ($(this).val() === "") {
            $(this).val(a)
        }
    }).focus(function () {
        if ($(this).val() === $(this).attr("placeholder")) {
            $(this).val("")
        }
    }).blur(function () {
        if ($(this).val() === "") {
            $(this).val($(this).attr("placeholder"))
        }
    })
}

function sliceString(f, g, d) {
    f = f.toString();
    var j = "";
    var e;
    var b = [];
    var c;
    var a = f.length;
    if (d === undefined) {
        d = "&nbsp;"
    }
    if (g === undefined) {
        g = 3
    }
    var h;
    if (a > g) {
        h = a % g;
        c = Math.ceil(a / g);
        if (h != 0) {
            b.push(f.substr(a * -1, h));
            f = f.substr(h)
        }
        e = Math.ceil(f.length / g);
        for (i = 0; i < e; i++) {
            strProc = strProc = f.substr(i * g, g);
            b.push(strProc)
        }
        j = b.join(d)
    } else {
        j = f
    }
    return j
}

function getRotatePosFix(a, b) {
    return (a - b) / 2
};