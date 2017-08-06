Object.defineProperty(Element.prototype, 'y', {
    get: function() {
        return this.offsetTop + (this.offsetParent ? this.offsetParent.y : 0);
    }
});

Object.defineProperty(Element.prototype, 'x', {
    get: function() {
        return this.offsetLeft + (this.offsetParent ? this.offsetParent.x : 0);
    }
});

function getScroll() {
    return {
        top: window.pageYOffset || document.documentElement.scrollTop,
        left: window.pageXOffset || document.documentElement.scrollLeft
    }
}
/**
 * @summary check if the string is a valid hex format string.
 *
 * @param string $str 
 *      the string will be tested.
 *
 * @return boolean 
 *      if the $str is a valid hex string then return true, otherwise, return false.
 *      A valid hex string only contains 0-9, a-z, A-Z and space.
 */
function isValidHex(str) {
    // check the str by regular expression
    return str.match(/^[\d a-f]*$/i);
}

function isValidInt(str) {
    return str.match(/^\d+$/);
}

function initialize() {
    vars.state_s.innerHTML = "";
    vars.state_i.innerHTML = 0;
    vars.state_j.innerHTML = 0;
    vars.cipherText.innerHTML = "";
}

function isValidASCII(str) {
    // check the str by regular expression
    return /^[\x00-\x7F]*$/.test(str);
}

function getSendMode() {
    var radios = document.getElementsByName('mode');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}

function getFormat(name) {
    var radios = document.getElementsByName(name);

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value.toLowerCase();
        }
    }
}

function isOVmodeHex() {
    return getFormat('s-ov-format') === HEX_STR
}

function is_C_OVmodeHex() {
    return getFormat('c-ov-format') === HEX_STR
}

function isHexMode() {
    return getFormat('format') === HEX_STR
}

function isASCIIMode() {
    return getFormat('format') === ASCII_STR
}

function dismissToolTip(toolTip) {
    toolTip.style.visibility = "hidden";
    toolTip.style.opacity = 0;
}

function updateInputSize() {
    if (isASCIIMode()) {
        vars.input_size.value = vars.input.value.length;
    } else {
        vars.input_size.value = Math.ceil(vars.input.value.replace(/\s/g, '').length / 2);
    }
}

function onValidInput() {
    updateInputSize();
    vars.btn_g_packet.disabled = false;
    vars.btn_d_packet.disabled = true;
    vars.btn_g_message.disabled = true;
}

function onInvalidInput() {
    vars.btn_g_packet.disabled = true;
    vars.btn_d_packet.disabled = false;
    vars.btn_g_message.disabled = false;
}

function handleOVChangeEvent(e) {
    if (isOVmodeHex()) {
        if (!isValidHex(e.target.value)) {
            onInvalidInput();
            showToolTip(e.target, vars.toolTipInvalidInput);
        } else {
            dismissToolTip(vars.toolTipInvalidInput);
            vars.c_offsetValue.value = e.target.value;
            vars.offset = hexStrToInt(e.target.value);
            vars.ra_c_ov_hex.checked = true;
            onValidInput();
        }
    } else {
        if (!isValidInt(e.target.value)) {
            onInvalidInput();
            showToolTip(e.target, vars.toolTipInvalidInt);
        } else {
            dismissToolTip(vars.toolTipInvalidInt);
            vars.c_offsetValue.value = e.target.value;
            vars.offset = intStrToInt(e.target.value);
            vars.ra_c_ov_int.checked = true;
            onValidInput();
        }
    }
}

function handle_C_OVChangeEvent(e) {
    if (is_C_OVmodeHex()) {
        if (!isValidHex(e.target.value)) {
            vars.btn_d_packet.disabled = true;
            vars.btn_g_message.disabled = true;
            showToolTip(e.target, vars.toolTipInvalidInput);
        } else {
            dismissToolTip(vars.toolTipInvalidInput);
            vars.c_offset = hexStrToInt(e.target.value);
            vars.btn_d_packet.disabled = false;
            vars.btn_g_message.disabled = true;
        }
    } else {
        if (!isValidInt(e.target.value)) {
            vars.btn_d_packet.disabled = true;
            vars.btn_g_message.disabled = true;
            showToolTip(e.target, vars.toolTipInvalidInt);
        } else {
            dismissToolTip(vars.toolTipInvalidInt);
            vars.c_offsetValue.value = e.target.value;
            vars.btn_d_packet.disabled = false;
            vars.btn_g_message.disabled = true;
        }
    }
}

