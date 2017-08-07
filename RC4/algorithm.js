var DEBUG = false;
var HEX_STR = 'hex';
var ASCII_STR = 'ascii';
var vars = {}; // global variables
var SC_LEN = 4; // bytes
var DATA_LEN = 252; //bytes
var HV_LEN = 16; //bytes
var DEFAULT_KEY = 'AB CD EF 01 23 45 67 89 AB C2 01 72 00 35 88 57';
var DEFAULT_OFFSET = getOffset(DEFAULT_KEY); // hex string
var INPUT_100 = 'This was taken from the office by Jow, who had called on an average twice a day for this very paper.'
var HEX_20 = '01 23 45 67 89 AB CD EF 01 23 45 67 89 AB CD EF 01 23 45 67';
var HEX_100 = HEX_20 + HEX_20 + HEX_20 + HEX_20 + HEX_20;
var HEX_500 = HEX_100 + HEX_100 + HEX_100 + HEX_100 + HEX_100;
var DEFAULT_INPUT = HEX_500 + HEX_500;
var BLOCK_SIZE = 512; // bits
var L_SIZE = 2 // bytes equal to 16 bits.
var BYTE_SIZE = 8 // bits
var HEX_SIZE = 16 // bits
var DEFAULT_INPUT_MODE = 'hex';
var DEFAULT_OFFSET_MODE = 'hex';
var DEFAULT_DATA_SEG_SIZE = DATA_LEN;

/**
 * @summary get offset which is the last two number of $key mod 16
 *
 * @param string $key 
 *      a string repreting a decimal number. For example "123456789"
 *                      
 * @return string 
 *      hex format string which is the last two number of $key mod 16.
 *      e.g. $key = 23 456 789, then 89 mod 16 = 9. The returned string is '9'
 */
function getOffset(key) {
  var v = (parseInt(key.replace(/\s/g, '').slice(-2)) % 16).toString(16);
  return v;
}
/**
 * @summary Packet class
 *          int SC (4 bytes)
 *          byte[] Data Segment (252 bytes)
 *          byte[] HV (16 bytes )
 */
function Packet() {
  this.sc = 0;
  this.data = [];
  this.hv = [];
}
/**
 * @summary convert array to hex string.
 *
 * @param byte[] $array 
 *      an byte array. For example "[133,45,87]"
 * @param int $column 
 *      number of columns will be displayed.
 *                      
 * @return string 
 *      hex format string converted from each item in the $array. 
 *      For input [56,255], the returned value is "56 FF"
 */
function toHexStr(array, column) {
  var hexStr = "";
  for (var i = 0; i < array.length;) {
    var hex = array[i].toString(16);
    if (hex.length == 1) {
      hex = "0" + hex;
    }
    hexStr += hex + " ";
    i++;
    if (column !== undefined) {
      // every time it comes to the column number, then add a new line.
      if (i % column === 0) {
        // <br> is a new line in html
        hexStr += "<br>"
      }
    }
  }
  return hexStr.toUpperCase();
}

function toASCIIStr(array) {
  return String.fromCharCode.apply(null, array);
}

function hexStrToInt(str) {
  if (str.match(/^[\d a-f]*$/i)) {
    return parseInt(str.replace(/\s/g, ''), HEX_SIZE);
  } else {
    return 'NaN';
  }
}

function intStrToHexStr(str) {
  if (str.match(/^\d+$/i)) {
    return parseInt(str.replace(/\s/g, '')).toString(HEX_SIZE).toUpperCase();
  } else {
    return 'NaN';
  }
}

function intStrToInt(str) {
  return parseInt(str.replace(/\s/g, ''));
}
Packet.prototype.toString = function() {
  return "[SC:" + this.sc + ", DATA:" + this.data + ", HV:" + this.hv + "]\n";
}
/**
 * @summary convert string to hex array.
 *
 * @param string $hexStr 
 *      hex format string. For example "A1FC5D"
 *                      
 * @return byte[] 
 *      each item is byte value converted from string. 
 *      For input "56FF", the returned value is [56,255]
 */
