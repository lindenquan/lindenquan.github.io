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

/**
 * @summary convert an array of unicode number to a string.
 *
 * @param int[] $array 
 *      an int array. For example "[65,66,67]"
 *                      
 * @return string 
 *      For input [65,66], the returned value is "AB"
 */
function toASCIIStr(array) {
  return String.fromCharCode.apply(null, array);
}

/**
 * @summary convert a hex format string to int number
 *
 * @param string $str 
 *      a hex format string. For example "4DEA"
 *                      
 * @return int 
 *      For input "A", the returned value is 10
 */
function hexStrToInt(str) {
  if (str.match(/^[\d a-f]*$/i)) {
    return parseInt(str.replace(/\s/g, ''), HEX_SIZE);
  } else {
    return 'NaN';
  }
}

/**
 * @summary convert a decimal format string to hex format string in uppercase
 *
 * @param string $str 
 *      a decimal format string. For example "123"
 *                      
 * @return string 
 *      For input "10", the returned value is "A"
 */
function intStrToHexStr(str) {
  if (str.match(/^\d+$/i)) {
    return parseInt(str.replace(/\s/g, '')).toString(HEX_SIZE).toUpperCase();
  } else {
    return 'NaN';
  }
}

/**
 * @summary convert a decimal format string to int number
 *
 * @param string $str 
 *      a decimal format string. For example "123"
 *                      
 * @return int 
 *      For input "10", the returned value is 10
 */
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

/**
 * @summary convert a byte array to the corresponding int value
 *
 * @param byte[] $arr 
 *      a byte array. For example [12,44,6]
 *                      
 * @return int 
 *      For input [1,1], the returned value is 17
 */
function toValue(arr) {
  return parseInt(toHexStr(arr).replace(/\s/g, ''), HEX_SIZE);
}

/**
 * @summary compare two array
 *
 * @param array $a 
 *      any array. For example [12,44,6]
 * @param array $b
 *      any array. 
 *                  
 * @return boolean 
 *      return true if a is equal to b in shallow comparison. otherwise, return false
 */
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
 *
 * @param string $str 
 *      hex format string. For example "AB9"
 *
 * @return byte[] 
 *      for input "message", return [109, 101, 115, 115, 97, 103, 101]
 */
function ASCIItoHexArray(str) {
  var hexArray = [];
  for (var i = 0; i < str.length; i++) {
    hexArray.push(str.charCodeAt(i));
  }
  return hexArray;
}

/**
 * @summary add padding bits
 *
 * @param byte[] $input
 *      a byte array the length of which is less than $BLOCK_SIZE in bits
 *      in this project $BLOCK_SIZE is 512 bits
 *
 * @return byte[] 
 *      padded byte array. padding rule a single "1" bit || 0...0||L
 *      The length of $L is 2 bytes.
 */
function padBits(input) {
  var len = input.length;
  var lenArr = toArray(len, L_SIZE);
  var real = ((L_SIZE + len) * BYTE_SIZE + 1) % BLOCK_SIZE;

  // the total number of zeros in bits
  var zero_size = BLOCK_SIZE - real;
  len = (zero_size + 1) / BYTE_SIZE;
  for (var i = 0; i < len; i++) {
    if (i === 0) {
      // add one 1 bit and seven 0 bits
      input.push(parseInt('10000000', 2));
    } else {
      input.push(0);
    }
  }
  return input.concat(lenArr);
}

/**
 * @summary convert a long byte array into an array of blocks
 *
 * @param byte[] $arr
 *      a byte array. for example: [1,2,3,4,5,6,7]
 *
 * @param size $size
 *      the size of a block in bits
 *
 * @return block[] 
 *     for input $arr=[1,2,3,4] $size=16, the output is [[1,2],[3,4]]
 */
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

/**
 * @summary perform PRGA* function
 *
 * @param int $len
 *      $len indicates how many times PRGA* runs
 *
 * @param byte[] $s
 *      the state array
 *
 * @return byte[] 
 *     after permuted array
 */
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