function handelInputEvent(e) {
    vars.btn_e_packet.disabled = true;
    if (isASCIIMode()) {
        if (!isValidASCII(e.target.value)) {
            onInvalidInput();
            showToolTip(e.target, vars.toolTipInvalidASCII);
        } else {
            dismissToolTip(vars.toolTipInvalidASCII);
            onValidInput();
        }
    } else {
        if (!isValidHex(e.target.value)) {
            onInvalidInput();
            showToolTip(e.target, vars.toolTipInvalidInput);
        } else {
            dismissToolTip(vars.toolTipInvalidInput);
            onValidInput();
        }
    }
}

function onInput(e) {
    if (e.target === vars.input) {
        handelInputEvent(e);
        return;
    } else if (e.target === vars.key) {
        vars.c_key.value = e.target.value;
    } else if (e.target === vars.offsetValue) {
        handleOVChangeEvent(e);
        return;
    } else if (e.target === vars.data_size) {
        vars.btn_e_packet.disabled = true;
    } else if (e.target === vars.c_offsetValue) {
        handle_C_OVChangeEvent(e);
        return;
    }

    if (!isValidHex(e.target.value)) {
        showToolTip(e.target, vars.toolTipInvalidInput);
    } else {
        dismissToolTip(vars.toolTipInvalidInput);
    }
}


function shuffle(arr) {
    var result = arr.slice(0);

    var len = arr.length;
    var random, temp;
    for (var i = 0; i < len; i++) {
        random = Math.random() * len | 0;
        temp = result[i];
        result[i] = result[random];
        result[random] = temp;
    }
    return result;
}

function setSequence(arr, seq) {
    var result = [];
    var len = seq.length;

    for (var i = 0; i < len; i++) {
        result.push(arr[seq[i]]);
    }

    len = arr.length;

    for (var i = 0; i < len; i++) {
        if (seq.indexOf(i) === -1) {
            result.push(arr[i]);
        }
    }
    return result;
}

function getInput(size) {
    var result = '';
    for (var i = 0; i < size; i++) {
        result += INPUT_100;
    }
    return result
}

function caseMode(seq) {
    vars.r_packets = setSequence(vars.e_packets, seq);
}

function case4change() {
    if (vars.ra_case4.checked) {
        vars.btn_send.disabled = false;
    }
}

function case4() {
    vars.ra_ascii.checked = true;
    vars.input.value = getInput(18);
    vars.data_size.value = DATA_LEN;
    updateInputSize();
    btn_g_packet();
    btn_e_packet();
    vars.r_packets = vars.e_packets.slice(0);
}
/**
 * @summary this a callback function. 
 *      Everytime, there is a "click" event on "send" button, this function will be invoked.
 *
 */
function btn_send() {
    if (DEBUG) {
        console.log("send button is clicked");
    }

    var mode = getSendMode();

    switch (mode) {
        default:
            case 'random':
            // shuffle the packets, to simulate real communication.
            vars.r_packets = shuffle(vars.e_packets);
        break;
        case 'case-1':
                caseMode([0, 1, 2, 3]);
            break;
        case 'case-2':
                caseMode([1, 0, 3, 2]);
            break;
        case 'case-3':
                caseMode([3, 2, 1, 0]);
            break;
        case 'case-4':
                case4();
            break;
    }

    showPackets(vars.c_body, vars.r_packets);
    vars.btn_d_packet.disabled = false;
    vars.btn_g_packet.disabled = false;
    vars.btn_e_packet.disabled = false;
    vars.c_status.innerHTML = 'Received';
}