function toHexArray(hexStr) {
  var hexArray = [];
  hexStr = hexStr.replace(/\s/g, '');
  if (hexStr.length % 2 !== 0) {
    hexStr = '0' + hexStr;
  }
  for (var i = 0; i < hexStr.length; i = i + 2) {
    var hex = hexStr[i] + hexStr[i + 1];
    hexArray.push(parseInt(hex, HEX_SIZE));
  }
  return hexArray;
}
// convert hex arry to int value
function toValue(arr) {
  return parseInt(toHexStr(arr).replace(/\s/g, ''), HEX_SIZE);
}

function isSameArray(a, b) {
  var a_len = a.length;
  var b_len = b.length;
  if (a_len === b_len) {
    for (var i = 0; i < a_len; i++) {
      if (a[i] !== b[i]) {
        console.log("i:" + i + " a[i]:" + a[i] + " b[i]:" + b[i]);
        return false;
      }
    }
    return true;
  } else {
    console.log("a_len:" + a_len);
    console.log("b_len:" + b_len);
  }
  return false;
}
/**
 * @summary convert ASCII to hex array. It keeps white spaces.
 */
function ASCIItoHexArray(str) {
  var hexArray = [];
  for (var i = 0; i < str.length; i++) {
    hexArray.push(str.charCodeAt(i));
  }
  return hexArray;
}
//padding: a single "1" bit || 0...0||L
function padBits(input) {
  var len = input.length;
  var lenArr = toArray(len, L_SIZE);
  var real = ((L_SIZE + len) * BYTE_SIZE + 1) % BLOCK_SIZE;
  var zero_size = BLOCK_SIZE - real;
  len = (zero_size + 1) / BYTE_SIZE;
  for (var i = 0; i < len; i++) {
    if (i === 0) {
      input.push(parseInt('10000000', 2));
    } else {
      input.push(0);
    }
  }
  return input.concat(lenArr);
}

function getBlocks(arr, size) {
  var b_size = size / BYTE_SIZE;
  var len = arr.length;
  var blocks = [];
  var block = [];
  for (var i = 0; i < len; i++) {
    block.push(arr[i]);
    if ((i + 1) % b_size === 0) {
      blocks.push(block);
      block = [];
    }
  }
  return blocks;
}

function PRGA_Star(len, s) {
  var j = 0,
    tmp, i;
  for (var index = 0; index < len; index++) {
    i = (index + 1) % 256;
    j = (j + s[i]) % 256;
    tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
  }
  return s;
}

function KSA_Star(m, s) {
  var j = 0;
  var tmp;
  for (var i = 0; i < 256; i++) {
    j = (j + s[i] + m[i % 64]) % 256;
    tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
  }
  return s;
}

function blockMod(m, v) {
  var len = m.length;
  var sum = 0;
  for (var i = 0; i < len; i++) {
    sum += m[i];
  }
  return sum % v;
}

function blockXOR(a, b) {
  var len = a.length;
  var result = [];
  for (var i = 0; i < len; i++) {
    result.push(a[i] ^ b[i]);
  }
  return result;
}

function collectLSB(arr, odd) {
  var len = arr.length;
  var count = BYTE_SIZE - 1;
  var tmp;
  var result = [];
  var byte = 0;
  for (var i = 0; i < len; i++) {
    if (odd) {
      if (i % 2 === 1) {
        continue;
      }
    }
    tmp = arr[i];
    tmp &= 1;
    tmp <<= count;
    byte |= tmp;
    if (count === 0) {
      count = BYTE_SIZE;
      result.push(byte);
      byte = 0;
    }
    count--;
  }
  return result;
}

function calcLen(m, offset) {
  var tmp = blockMod(m, 256);
  return (tmp === 0) ? offset : tmp;
}

function calcHV(sc, data, offset) {
  var input = sc.concat(data);
  // step 1 Append Padding Bits and Length, and Divide the Padded Message
  input = padBits(input);
  var blocks = getBlocks(input, BLOCK_SIZE);
  var block_len = blocks.length;
  // step 2
  var tmp;
  var m1 = blocks[0];
  var state_m1 = PRGA_Star(offset, KSA(m1));
  var len1 = calcLen(m1, offset);
  var state1 = PRGA_Star(len1, state_m1);
  var state = state1;
  var state_m;
  var m = m1;
  var len = len1;
  for (var k = 2; k <= block_len; k++) {
    m = blocks[k - 1];
    len = calcLen(m, offset);
    state_m = KSA_Star(m, state);
    state = PRGA_Star(len, state_m);
  }
  var state_n = state.slice(0);
  var hv = KSA(state);
  hv.s = hv;
  hv.i = 0;
  hv.j = 0;
  for (var i = 0; i < 256; i++) {
    hv = prga(hv.s, hv.i, hv.j);
  }
  hv = blockXOR(hv.s, state_n);
  hv = collectLSB(hv, true);
  return hv;
}

