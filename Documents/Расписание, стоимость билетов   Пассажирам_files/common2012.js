$(function () {
    $("#headLinks").prepend('<a href="//pdaticket.rzd.ru" title="Продажа билетов (мобильная версия)"><img src="/images/mobile.gif" alt="Продажа билетов (мобильная версия)"/></a>');
    if (window.PIE) {
        pie();
    }
});

function pie() {
    $(".greyBlock").each(function () {
        var wid = $(this).outerWidth();
        $(this).wrap('<div class="greyBlockWrap" style="width:' + wid + 'px;"/>');
    });
    $(".greyBlock, .greyBlockWrap, .brdr5").each(function () {
        PIE.attach(this);
    });
}

function flash_version() {
    var d, n = navigator,
        m, f = "Shockwave Flash";
    if ((m = n.mimeTypes) && (m = m["application/x-shockwave-flash"]) && m.enabledPlugin && (n = n.plugins) && n[f]) {
        d = n[f].description;
    } else {
        if (window.ActiveXObject) {
            try {
                d = (new ActiveXObject((f + "." + f).replace(/ /g, ""))).GetVariable("$version");
            } catch (e) {}
        }
    }
    return d ? d.replace(/\D+/, "").split(/\D+/) : [0, 0];
}

function checkFlashVersion() {
    if (flash_version()[0] >= 6) {
        $("#noFlashBlock").hide();
        $("#withFlashBlock").show();
    } else {
        $("#noFlashBlock").show();
        $("#withFlashBlock").hide();
    }
}

function addEvent(obj, evType, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evType, fn, false);
        return true;
    } else {
        if (obj.attachEvent) {
            var r = obj.attachEvent("on" + evType, fn);
            return r;
        } else {
            return false;
        }
    }
}
addEvent(window, "load", checkFlashVersion);

function showPopup() {
    $("#header").append($("#popup"));
    $("#popup").show(10);
}

function closePopup() {
    $("#popup").toggleClass("hidden").removeAttr("style");
}

function pollSubmit(ff) {
    var nm = "";
    var counter = 0;
    var counter_checked = 0;
    $(ff).find("input[type='radio']").each(function () {
        if (nm !== $(this).attr("name")) {
            counter++;
            nm = $(this).attr("name");
        }
        if ($(this).is(":checked")) {
            counter_checked++;
        }
    });
    if (counter !== counter_checked) {
        alert("Не на все вопросы выбран ответ!");
        return false;
    } else {
        return true;
    }
}

function toggleSearchForm(obj) {
    var table = $(obj).parent().find("table").get(0);
    if ($(table).is(":hidden")) {
        $(table).fadeIn("fast", function () {
            $(obj).find("span").text("Скрыть форму поиска");
            $(obj).removeClass("moveUpDiv");
        });
    } else {
        $(table).fadeOut("fast", function () {
            $(obj).find("span").text("Поиск");
            $(obj).addClass("moveUpDiv");
        });
    }
}

function toggleSearchForm2(obj, showlinkname, hidelinkname, classnm) {
    var table = $(obj).parent().find("table").get(0);
    if ($(table).is(":hidden")) {
        $(table).fadeIn("fast", function () {
            $(obj).find("span").text(hidelinkname);
            $(obj).removeClass(classnm);
        });
    } else {
        $(table).fadeOut("fast", function () {
            $(obj).find("span").text(showlinkname);
            $(obj).addClass(classnm);
        });
    }
}

function toggleSearchFormDiv(obj, divId) {
    var div = $("#" + divId);
    if ($(div).is(":hidden")) {
        $(div).fadeIn("fast", function () {
            $(obj).text("Скрыть форму поиска");
            $(obj).removeClass("moveUpDiv");
        });
    } else {
        $(div).fadeOut("fast", function () {
            $(obj).text("Поиск");
            $(obj).addClass("moveUpDiv");
        });
    }
}

function checkDatePeriod(StartDate, EndDate) {
    var start = document.getElementById(StartDate).value;
    var end = document.getElementById(EndDate).value;
    if (start !== "") {
        var start_date = checkDateFormat(start);
        if (!start_date) {
            alert("Неправильный формат даты");
            document.getElementById(StartDate).focus();
            return false;
        }
    }
    if (end !== "") {
        var end_date = checkDateFormat(end);
        if (!end_date) {
            alert("Неправильный формат даты");
            document.getElementById(EndDate).focus();
            return false;
        }
    }
    if (start_date && end_date) {
        var one_day = 1000 * 60 * 60 * 24;
        var days = Math.ceil((end_date.getTime() - start_date.getTime()) / (one_day));
        if (days < 0) {
            alert("Дата начала периода должна быть меньше даты окончания");
            return false;
        }
    }
    return true;
}

