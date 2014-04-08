function showHint(e, d, b) {
    hideHint();
    var c = document.getElementById(d);
    if (c != null) {
        var a = findPos(e);
        document.getElementById(d).style.top = a[0] + e.offsetHeight + 10;
        document.getElementById(d).style.left = a[1] + b;
        document.getElementById(d).style.display = "block"
    }
}

function hideHint() {
    $(".popup_hint").each(function () {
        if ($(this).attr("class") == "popup_hint") {
            $(this).hide()
        }
    });
    $(".popup_hint_or").each(function () {
        if ($(this).attr("class") == "popup_hint_or") {
            $(this).hide()
        }
    })
}

function findPos(f) {
    var l = curtop = 0;
    var a = 0;
    var b = 0;
    var c = navigator.userAgent.toLowerCase();
    var g;
    do {
        if (c.indexOf("opera") != -1 && parseFloat(c.substr(c.indexOf("opera") + 6, 3)) <= 9.6 && f.tagName == "TR") {
            var h = f.offsetParent;
            var k = h.childNodes;
            var e = 0;
            while (f != k[e]) {
                if (k[e].tagName == "TR") {
                    for (var d = 0; d < k[e].childNodes.length; d++) {
                        if (k[e].childNodes[d].tagName == "TD") {
                            g = k[e].childNodes[d].offsetHeight;
                            b += g;
                            break
                        }
                    }
                }
                e++
            }
            a = b
        } else {
            a = f.offsetTop
        }
        curtop += a;
        l += f.offsetLeft;
        f = f.offsetParent
    } while (f);
    return [curtop, l]
}

function _showProgressBox() {
    if (document.getElementById("formbox")) {
        document.getElementById("formbox").parentNode.style.filter = "Alpha(opacity=25), gray()";
        document.getElementById("formbox").style.MozOpacity = "0.25";
        document.getElementById("formbox").style.opacity = "0.25"
    }
    if (document.getElementById("progressbox")) {
        document.getElementById("progressbox").style.top = document.body.scrollTop + document.body.clientHeight / 2 - 100;
        document.getElementById("progressbox").style.left = document.body.offsetWidth / 2 - 250;
        document.getElementById("progressbox").style.visibility = "visible";
        _showhideAllSelects(document.getElementById("formbox"), "hidden")
    }
}

function _hideProgressBox() {
    if (document.getElementById("formbox")) {
        document.getElementById("formbox").parentNode.style.filter = "";
        document.getElementById("formbox").style.MozOpacity = "1";
        document.getElementById("formbox").style.opacity = "1"
    }
    if (document.getElementById("progressbox")) {
        document.getElementById("progressbox").style.visibility = "hidden"
    }
    if (document.getElementById("formbox")) {
        _showhideAllSelects(document.getElementById("formbox"), "visible")
    }
    return false
}

function _showhideAllSelects(b, a) {
    var c = b.getElementsByTagName("SELECT");
    for (i = 0; i < c.length; i++) {
        c[i].style.visibility = a
    }
}

function _showIHelp(e, c, d) {
    _hideIHelp();
    document.getElementById("ihelpBubble").className = "hint_corner_up";
    var b = document.getElementById(c);
    if (b != null) {
        document.getElementById("ihelpContent").innerHTML = b.innerHTML;
        var a = findPos(e);
        document.getElementById("ihelp").style.top = a[0] + e.offsetHeight - 2;
        document.getElementById("ihelp").style.left = a[1] + d;
        document.getElementById("ihelp").style.visibility = "visible"
    }
}

function _showIHelp2(g, e, f) {
    _hideIHelp();
    if (f < 0) {
        document.getElementById("ihelpBubble").className = "hint_corner_down"
    } else {
        document.getElementById("ihelpBubble").className = "hint_corner_up"
    }
    var d = document.getElementById(e);
    if (d != null) {
        document.getElementById("ihelpContent").innerHTML = d.innerHTML;
        var b = findPos(g);
        document.getElementById("ihelp").style.top = b[0] + g.offsetHeight + 10;
        document.getElementById("ihelp").style.left = b[1] + f;
        var a = document.body.clientWidth - (b[1] + f);
        if (a < 350) {
            var c = a - 30;
            if (c < 200) {
                c = 200
            }
            document.getElementById("ihelp").style.width = c
        } else {
            document.getElementById("ihelp").style.width = ""
        }
        document.getElementById("ihelp").style.visibility = "visible"
    }
}

function _hideIHelp() {
    document.getElementById("ihelp").style.visibility = "hidden"
}

function _showPopupMessage(e, b, d, c) {
    _hidePopupMessage();
    document.getElementById("ihelpBubble").style.zIndex = 300;
    if (d < 0) {
        document.getElementById("ihelpBubble").style.left = "130px"
    } else {
        document.getElementById("ihelpBubble").style.left = "5px"
    }
    document.getElementById("ihelpContent").innerHTML = b;
    var a = findPos(e);
    document.getElementById("ihelp").style.top = a[0] + e.offsetHeight - 2;
    document.getElementById("ihelp").style.left = a[1] + d;
    if (c != null && c != undefined) {
        document.getElementById("ihelp").style.width = c
    } else {
        document.getElementById("ihelp").style.width = "150px"
    }
    document.getElementById("ihelp").style.visibility = "visible"
}

function _hidePopupMessage() {
    document.getElementById("ihelp").style.visibility = "hidden"
};