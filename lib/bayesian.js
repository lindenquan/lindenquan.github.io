'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tool = function () {
    function Tool() {
        _classCallCheck(this, Tool);
    }

    _createClass(Tool, null, [{
        key: 'arrayIntersect',
        value: function arrayIntersect(arry1, arry2) {
            var set1 = new Set(arry1);
            var set2 = new Set(arry2);
            var intersection = new Set([].concat(_toConsumableArray(set1)).filter(function (x) {
                return set2.has(x);
            }));
            return Array.from(intersection);
        }

        //arry1 and arry2 are arrays containing Variable objects

    }, {
        key: 'varUnion',
        value: function varUnion(arry1, arry2) {
            var set1 = new Set(arry1);
            var set2 = new Set(arry2);
            var union = new Set([].concat(_toConsumableArray(set1), _toConsumableArray(set2)));
            return Array.from(union);
        }
    }, {
        key: 'productDecimals',
        value: function productDecimals(d1, d2) {
            var a1 = (d1 + '').split('.')[1].length;
            var a2 = (d1 + '').split('.')[1].length;
            var c1 = Math.pow(10, a1);
            var c2 = Math.pow(10, a2);

            return d1 * c1 * (d2 * c2) / (c1 * c2);
        }
    }, {
        key: 'stringUnion',
        value: function stringUnion(str1, str2) {
            var set1 = new Set(str1.split(','));
            var set2 = new Set(str2.split(','));
            var union = new Set([].concat(_toConsumableArray(set1), _toConsumableArray(set2)));
            return Array.from(union).join(',');
        }
    }]);

    return Tool;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Distribution = function () {
    function Distribution(map) {
        var _this = this;

        _classCallCheck(this, Distribution);

        for (var _len = arguments.length, vars = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            vars[_key - 1] = arguments[_key];
        }

        // an array of Variable objects
        this.vars = vars;
        // key is string, value is probability
        // key consists of domain values seperated with comma ','
        this.map = map;
        this.varNames = [];
        this.name = '';
        vars.forEach(function (v) {
            return _this.varNames.push(v.name);
        });
    }

    _createClass(Distribution, [{
        key: 'multiply',
        value: function multiply(dis) {
            var commonVarNames = Tool.arrayIntersect(this.varNames, dis.varNames);
            var commonVarIndices = this.getIndices(commonVarNames);
            var vars = Tool.varUnion(this.vars, dis.vars);
            var map = {};
            for (var key in this.map) {
                var commonValues = this.getValues(commonVarIndices, key);
                var matchingMap = dis.subMap(commonVarNames, commonValues);
                for (var subKey in matchingMap) {
                    map[Tool.stringUnion(key, subKey)] = Tool.productDecimals(this.map[key], matchingMap[subKey]);
                }
            }
            var product = new (Function.prototype.bind.apply(Distribution, [null].concat([map], _toConsumableArray(vars))))();
            product.print();
        }

        // varNames is an array containing variable indices
        // values is an array containing values corresponding $varNames
        // return a map whose key is a string, value is the value of probability
        // the key of the returned map contains variable names that are not $varNames
        // For example: varNames=[c,b] values=[0,1], this.varNames = [a,b,c], this.map={'0,1,0':0.2,'0,0,0':0.5}
        // then the returned map is {'0':0.2}

    }, {
        key: 'subMap',
        value: function subMap(varNames, values) {
            var map = {};
            mainLoop: for (var key in this.map) {
                var allValues = key.split(',');
                var l = allValues.length;
                for (var i = 0; i < l; i++) {
                    var v = allValues[i];
                    var index = varNames.indexOf(this.varNames[i]);
                    if (index > -1) {

                        if (values[index] === v) {

                            continue;
                        } else {
                            continue mainLoop;
                        }
                    }
                }
                map[key] = this.map[key];
            }
            return map;
        }

        // indices is an array containing value of indices
        // row is a sting containing values separated with a comma ','
        // return an array that contains value from row according to indices.
        // for example: indicies:[1,4] row='a,b,c,d,e' then return ['b','e']

    }, {
        key: 'getValues',
        value: function getValues(indices, row) {
            var subValues = [];
            var values = row.split(',');

            for (var index in indices) {
                subValues.push(values[indices[index]]);
            }
            return subValues;
        }
    }, {
        key: 'getIndices',
        value: function getIndices(varNames) {
            var index = [];
            var l = this.varNames.length;
            for (var i = 0; i < l; i++) {
                if (varNames.indexOf(this.varNames[i]) > -1) {
                    index.push(i);
                }
            }
            return index;
        }
    }, {
        key: 'print',
        value: function print() {
            console.log('****************************');
            console.log(this.name);
            var tab = '\t\t';
            var vNames = '';
            this.vars.forEach(function (v) {
                return vNames += '' + v.name + tab;
            });
            console.log(vNames);

            for (var key in this.map) {
                console.log(key.replace(/,/g, tab) + ('' + tab + this.map[key]));
            }
            console.log('****************************');
        }
    }, {
        key: 'printDomain',
        value: function printDomain(index) {
            var variable = this.vars[index];
            console.log(variable.name + ':' + variable.domain);
        }
    }]);

    return Distribution;
}();
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Variable = function Variable(name, domain) {
    _classCallCheck(this, Variable);

    // name is a string
    this.name = name;
    // domain is an arry containing strings
    this.domain = domain.slice();
};
'use strict';

var variable = '';
var domains = [];

variable = 'weather';

var weather = new Variable(variable, ['sunny', 'winndy']);

variable = 'city';
domains = [];
domains.push('Regina');
domains.push('Toronto');
domains.push('Warterloo');

var city = new Variable(variable, domains);

var party = new Variable('party', ['Yes', 'No']);

var a = new Variable('a', ['a', 'A']);

var map = {};
map[['a', 'sunny', 'Regina', 'Yes']] = 0.4;
map[['A', 'sunny', 'Toronto', 'No']] = 0.5;

var dis = new Distribution(map, a, weather, city, party);

dis.print();

map = {};
map[['Yes', 'winndy', 'b']] = 0.7;
map[['No', 'sunny', 'B']] = 0.3;
map[['Yes', 'sunny', 'b']] = 0.2;

var b = new Variable('b', ['b', 'B']);

var dis2 = new Distribution(map, party, weather, b);
dis2.print();
dis.multiply(dis2);
