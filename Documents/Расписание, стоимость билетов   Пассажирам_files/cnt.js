var _openstat = _openstat || [];
(function () {
    var E = "$Rev: 3864 $",
        e = "openstat.net",
        k = "openstat",
        C = _openstat,
        D = "rating.openstat.ru",
        A = "Openstat",
        l = "openstat.net";

    function F(J) {
        if (d(J)) {
            return false
        }
        I(J);
        m(J);
        g(J);
        J.plugins.push({
            action: "plugin",
            fn: y
        });
        J.plugins.push({
            action: "plugin",
            fn: q
        });
        z(J);
        return true
    }

    function d(J) {
        if (C.seen[J.counter]) {
            return true
        }
        C.seen[J.counter] = true;
        return false
    }

    function I(M) {
        var P = document;
        var Q = navigator;
        var J = window;
        var L = screen;
        M._cookie = 1;
        if (!P.cookie) {
            P.cookie = k + "_test=1; path=/";
            M._cookie = P.cookie ? 1 : 0
        }
        if (parent != J) {
            try {
                M._referrer = parent.document.referrer || ""
            } catch (O) {}
        }
        if (M._referrer || M._referrer == "") {
            M._frame_referrer = P.referrer || ""
        } else {
            M._referrer = P.referrer || ""
        }
        M._location = J.location.href;
        M._title = P.title;
        M._o_location = M._i_location = M._location;
        M._o_referer = M._i_referer = M._referer;
        M._o_title = M._i_title = M._title;
        M._frame = (parent.frames && parent.frames.length > 0) ? 1 : 0;
        M._flash = "";
        if (Q.plugins && Q.plugins["Shockwave Flash"]) {
            M._flash = Q.plugins["Shockwave Flash"].description.split(" ")[2]
        } else {
            if (J.ActiveXObject) {
                for (var K = 10; K >= 2; K--) {
                    try {
                        var N = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + K);
                        if (N) {
                            M._flash = K + ".0";
                            break
                        }
                    } catch (O) {}
                }
            }
        } if (L.colorDepth) {
            M._color_depth = L.colorDepth
        } else {
            if (L.pixelDepth) {
                M._color_depth = L.pixelDepth
            }
        } if (L.width && L.height) {
            M._screen = L.width + "x" + L.height
        }
        M._java_enabled = (Q.javaEnabled() ? "Y" : "N");
        M._html5 = i();
        M._part = c(M);
        M._protocol = P.location.protocol;
        M._url = ((M._protocol == "https:") ? "https://" : "http://") + e;
        if (M.group) {
            M._url += "/c/" + M.group
        } else {
            M._url += "/cnt"
        }
        M._url += "?cid=" + M.counter
    }

    function i() {
        var K = "",
            L, J;
        J = !! window.HTMLCanvasElement;
        K += J ? "1" : "0";
        J = (navigator && navigator.geolocation);
        K += J ? "1" : "0";
        J = false;
        try {
            J = window.localStorage
        } catch (L) {}
        K += J ? "1" : "0";
        J = !! window.HTMLVideoElement;
        K += J ? "1" : "0";
        J = !! window.HTMLAudioElement;
        K += J ? "1" : "0";
        J = !! window.performance;
        K += J ? "1" : "0";
        return K
    }

    function z(J) {
        var K = J.queue = J.queue || [];
        K.opts = J;
        K.push = f;
        K.process = G;
        K.fn = v;
        K.push()
    }

    function g(J) {
        var K = J.plugins = J.plugins || [];
        K.push = f;
        K.process = G;
        K.fn = function (L) {
            return t(J, L)
        }
    }

    function v(K) {
        var J = this.opts;
        if (J.plugins.length > 0) {
            return false
        }
        if (typeof (K) == "string") {
            K = {
                url: K
            }
        }
        if (K.action == "data") {
            return s(J, K)
        } else {
            return n(J, K)
        }
    }

    function s(K, J) {
        K._part = c(K, J);
        K.pagelevel = 6;
        j(K, 1);
        return true
    }

    function t(L, K) {
        var M, N, J;
        if (K.fn) {
            return K.fn(L, K)
        }
        J = K.plugin;
        M = C.plugins[J] = C.plugins[J] || {};
        if (M.loaded) {
            return M.fn(L, K)
        }
        if (!M.loading) {
            M.loading = true;
            N = K.src || "//" + e + "/plugins/" + J + ".js";
            o(N)
        }
        return false
    }

    function n(L, K) {
        var J;
        if (!K || !K.url) {
            return true
        }
        if (K.url.charAt(0) == "/") {
            K.url = document.location.protocol + "//" + document.location.host + K.url
        }
        if (K.referrer && K.referrer.charAt(0) == "/") {
            K.referrer = document.location.protocol + "//" + document.location.host + K.referrer
        }
        L._referrer = K.referrer || L._o_location;
        L._title = K.title || L._o_title;
        L._location = K.url;
        L._part = c(L, K);
        L._o_location = L._location;
        L._o_title = L._title;
        L.pagelevel = J;
        j(L, 0);
        return true
    }

    function y(K) {
        var J;
        K._location = K._i_location;
        K._referer = K._i_referer;
        K._title = K._i_title;
        K._part = c(K);
        K.pagelevel = J;
        j(K, 0);
        return true
    }

    function c(M, L) {
        var K, N, J;
        L = L || {};
        K = L.part || M.part;
        if (K) {
            K = K.replace(/^\s+/, "").replace(/\s+$/, "")
        }
        if (M.vars) {
            N = {};
            for (J in M.vars) {
                N[J] = M.vars[J]
            }
        }
        if (L.vars) {
            N = N || {};
            for (J in L.vars) {
                N[J] = L.vars[J]
            }
        }
        if (N && K) {
            N.part = K
        }
        if (N) {
            return r(N)
        }
        return K
    }

    function u(K, J, L) {
        var M = ((typeof (K.pagelevel) != "undefined") ? "&p=" + K.pagelevel : "") + "&c=" + K._cookie + "&fr=" + K._frame + "&fl=" + B(K._flash) + "&px=" + K._color_depth + "&wh=" + K._screen + "&j=" + K._java_enabled + "&t=" + (new Date()).getTimezoneOffset() + "&h5=" + K._html5;
        if (!K.skip_url) {
            M += "&pg=" + B(w(K._location, 2048 / L)) + "&r=" + B(w(K._referrer, 2048 / L));
            if (K._frame_referrer) {
                M += "&r1=" + B(w(K._frame_referrer, 2048 / L))
            }
            if (!J && L < 2) {
                M += "&title=" + B(w(K._title))
            }
        }
        if (K._part) {
            M += "&partname=" + B(K._part)
        }
        return M
    }

    function j(M, K) {
        var L, N, J;
        for (L = 1; L < 4; L++) {
            N = u(M, K, L);
            if (N.length < 1800) {
                break
            }
        }
        J = new Image();
        J.src = M._url + N + "&rn=" + Math.random();
        J.onload = function () {
            return
        }
    }

    function m(M) {
        var K, J, L;
        if (typeof (M.image) == "undefined" && typeof (M.image_url) == "undefined") {
            return
        }
        K = document.getElementById(k + M.counter);
        if (!K) {
            if (typeof (M._onload_set) == "undefined") {
                M._onload_set = true;
                b(window, "load", function () {
                    m(M)
                })
            }
            return
        }
        if (typeof (M.image_url) == "undefined") {
            if (M.image < 1000) {
                M.image_url = "://" + l + "/i/" + M.image + ".gif";
                if (M.color) {
                    M.image_url += "?tc=" + M.color
                }
            } else {
                M.image_url = "://" + l + "/digits?cid=" + M.counter + "&ls=0&ln=" + M.image;
                if (M.color) {
                    M.image_url += "&tc=" + M.color
                }
            }
        }
        if (M.image_url.substring(0, 1) == ":") {
            M.image_url = "http" + (("https:" == M._protocol) ? "s" : "") + M.image_url
        }
        J = document.createElement("a");
        J.target = "_blank";
        J.href = "http://" + D + "/site/" + M.counter;
        L = document.createElement("img");
        L.alt = A;
        L.border = 0;
        L.src = M.image_url;
        J.appendChild(L);
        K.appendChild(J)
    }

    function q(J) {
        if (J.track_links == "none") {
            J.track_links = null
        }
        if (J.track_links || J.track_class) {
            b(window, "load", function () {
                h(J, J._url)
            })
        }
        return true
    }

    function h(L, J) {
        var K = (navigator.appVersion.indexOf("MSIE") != -1) ? "click" : "mousedown";
        b(document.body, K, function (M) {
            if (!M) {
                M = window.event
            }
            H(M, L, J)
        })
    }

    function H(P, N, L) {
        var M;
        if (P.target) {
            M = P.target
        } else {
            if (P.srcElement) {
                M = P.srcElement
            }
        } if (M.nodeType == 3) {
            M = M.parentNode
        }
        var O = M.tagName.toString().toLowerCase();
        while (M.parentNode && M.parentNode.tagName && ((O != "a" && O != "area") || !M.href)) {
            M = M.parentNode;
            O = M.tagName.toString().toLowerCase()
        }
        if (!M.href) {
            return
        }
        if (N.track_class) {
            var J = M.className.split("s");
            for (var K = 0; K < J.length; K++) {
                if (J[K] == N.track_class) {
                    N._referrer = document.location.href;
                    N._location = M.href;
                    N.pagelevel = 3;
                    j(N, 1);
                    return
                }
            }
        }
        if (!N.track_links || (N.track_links == "ext" && window.location.hostname == M.hostname)) {
            return
        }
        N._referrer = document.location.href;
        N._location = M.href;
        N.pagelevel = 3;
        j(N, 1)
    }

    function b(L, J, K) {
        if (L.addEventListener) {
            L.addEventListener(J, K, false)
        } else {
            if (L.attachEvent) {
                L.attachEvent("on" + J, K)
            }
        }
    }

    function w(K, J) {
        if (!K) {
            return K
        }
        if (!J) {
            J = 250
        }
        if (K.length > J) {
            var L = K.indexOf("?");
            if (L != -1) {
                K = K.slice(0, L)
            }
        }
        if (K.length > J) {
            K = K.substring(0, J)
        }
        return K
    }

    function B(M) {
        if (typeof (encodeURIComponent) == "function") {
            return encodeURIComponent(M)
        }
        var N = "";
        var K = M.length;
        for (var L = 0; L < K; L++) {
            var J = M.charCodeAt(L);
            if (J < 128) {
                N += escape(M.charAt(L));
                continue
            }
            J = J.toString(16);
            N += "%u" + a(J.toUpperCase(), 4, "0")
        }
        return N
    }

    function a(O, J, N) {
        var M = O.length;
        if (M >= J) {
            return O
        }
        var L = J - M;
        for (var K = 0; K < L; K++) {
            O = N + O
        }
        return O
    }

    function r(K) {
        var J, M, N = [],
            L, P, O = {};
        switch (typeof (K)) {
        case "number":
        case "boolean":
        case "null":
            return isFinite(K) ? String(K) : "null";
        case "string":
            M = "";
            for (L = 0; L < K.length; L++) {
                P = K.charAt(L);
                if (P < " " || P == ":" || P == "\\") {
                    P = P.charCodeAt(0).toString(16);
                    M += "\\x" + a(P, 2, "0")
                } else {
                    M += P
                }
            }
            return M;
        case "object":
            if (!K) {
                return "null"
            }
            for (J in K) {
                if (K[J] !== O[J]) {
                    M = r(K[J]);
                    if (M) {
                        N[N.length] = r(J) + ":" + M
                    }
                }
            }
            return ":" + N.join(":");
        default:
            return ""
        }
    }

    function o(N) {
        var M = document,
            L = document.location.protocol,
            J, K;
        J = M.createElement("script");
        J.async = true;
        J.type = "text/javascript";
        J.src = ("https:" == L ? "https:" : "http:") + N;
        K = M.getElementsByTagName("script")[0];
        K.parentNode.insertBefore(J, K)
    }

    function f() {
        var J;
        for (J = 0; J < arguments.length; J++) {
            this[this.length] = arguments[J]
        }
        this.process()
    }

    function G() {
        var K, J, L;
        for (K = 0; K < this.length; K++) {
            if (!this.fn(this[K])) {
                break
            }
        }
        for (J = 0; K < this.length; J++, K++) {
            this[J] = this[K]
        }
        this.length = J;
        if (this.fnpost) {
            this.fnpost()
        }
    }

    function p() {
        var J = C;
        if (J.plugins) {
            return
        }
        J.plugins = {};
        J.seen = {};
        J.counters = [];
        J.push = f;
        J.process = G;
        J.fn = function (K) {
            if (K.action == "plugin.loaded") {
                this.plugins[K.plugin].loaded = true;
                this.plugins[K.plugin].fn = K.fn
            }
            if (K.action == "counter") {
                if (F(K)) {
                    this.counters[this.counters.length] = K
                }
            }
            return true
        };
        J.fnpost = function () {
            var K, L;
            for (K = 0; K < this.counters.length; K++) {
                L = this.counters[K];
                L.plugins.push();
                L.queue.push()
            }
            return true
        };
        J.push()
    }

    function x() {
        var J = window[k];
        while (J) {
            J.action = "counter";
            C.push(J);
            J = J.next
        }
        window[k] = J
    }
    p();
    x()
})();