/**
 * @summary perform KSA* function
 *
 * @param byte[] $m
 *      a block array
 *
 * @param byte[] $s
 *      the state array
 *
 * @return byte[] 
 *     after permuted array
 */
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

/**
 * @summary calculate $m mod $v
 *
 * @param byte[] $m
 *      a block array as modulo
 *
 * @param int $v
 *      the modulus
 *
 * @return int 
 *     the remainder
 */
function blockMod(m, v) {
  var len = m.length;
  var sum = 0;
  for (var i = 0; i < len; i++) {
    sum += m[i];
  }
  return sum % v;
}

/**
 * @summary perform XOR operation on two blocks
 *
 * @param byte[] $a
 *      a block array
 *
 * @param byte[] $b
 *      another block array
 *
 * @return byte[] 
 *     the result byte array after XOR
 */
function blockXOR(a, b) {
  var len = a.length;
  var result = [];
  for (var i = 0; i < len; i++) {
    result.push(a[i] ^ b[i]);
  }
  return result;
}

/**
 * @summary collect last significant bits from blocks
 *
 * @param block[] $arr
 *      an array of blocks
 *
 * @param boolean $odd
 *      if $odd is true, collects LSB from odd number blocks only.
 *      if $odd is false, collects LSB from all blocks
 *
 * @return byte[] 
 *     the result byte array.
 */
function collectLSB(arr, odd) {
  var len = arr.length;
  var count = BYTE_SIZE - 1;
  var tmp;
  var result = [];
  var byte = 0;
  for (var i = 0; i < len; i++) {
    if (odd) {
      // if odd number then skip collecting.
      if (i % 2 === 1) {
        // since index starts from zero, if the index is a even number
        // the block is the odd number in sequence.
        continue;
      }
    }
    tmp = arr[i];
    tmp &= 1;
    tmp <<= count;
    byte |= tmp;
    if (count === 0) {
      // collect 8 bits
      count = BYTE_SIZE;
      result.push(byte);
      byte = 0;
    }
    count--;
  }
  return result;
}

/**
 * @summary calculate length used for PRGA*
 *
 * @param byte[] $m
 *      an array of block
 *
 * @param int $offset
 *      an offset value
 *
 * @return int 
 *     the result length.
 */
function calcLen(m, offset) {
  var tmp = blockMod(m, 256);
  return (tmp === 0) ? offset : tmp;
}

/**
 * @summary RC4-BHF function
 *
 * @param string $input
 *      an string of ASCII code
 *
 * @param int $offset
 *      an offset value
 *
 * @return string 
 *     the hash value in hex format.
 */
function calcHVASC(input, offset) {
  input = ASCIItoHexArray(input);
  return toHexStr(calcHV(input, [], offset), 100);
}

/**
 * @summary RC4-BHF function
 *
 * @param byte[] $sc
 *      sequence count array
 *
 * @param byte[] $data
 *      data array
 *
 * @param int $offset
 *      offset value
 *
 * @return byte[] 
 *     the hash value byte array.
 */
function calcHV(sc, data, offset) {
  var input = sc.concat(data);

  // step 1 Append Padding Bits and Length, and Divide the Padded Message
  input = padBits(input);
  var blocks = getBlocks(input, BLOCK_SIZE);
  var block_len = blocks.length;

  // step 2 Compression
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

  // step 3 output
  var state_n = state.slice(0);
  state = KSA(state);
  var s = {};
  s.s = state;
  s.i = 0;
  s.j = 0;

  for (var i = 0; i < 256; i++) {
    s = prga(s.s, s.i, s.j);
  }
  var streamkey = [];

  for (i = 0; i < 256; i++) {
    s = prga(s.s, s.i, s.j);
    streamkey.push(s.s[(s.s[s.i] + s.s[s.j]) % 256]);
  }
  // XORing STATE n with the last 256 bytes of the PRGA output
  var hv = blockXOR(streamkey, state_n);

  //collect last significant bit of each odd number block
  hv = collectLSB(hv, true);
  return hv;
}