function checkDateFormat(dt) {
    var reg = /^(\d{2})[/\//\.\-]{1}(\d{2})[/\//\.\-]{1}(\d{4})$/;
    if (reg.test(dt)) {
        var res = reg.exec(dt);
        if (res[1] && res[1] !== false && res[1] !== "undefined") {
            day = res[1];
        }
        if (res[2] && res[2] !== false && res[2] !== "undefined") {
            month = res[2];
        }
        if (res[3] && res[3] !== false && res[3] !== "undefined") {
            year = res[3];
        }
        var depDate = new Date(year, month - 1, day);
    } else {
        return false;
    }
    return depDate;
}

function hideDef(obj, defaultValue) {
    var val = trimAll(obj.value);
    if (val == defaultValue) {
        obj.value = "";
        $(obj).removeClass("dimmed");
    }
}

function showDef(obj, defaultValue) {
    var val = trimAll(obj.value);
    if (val == "" || val == defaultValue) {
        obj.value = defaultValue;
        $(obj).addClass("dimmed");
    }
}

function trimAll(sString) {
    while (sString.substring(0, 1) == " ") {
        sString = sString.substring(1, sString.length);
    }
    while (sString.substring(sString.length - 1, sString.length) == " ") {
        sString = sString.substring(0, sString.length - 1);
    }
    return sString;
}

function clearRubric() {
    document.getElementById("rubricsField").value = "";
    document.getElementById("selectedRubricsName").innerHTML = "";
    document.getElementById("selectedRubricsName").style.display = "none";
    document.getElementById("refreshLink").style.display = "none";
    return false;
}

function chooseRubric(id, nm, formName) {
    var ff = window.opener.document.getElementById(formName);
    var dv = window.opener.document.getElementById("selectedRubricsName");
    var refresh = window.opener.document.getElementById("refreshLink");
    if (ff.rubrics) {
        ff.rubrics.value = id;
    } else {
        ff.cat.value = id;
    }
    dv.innerHTML = nm;
    dv.style.display = "block";
    refresh.style.display = "inline";
    self.close();
    return false;
}

function chooseFieldFromPopup(id, nm, formName, fieldId) {
    var ff = window.opener.document.getElementById(formName);
    var dv = window.opener.document.getElementById("selectedRubricsName");
    var refresh = window.opener.document.getElementById("refreshLink");
    var field = window.opener.document.getElementById(fieldId);
    field.value = id;
    dv.innerHTML = nm;
    dv.style.display = "block";
    refresh.style.display = "inline";
    self.close();
    return false;
}

function clearForm(formName) {
    var ff = document.forms[formName];
    for (var i = 0; i < ff.elements.length; i++) {
        if (ff.elements[i].type == "text") {
            ff.elements[i].value = "";
        }
        if (ff.elements[i].type == "select-one") {
            ff.elements[i].value = "";
        }
        if (ff.elements[i].type == "checkbox") {
            ff.elements[i].checked = false;
        }
        if (ff.elements[i].type == "radio") {
            ff.elements[i].value = "0";
            ff.elements[i].checked = false;
        }
    }
}

function changeClientTab(obj) {
    var ulId = $(obj).parent().attr("id");
    $("#" + ulId).find("li").each(function () {
        $(this).removeClass("current");
        var prefix = $(this).attr("id");
        $("#" + prefix + "_Output").hide();
    });
    var tab_id = $(obj).attr("id");
    $("#" + tab_id).addClass("current");
    $("#" + tab_id + "_Output").show();
}

function changeContentHint(obj, textDivId, Xoffset, text) {
    $(".popup_hint").hide();
    var srcDiv = $("#" + textDivId);
    if (srcDiv !== null) {
        var objxy = $(obj).offset();
        var objH = $(obj).outerHeight();
        $("#" + textDivId).css("top", objxy.top + objH + 11);
        $("#" + textDivId).css("left", objxy.left + Xoffset);
        $("#" + textDivId).find(".inner").html(text);
        $("#" + textDivId).show();
    }
}

function hideContentHint() {
    $(".popup_hint").each(function () {
        $(this).find(".inner").html("");
        $(this).hide();
    });
}

function checkFieldVal(field_id, mask, message) {
    var dt = document.getElementById(field_id).value;
    if (mask.test(dt)) {
        return true;
    } else {
        alert(message);
        return false;
    }
}

function computationHeightDiv(id1, id2, classH, n) {
    var ryDiv2 = $("#" + id1).height() + n;
    var ryDiv3 = $("#" + id2).height() + n;
    if (ryDiv2 > ryDiv3) {
        $("." + classH).css("height", ryDiv2);
    } else {
        $("." + classH).css("height", ryDiv3);
    }
}