function getNullData(data_size) {
  var data = [];
  for (var i = 0; i < data_size; i++) {
    data.push(0);
  }
  return data;
}
// v: int value
// size: the length of hex array.
// return hex array
function toArray(v, size) {
  var arr = toHexArray(v.toString(16));
  var len = arr.length;
  var result = []
  if (len > size) {
    console.log("ERROR: value is bigger than size");
  } else {
    for (var i = 0; i < size - len; i++) {
      result.push(0);
    }
    return result.concat(arr);
  }
}
/**
 * @summary convert hex array to packets. 
 * If the size of the last packet is less than 252, then pad a 1 followed by as many 0 as necessary
 *
 * @param byte[] $message 
 *      int array. For example [32, 89]
 *                      
 * @return Packet[] 
 *      An Packet instance includes SC, data, and HV
 */
function toPackets(message, data_size) {
  var len = message.length;
  var packets = [];
  var packet = new Packet();
  packet.sc = toArray(0, SC_LEN);
  var count = 0;
  for (var i = 0; i < len; i++) {
    packet.data.push(message[i]);
    if ((i + 1) % data_size === 0) {
      packet.hv = calcHV(packet.sc, packet.data, vars.offset);
      packets.push(packet);
      packet = new Packet();
      count++;
      packet.sc = toArray(count, SC_LEN);
    }
  }
  len = packet.data.length;
  var real = (len + 1) % data_size;
  var zero_size = data_size - real;
  if (zero_size === data_size) {
    packet.data.push(1);
    packet.hv = calcHV(packet.sc, packet.data, vars.offset);
    packets.push(packet);
    var last_packet = new Packet();
    last_packet.sc = toArray(count + 1, SC_LEN);
    last_packet.data = getNullData(data_size);
    last_packet.hv = calcHV(last_packet.sc, last_packet.data, vars.offset);
    packets.push(last_packet);
  } else if (zero_size === data_size - 1) {
    var last_packet = new Packet();
    last_packet.sc = toArray(count, SC_LEN);
    last_packet.data = getNullData(data_size);
    last_packet.data[0] = 1;
    last_packet.hv = calcHV(last_packet.sc, last_packet.data, vars.offset);
    packets.push(last_packet);
  } else {
    packet.data.push(1);
    for (var i = 0; i < zero_size; i++) {
      packet.data.push(0);
    }
    packet.hv = calcHV(packet.sc, packet.data, vars.offset);
    packets.push(packet);
  }
  return packets
}
/**
 * @summary compute next RC4 state.
 *
 * @param int[] $S 
 *      the S array
 * @param int $i 
 *      the i value
 * @param int $j
 *      the j value
 *
 * @return state object 
 *      state object contains three members S, i and j.
 */
function prga(S, i, j) {
  i = (i + 1) % 256;
  j = (j + S[i]) % 256;
  // swap S[i], S[j]
  var tmp = S[i];
  S[i] = S[j];
  S[j] = tmp;
  return {
    s: S,
    i: i,
    j: j
  };
}
/**
 * @summary compute previous RC4 state.
 *
 * @param int[] $S 
 *      the S array
 * @param int $i 
 *      the i value
 * @param int $j
 *      the j value
 *
 * @return state object 
 *      state object contains three members S, i and j.
 */
function iprga(S, i, j) {
  // swap S[i], S[j]
  var tmp = S[i];
  S[i] = S[j];
  S[j] = tmp;
  j = (j - S[i] + 256) % 256;
  i = (i - 1 + 256) % 256;
  return {
    s: S,
    i: i,
    j: j
  };
}
/**
 * @summary according to the $key, compute internal state S
 *
 * @param byte[] $key 
 *      the key array.
 *
 * @return int[]  
 *      the internal array S
 */