function showToolTip(target, toolTip, time) {
    var height = toolTip.offsetHeight;
    var x = target.x + (target.offsetWidth - toolTip.offsetWidth) / 2;
    var y = target.y - height - 5; // 5 is the arrow height
    toolTip.style.visibility = "visible";
    toolTip.style.opacity = 1;
    toolTip.style.left = x + 'px';
    toolTip.style.top = y + 'px';

    if (time !== undefined) {
        window.setTimeout(function() { dismissToolTip(toolTip); }, time);
    }
}

function btn_e_packet() {
    initializeState(vars.state_A, toHexArray(vars.key.value));

    if (vars.packets === undefined) {
        console.log("Generate packets first!");
        showToolTip(vars.btn_g_packet, vars.toolTipGeneratePackets);
        return;
    }
    vars.e_packets = encryptPackets(vars.packets);
    showPackets(vars.e_body, vars.e_packets);
    vars.btn_send.disabled = false;
    if (vars.e_packets.length < 4) {
        vars.ra_random.checked = true;
        vars.ra_case1.disabled = true;
        vars.ra_case2.disabled = true;
        vars.ra_case3.disabled = true;
    } else {
        vars.ra_case1.disabled = false;
        vars.ra_case2.disabled = false;
        vars.ra_case3.disabled = false;
    }
}

function showPackets(div, packets) {
    div.innerHTML = '';
    var len = packets.length;
    for (var i = 0; i < len; i++) {
        var row = document.createElement('div')
        var p = packets[i];
        row.innerHTML = '<input class="sc" type="text" value="' + toHexStr(p.sc) + '"></span> ' +
            '<input class="data mono" type="text" value="' + toHexStr(p.data) + '"></span>' +
            '<input class="hv mono" type="text" value="' + toHexStr(p.hv) + '"></span>';
        row.className = 'row fadeable';
        div.appendChild(row)
    }

    var children = div.children;
    for (var i = 0; i < children.length; i++) {
        window.setTimeout((function(x) {
            return function() {
                if (children[x] !== undefined) {
                    children[x].className = 'row fade-in';
                }
            };
        })(i), i * 100);
    }
}

function btn_g_packet() {
    dismissToolTip(vars.toolTipGeneratePackets);
    var message = vars.input.value;

    if (isHexMode()) {
        if (isValidHex(message)) {
            message = toHexArray(message);
        } else {
            showToolTip(vars.input, vars.toolTipInvalidInput)
            return;
        }
    } else {
        if (isValidASCII(message)) {
            message = ASCIItoHexArray(message);
        } else {
            showToolTip(vars.input, vars.toolTipInvalidASCII)
            return;
        }
    }

    vars.btn_e_packet.disabled = false;

    vars.packets = toPackets(message, parseInt(vars.data_size.value));

    if (DEBUG) {
        console.log("message:" + message);
        console.log("message:" + vars.packets);
    }

    vars.e_head.style.visibility = "visible";
    showPackets(vars.e_body, vars.packets);
}

function btn_d_packet() {
    initializeState(vars.state_B, toHexArray(vars.c_key.value));
    vars.SC_B = 0;

    vars.d_packets = decryptPackets(vars.r_packets);
    showPackets(vars.c_body, vars.d_packets);

    vars.c_status.innerHTML = 'Decrypted';
    vars.btn_check_hv.disabled = false;
}

function inputModeChange(e) {
    vars.input.value = '';
    vars.input_size.value = '';
    vars.btn_send.disabled = true;
    vars.btn_g_packet.disabled = true;
    vars.btn_e_packet.disabled = true;
    vars.e_body.innerHTML = '';
}

// arr is byte[]
function removePad(arr) {
    var len = arr.length;
    var count = 0;
    for (var i = len - 1; i > 0; i--) {
        if (arr[i] === 0) {
            count++;
        }
    }

    if (count > 0) {
        return arr.slice(0, -1 - count);
    } else {
        return arr;
    }
}

function btn_g_message() {
    vars.o_packets = sortPackets(vars.d_packets);
    var arr = [];
    vars.o_packets.forEach(function(p) {
        arr = arr.concat(p.data);
    });

    var orginal = '';
    arr = removePad(arr);

    if (isHexMode()) {
        orginal = toHexStr(arr);
    }

    if (isASCIIMode()) {
        orginal = toASCIIStr(arr)
    }

    vars.message.value = orginal;

    vars.message.className = 'fadeable';
    setTimeout(function() {
        vars.message.className = 'fade-in';
    }, 100);
}