/**
 * @summary get a byte array with each value 0
 *
 * @param int $data_size
 *      array size
 *
 * @return byte[] 
 *     array with the length of $data_size.
 */
function getNullData(data_size) {
  var data = [];
  for (var i = 0; i < data_size; i++) {
    data.push(0);
  }
  return data;
}

/**
 * @summary convert int value to hex array
 *
 * @param int $v
 *      input value in decimal format
 *
 * @param int $size
 *      the length of hex array.
 *
 * @return byte[] 
 *     the converted hex array
 */
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
    // add a packet with zero
    packet.data.push(1);
    packet.hv = calcHV(packet.sc, packet.data, vars.offset);
    packets.push(packet);
    var last_packet = new Packet();
    last_packet.sc = toArray(count + 1, SC_LEN);
    last_packet.data = getNullData(data_size);
    last_packet.hv = calcHV(last_packet.sc, last_packet.data, vars.offset);
    packets.push(last_packet);
  } else if (zero_size === data_size - 1) {
    // add a packet that 1 folloed by zeros
    var last_packet = new Packet();
    last_packet.sc = toArray(count, SC_LEN);
    last_packet.data = getNullData(data_size);
    last_packet.data[0] = 1;
    last_packet.hv = calcHV(last_packet.sc, last_packet.data, vars.offset);
    packets.push(last_packet);
  } else {
    // the most common case
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

/**
 * @summary encrypt an byte array
 *
 * @param byte[] $arr 
 *      the byte array to be encrypted
 *
 * @return byte[] 
 *      encrypted byte array
 */
function encryptArray(arr) {
  var cipher = [];
  arr.forEach(function(m) {
    cipher.push(encrypt(m))
  });
  return cipher;
}

/**
 * @summary encrypt packets
 *
 * @param Packet[] $packets 
 *      the Packet array to be encrypted
 *
 * @return Packet[] 
 *      encrypted Packet array
 */
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

/**
 * @summary decrypt a byte value
 *
 * @param byte $c 
 *      the byte value to be decrypted
 *
 * @return byte
 *      decrypted byte value
 */
function decrypt(c) {
  var s = vars.state_B;
  s = prga(s.s, s.i, s.j);
  vars.state_B = s;
  var t = (s.s[s.i] + s.s[s.j]) % 256;
  return c ^ s.s[t];
}

/**
 * @summary decrypt a byte array
 *
 * @param int $sc 
 *      the sequence count value
 *
 * @param byte[] $arr 
 *      the byte array to be decrypted
 *
 * @return byte[]
 *      decrypted byte array
 */
function decryptArray(sc, arr) {
  var plaintext = [];
  sc = toValue(sc);
  if (sc > vars.SC_B) {
    // use prga to move forward the state to the sc corresponding state
    var len = (sc - vars.SC_B) * arr.length;
    for (var i = 0; i < len; i++) {
      var s = vars.state_B;
      s = prga(s.s, s.i, s.j);
      vars.state_B = s;
    }
  }
  if (sc < vars.SC_B) {
    // use iprga to move backward the state to the sc corresponding state
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

/**
 * @summary decrypt a Packet array
 *
 * @param Packet[] $packets 
 *      the Packet array to be decrypted
 *
 * @return Packet[]
 *      decrypted Packet array
 */
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

/**
 * @summary sort the received packets in sc ascending order.. This function doesn't modify original array.
 *
 * @param Packet[] $packets 
 *      received Packet array
 *
 * @return Packet[]
 *      return sorted array.
 */
function sortPackets(packets) {
  var compare = function(a, b) { return toValue(a.sc) - toValue(b.sc); };
  var sorted = packets.slice(0);
  sorted.sort(compare);
  return sorted
}