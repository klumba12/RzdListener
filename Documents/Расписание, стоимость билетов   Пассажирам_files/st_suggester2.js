function stCountry(a) {
    if (a >= 10000000) {
        return 20
    }
    return Math.floor(a / 100000 + 0.1)
}
var Sug2 = new function () {
        var h = {}, b = {};
        this.requestURL = "";
        this.minChars = 2;
        this.aflags = 3;
        this.listLimit = 12;
        var f = [];
        var e = lang("$ID");
        if (e.charAt(0) == "$") {
            e = "ru"
        }
        this.getStations = function () {
            return b
        };

        function d(k) {
            $("<div/>").text(k).appendTo("#Trace")
        }

        function a() {
            return "localStorage" in window
        }
        var c = {};

        function i(o, n) {
            if (n === undefined) {
                var l = null;
                if (a()) {
                    try {
                        l = localStorage.getItem(o)
                    } catch (m) {}
                }
                if (!l) {
                    l = c[o]
                }
                if (l) {
                    l = JSON.parse(l)
                }
                return l
            } else {
                var k = 0;
                if (a()) {
                    try {
                        localStorage.setItem(o, JSON.stringify(n));
                        k = 1
                    } catch (m) {}
                }
                if (!k) {
                    c[o] = n
                }
            }
        }
        this.bind = function (L) {
            var O = $("<div/>").addClass("dropList").hide().appendTo("body").click(function (P) {
                P.stopPropagation();
                return false
            });
            if (typeof L.defaultRecent == "string") {
                var F, l, B = L.defaultRecent.split(","),
                    D = [];
                for (F in B) {
                    l = B[F].split(":");
                    if (l.length == 2) {
                        D.push({
                            name: l[0],
                            code: +l[1]
                        })
                    }
                }
                L.defaultRecent = D
            }
            var K = $(L.input);
            if (K.length != 1) {
                return alert("Sug2.bind() require 1 input parameter")
            }
            var C = $(L.wait),
                J = L.onStation,
                n = "";
            K.attr("autocomplete", "off");
            K.keyup(m).change(E);
            K.focus(M).blur(u);
            K.click(function (P) {
                P.stopPropagation()
            });
            var H = [],
                G = $(L.recentElem),
                I = L.recentID;

            function t(S) {
                var R = "StRecent_" + I;
                R += "_" + e;
                if (S == "L" && a()) {
                    H = i(R) || H;
                    var Q, P = true;
                    for (Q in H) {
                        if (!((typeof H[Q] == "object") && ("name" in H[Q]) && ("code" in H[Q]))) {
                            P = false;
                            break
                        }
                    }
                    if (!P) {
                        H = []
                    }
                } else {
                    i(R, H)
                }
            }

            function A(Q) {
                var P = H.length - 1;
                while (P >= 0 && H[P].code != Q) {
                    P--
                }
                if (P < 0) {
                    return null
                }
                return H[P]
            }

            function y() {
                var Q = +$(this).attr("href").substring(1),
                    P = A(Q);
                if (P) {
                    K.val(P.name);
                    s(P.code)
                }
                return false
            }
            if (G.length && I) {
                var H = 0;
                if (a()) {
                    t("L")
                }
                if (!H.length) {
                    H = L.defaultRecent || H
                }
                t("S");

                function z() {
                    var P = "";
                    G.empty();
                    for (var Q in H) {
                        var R = H[Q];
                        if (!R.name) {
                            continue
                        }
                        G.append(P);
                        P = ", ";
                        $("<a/>").attr("href", "#" + R.code).text(capitalize(R.name)).appendTo(G).click(y)
                    }
                }
                z();
                f.push(function () {
                    var S = K.data("code"),
                        Q = b[S],
                        T = {
                            code: S
                        }, R = H.length - 1;
                    if (!S) {
                        return
                    }
                    T.name = Q ? Q.n : K.val().toUpperCase();
                    var P = T.name.split(",");
                    T.name = $.trim(P[0]);
                    while (R >= 0 && H[R].code != S) {
                        R--
                    }
                    if (R >= 0) {
                        H.splice(R, 1)
                    }
                    H.unshift(T);
                    H.length = Math.min(H.length, 7);
                    t("S");
                    z()
                })
            }

            function u() {
                if (!O.is(":visible")) {
                    return
                }
                O.fadeOut(200);
                $(window).unbind("click", o)
            }

            function o() {
                u();
                return false
            }

            function s(P) {
                if (J) {
                    J(P)
                }
                K.data("code", P)
            }

            function r(P) {
                var Q = (C.data("Cnt") || 0) + P;
                C.css("visibility", Q > 0 ? "visible" : "hidden").data("Cnt", Q);
                $("#Keys").text(JSON.stringify(h))
            }

            function M() {
                var P = K.val();
                if (P.length < Sug2.minChars) {
                    u()
                } else {
                    w(1)
                }
            }
            var q = {
                "1": function (P) {
                    return P.L
                },
                "2": function (P) {
                    return P.S
                },
                "3": function (P) {
                    return P.S + P.L
                }
            };

            function w(Y) {
                var R, P, X = j(K.val()),
                    S = [];
                if (X != n) {
                    n = X;
                    O.empty();
                    var W = Sug2.aflags,
                        V = -1,
                        Q = 0;
                    if (!/[\(\)\\\/\^\$\*\+\?\.]/.test(X)) {
                        Q = RegExp("(-|\\s|^)" + X)
                    }
                    for (R in b) {
                        P = b[R];
                        if ((W == 1 && !P.L) || (W == 2 && !P.S)) {
                            continue
                        }
                        if (P.k.indexOf(X) == 0 || (Q && Q.test(P.k))) {
                            S.push(R);
                            if (P.n == X) {
                                V = R
                            }
                        }
                    }
                    if (S.length == 1) {
                        V = S[0]
                    }
                    s(V < 0 ? "" : b[V].c);
                    if (S.length == 0) {
                        return u()
                    }
                    var U = q[Sug2.aflags];
                    S.sort(function (ac, aa) {
                        var ae = b[ac];
                        var ad = b[aa];
                        var ab = U(ae),
                            Z = U(ad);
                        if (ab > Z) {
                            return -1
                        }
                        if (ab < Z) {
                            return 1
                        }
                        if (ae.n < ad.n) {
                            return -1
                        }
                        if (ae.n > ad.n) {
                            return 1
                        }
                        return 0
                    });
                    S.length = Math.min(S.length, Sug2.listLimit);
                    for (R in S) {
                        P = b[S[R]];
                        $("<div/>").addClass("station").data("code", P.c).text(P.n).appendTo(O).click(v)
                    }
                }
                if (O.find(".station").length == 0) {
                    return
                }
                if (!K.is(":focus")) {
                    if (!Y) {
                        return
                    }
                }
                if (!O.is(":visible")) {
                    O.fadeIn(200);
                    $(window).click(o)
                }
                var T = K.offset();
                T.top += K.outerHeight();
                T.width = K.outerWidth();
                O.css(T)
            }

            function v() {
                K.val($(this).text());
                s($(this).data("code"));
                u()
            }
            var N = "dropListSel";

            function k(P) {
                if (!O.is(":visible")) {
                    M()
                }
                if (!O.is(":visible")) {
                    return
                }
                var R = O.find("." + N);
                if (R.length == 0) {
                    O.find(".station:first").addClass(N);
                    return
                }
                var Q = O.find(".station"),
                    S = Q.index(R);
                S += P;
                if (S < 0) {
                    S += Q.length
                } else {
                    if (S == Q.length) {
                        S = 0
                    }
                }
                R.removeClass(N);
                Q.eq(S).addClass(N)
            }

            function x(Q) {
                var P = O.find("." + N);
                if (P.length == 0) {
                    return
                }
                if (Q) {
                    Q.stopPropagation();
                    Q.preventDefault()
                }
                v.call(P)
            }

            function m(Q) {
                var P = Q.which;
                switch (P) {
                case 38:
                    k(-1);
                    break;
                case 40:
                    k(1);
                    break;
                case 27:
                    u();
                    break;
                case 13:
                    if (O.is(":visible")) {
                        x(Q)
                    }
                    break;
                default:
                    p()
                }
            }

            function p() {
                var P = j(K.val());
                if (P.length < Sug2.minChars) {
                    u();
                    return s("")
                }
                var Q = P.substring(0, Sug2.minChars),
                    R = h[Q];
                if (R === 2) {
                    w()
                } else {
                    if (R !== 1) {
                        function S(T, U) {
                            $.ajax({
                                url: "/suggester",
                                dataType: "json",
                                data: {
                                    stationNamePart: Q,
                                    lang: e,
                                    lat: lang("$Cyrillic") == "No" ? 1 : 0,
                                    compactMode: "y"
                                },
                                success: T,
                                error: U,
                                complete: function () {
                                    r(-1)
                                }
                            })
                        }
                        h[Q] = 1;
                        r(1);
                        S(function (V) {
                            h[Q] = 2;
                            for (var U in V) {
                                var T = V[U];
                                T.k = j(T.n);
                                b[T.c] = T
                            }
                            var W = j(K.val()).substring(0, Sug2.minChars);
                            if (W == Q) {
                                w()
                            }
                        }, function (U, T, V) {
                            h[Q] = 0
                        })
                    }
                }
            }

            function E() {
                p();
                var P = K.data("code");
                if (P) {
                    K.val(b[P].n)
                }
                s(P)
            }
        };
        var g = {
            F: "А",
            "<": "Б",
            ",": "Б",
            D: "В",
            U: "Г",
            L: "Д",
            T: "Е",
            "`": "Е",
            "~": "Е",
            "Ё": "Е",
            ":": "Ж",
            ";": "Ж",
            P: "З",
            B: "И",
            Q: "Й",
            R: "К",
            K: "Л",
            V: "М",
            Y: "Н",
            J: "О",
            G: "П",
            H: "Р",
            C: "С",
            N: "Т",
            E: "У",
            A: "Ф",
            "{": "Х",
            "[": "Х",
            W: "Ц",
            X: "Ч",
            I: "Ш",
            O: "Щ",
            "}": "Ъ",
            "]": "Ъ",
            S: "Ы",
            M: "Ь",
            '"': "Э",
            "'": "Ю",
            Z: "Я"
        };

        function j(n) {
            var k = 0,
                m = $.trim(n.toLocaleUpperCase()),
                o = "",
                l;
            if (e != "ru") {
                return m
            }
            for (; k < m.length; k++) {
                l = m.charAt(k);
                if (l in g) {
                    o += g[l]
                } else {
                    o += l
                }
            }
            return o
        }
        this.updateRecents = function () {
            for (var k in f) {
                f[k]()
            }
        }
    }();