function onRadio_ov(e) {
    var target = e.target;
    if (target === vars.ra_s_ov_hex) {
        var ov = vars.offsetValue;
        ov.value = intStrToHexStr(ov.value);
        dismissToolTip(vars.toolTipInvalidInt);
    } else if (target === vars.ra_s_ov_int) {
        var ov = vars.offsetValue;
        ov.value = hexStrToInt(ov.value);
        dismissToolTip(vars.toolTipInvalidInput);
    } else if (target === vars.ra_c_ov_hex) {
        var ov = vars.c_offsetValue;
        ov.value = intStrToHexStr(ov.value);
        dismissToolTip(vars.toolTipInvalidInt);
    } else if (target === vars.ra_c_ov_int) {
        var ov = vars.c_offsetValue;
        ov.value = hexStrToInt(ov.value);
        dismissToolTip(vars.toolTipInvalidInput);
    }
}

function btn_check_hv(e) {
    var packetError = false;
    var rows = [];
    var row;
    vars.d_packets.forEach(function(p) {
        row = {};
        row.received = p.hv;
        row.calculated = calcHV(p.sc, p.data, vars.c_offset);
        row.isMatch = isSameArray(row.received, row.calculated);
        if (!row.isMatch) {
            packetError = true;
        }
        rows.push(row);
    });

    showHV(rows)

    if (!packetError) {
        vars.btn_g_message.disabled = false;
    } else {
        vars.btn_g_message.disabled = true;
    }
}

function toIcon(bool) {
    if (bool) {
        return '&#10004;';
    } else {
        return '&#10007;';
    }
}

function showHV(rows) {
    var div = vars.hv_body;
    div.innerHTML = '';
    var len = rows.length;
    var row, data;
    for (var i = 0; i < len; i++) {
        row = document.createElement('div')
        data = rows[i];
        row.innerHTML = '<input class="hv" type="text" value="' + toHexStr(data.received) + '"></span> ' +
            '<input class="hv mono" type="text" value="' + toHexStr(data.calculated) + '"></span>' +
            '<input class="match" type="text" value="' + toIcon(data.isMatch) + '"></span>';
        row.className = 'row fadeable';
        div.appendChild(row)
    }

    var children = div.children;
    for (var i = 0; i < children.length; i++) {
        window.setTimeout((function(x) {
            return function() {
                if (children[x] !== undefined) {
                    children[x].className = 'row fade-in';
                }
            };
        })(i), i * 100);
    }
}
/**
 *  initialize global variables $vars
 */