function KSA(key) {
  var S = [];
  var T = [];
  var i = 0;
  var keyLength = key.length;
  for (i = 0; i < 256; i++) {
    S[i] = i;
    T[i] = key[i % keyLength];
  }
  var j = 0;
  for (i = 0; i < 256; i++) {
    j = (j + S[i] + T[i]) % 256;
    // swap(S[i],S[j])
    var tmp = S[i];
    S[i] = S[j];
    S[j] = tmp;
  }
  return S;
}

function initializeState(state, key) {
  state.s = KSA(key);
  state.i = 0;
  state.j = 0;
}
/**
 * @summary encrypt message byte. then push the ciphertext to the global value $vars.cipher
 *
 * @param byte $message 
 *      the plaintext byte value.
 *
 * @return byte ciphertext
 */
function encrypt(message) {
  var s = vars.state_A;
  s = prga(s.s, s.i, s.j);
  vars.state_A = s;
  var t = (s.s[s.i] + s.s[s.j]) % 256;
  return message ^ s.s[t];
}

function encryptArray(arr) {
  var cipher = [];
  arr.forEach(function(m) {
    cipher.push(encrypt(m))
  });
  return cipher;
}

function encryptPackets(packets) {
  var len = packets.length;
  var e_packets = [];
  for (var i = 0; i < len; i++) {
    var packet = new Packet();
    var o_packet = packets[i]; // original packet
    packet.sc = o_packet.sc;
    packet.data = encryptArray(o_packet.data);
    packet.hv = encryptArray(o_packet.hv);
    e_packets.push(packet);
  }
  return e_packets;
}

function decrypt(c) {
  var s = vars.state_B;
  s = prga(s.s, s.i, s.j);
  vars.state_B = s;
  var t = (s.s[s.i] + s.s[s.j]) % 256;
  return c ^ s.s[t];
}

function decryptArray(sc, arr) {
  var plaintext = [];
  sc = toValue(sc);
  if (sc > vars.SC_B) {
    var len = (sc - vars.SC_B) * arr.length;
    for (var i = 0; i < len; i++) {
      var s = vars.state_B;
      s = prga(s.s, s.i, s.j);
      vars.state_B = s;
    }
  }
  if (sc < vars.SC_B) {
    var len = (vars.SC_B - sc) * arr.length;
    for (i = 0; i < len; i++) {
      var s = vars.state_B;
      s = iprga(s.s, s.i, s.j);
      vars.state_B = s;
    }
  }
  vars.SC_B = sc;
  arr.forEach(function(c) {
    plaintext.push(decrypt(c));
  });
  vars.SC_B++;
  return plaintext;
}

function decryptPackets(packets) {
  var len = packets.length;
  var d_packets = [];
  var tmp = null;
  for (var i = 0; i < len; i++) {
    var packet = new Packet();
    var e_packet = packets[i]; // encrypted packet
    packet.sc = e_packet.sc;
    tmp = decryptArray(packet.sc, e_packet.data.concat(e_packet.hv));
    var data_size = e_packet.data.length;
    packet.data = tmp.slice(0, data_size);
    packet.hv = tmp.slice(data_size);
    d_packets.push(packet);
  }
  return d_packets;
}
/**
 * @summary the main RC4 function
 *
 * @param string or int[] $key 
 *      $key could be string or int[], it contains key information
 *
 * @param string or int[] $message 
 *      $message could be string or int[], it contains plaintext information
 *
 * @return string
 *      ciphertext in hex format.
 */
function rc4(key, message) {
  var S = [];
  if (typeof key === 'string') {
    // if key is string, then convert it to array.
    key = toHexArray(key);
  }
  if (typeof message === 'string') {
    // if message is string, then convert it to array.
    message = toHexArray(message);
  }
  if (DEBUG) {
    console.log("key:" + key);
    console.log("message" + message);
  }
  vars.state.s = KSA(key);
  vars.state.i = 0;
  vars.state.j = 0;
  var cipher = [];
  message.forEach(function(m) {
    vars.cipher.push(encrypt(m))
  });
  return toHexStr(cipher);
}

function sortPackets(packets) {
  var compare = function(a, b) { return toValue(a.sc) - toValue(b.sc); };
  var sorted = packets.slice(0);
  sorted.sort(compare);
  return sorted
}