document.addEventListener("DOMContentLoaded", function() {
    vars.toolTipInvalidInput = document.getElementById("invalidInput");
    vars.toolTipInvalidASCII = document.getElementById("invalidASCII");
    vars.toolTipGeneratePackets = document.getElementById("generate-packets");
    vars.toolTipInvalidInt = document.getElementById("invalidInt");

    vars.ra_ascii = document.getElementById("ra-ascii");
    vars.ra_hex = document.getElementById("ra-hex");
    vars.input = document.getElementById("input");
    vars.key = document.getElementById("key");
    vars.input_size = document.getElementById("input-size");
    vars.offsetValue = document.getElementById("offsetValue");
    vars.data_size = document.getElementById("data-size");
    vars.btn_g_packet = document.getElementById("btn-g-packet");
    vars.btn_g_packet.addEventListener("click", btn_g_packet);
    vars.btn_e_packet = document.getElementById("btn-e-packet");
    vars.btn_e_packet.addEventListener("click", btn_e_packet);

    vars.e_head = document.getElementById("e-head");
    vars.e_body = document.getElementById("e-body");
    vars.c_head = document.getElementById("c-head");
    vars.c_body = document.getElementById("c-body");

    vars.state_A = {}; // sender's state inculding state array, i and j.

    vars.btn_send = document.getElementById("btn-send");
    vars.btn_send.disabled = true;

    vars.c_status = document.getElementById("c-status");
    vars.ra_random = document.getElementById("ra-random");
    vars.ra_case1 = document.getElementById("ra-case1");
    vars.ra_case2 = document.getElementById("ra-case2");
    vars.ra_case3 = document.getElementById("ra-case3");
    vars.ra_case4 = document.getElementById("ra-case4");
    vars.c_key = document.getElementById("c-key");
    vars.c_offsetValue = document.getElementById("c-offsetValue");

    vars.btn_d_packet = document.getElementById("btn-d-packet");
    vars.btn_g_message = document.getElementById("btn-g-message");

    vars.state_B = {}; // recipient's state inculding state array, i and j.
    vars.message = document.getElementById("message");

    vars.ra_s_ov_hex = document.getElementById("ra-s-ov-hex");
    vars.ra_s_ov_int = document.getElementById("ra-s-ov-int");
    vars.ra_c_ov_hex = document.getElementById("ra-c-ov-hex");
    vars.ra_c_ov_int = document.getElementById("ra-c-ov-int");
    vars.btn_check_hv = document.getElementById("btn-check-hv");
    vars.hv_body = document.getElementById("hv-body");

    if (DEFAULT_INPUT_MODE === HEX_STR) {
        vars.ra_ascii.checked = false;
        vars.ra_hex.checked = true;
    } else {
        vars.ra_ascii.checked = true;
        vars.ra_hex.checked = false;
    }

    if (DEFAULT_OFFSET_MODE === HEX_STR) {
        vars.ra_s_ov_int.checked = false;
        vars.ra_s_ov_hex.checked = true;
        vars.ra_c_ov_int.checked = false;
        vars.ra_c_ov_hex.checked = true;
    } else {
        vars.ra_s_ov_int.checked = true;
        vars.ra_s_ov_hex.checked = false;
        vars.ra_c_ov_int.checked = true;
        vars.ra_c_ov_hex.checked = false;
    }

    vars.data_size.value = DEFAULT_DATA_SEG_SIZE;

    vars.ra_s_ov_hex.onchange = onRadio_ov;
    vars.ra_s_ov_int.onchange = onRadio_ov;
    vars.ra_c_ov_hex.onchange = onRadio_ov;
    vars.ra_c_ov_int.onchange = onRadio_ov;


    vars.btn_e_packet.disabled = true;
    vars.key.oninput = onInput;
    vars.key.value = DEFAULT_KEY;
    vars.c_key.value = DEFAULT_KEY;
    vars.key.onpropertychange = vars.key.onInput; // for IE8
    vars.input.oninput = onInput;
    vars.input.onpropertychange = vars.input.onInput; // for IE8
    vars.input.value = DEFAULT_INPUT;
    updateInputSize();
    vars.data_size.oninput = onInput;
    vars.data_size.onpropertychange = vars.input.onInput; // for IE8
    vars.offsetValue.oninput = onInput;
    vars.offsetValue.onpropertychange = vars.offsetValue.onInput; // for IE8
    vars.offsetValue.value = DEFAULT_OFFSET;
    vars.c_offsetValue.value = DEFAULT_OFFSET;
    vars.c_offsetValue.oninput = onInput;
    vars.c_offsetValue.onpropertychange = vars.c_offsetValue.onInput; // for IE8

    if (DEFAULT_OFFSET_MODE === HEX_STR) {
        vars.offset = parseInt(DEFAULT_OFFSET, HEX_SIZE);
    } else {
        vars.offset = parseInt(DEFAULT_OFFSET);
    }

    vars.c_offset = vars.offset;

    vars.btn_send.addEventListener("click", btn_send);
    vars.ra_ascii.onchange = inputModeChange;
    vars.ra_hex.onchange = inputModeChange;
    vars.ra_case4.onchange = case4change;

    vars.btn_d_packet.disabled = true;
    vars.btn_g_message.disabled = true;

    vars.btn_d_packet.onclick = btn_d_packet;
    vars.btn_g_message.onclick = btn_g_message;
    vars.btn_check_hv.onclick = btn_check_hv;
    vars.btn_check_hv.disabled = true;
});