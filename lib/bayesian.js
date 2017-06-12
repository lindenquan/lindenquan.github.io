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
        key: 'getDecimalLength',
        value: function getDecimalLength(decimal) {
            var str = decimal.toString().split('.');
            if (str.length === 1) {
                return 0;
            } else {
                return str[1].length;
            }
        }
    }, {
        key: 'productDecimals',
        value: function productDecimals(d1, d2) {
            var a1 = Tool.getDecimalLength(d1);
            var a2 = Tool.getDecimalLength(d2);
            var c1 = Math.pow(10, a1);
            var c2 = Math.pow(10, a2);

            return d1 * c1 * (d2 * c2) / (c1 * c2);
        }
    }, {
        key: 'divisionDecimals',
        value: function divisionDecimals(d1, d2) {
            var a1 = Tool.getDecimalLength(d1);
            var a2 = Tool.getDecimalLength(d2);
            if (a2 > a1) {
                a1 = a2;
            }
            var c1 = Math.pow(10, a1);

            return d1 * c1 / (d2 * c1);
        }
    }, {
        key: 'addDecimal',
        value: function addDecimal(d1, d2) {
            var a1 = Tool.getDecimalLength(d1);
            var a2 = Tool.getDecimalLength(d2);
            if (a2 > a1) {
                a1 = a2;
            }
            var c1 = Math.pow(10, a1);

            return (d1 * c1 + d2 * c1) / c1;
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
        this.name = 'unknown';
        vars.forEach(function (v) {
            return _this.varNames.push(v.name);
        });
    }

    _createClass(Distribution, [{
        key: 'indicesOn',
        value: function indicesOn(vars) {
            var indices = [];
            var l = this.varNames.length;
            var l1 = vars.length;
            for (var i = 0; i < l1; i++) {
                for (var index = 0; index < l; index++) {
                    if (vars[i].name === this.varNames[index]) {
                        indices.push(index);
                        break;
                    }
                }
            }
            return indices;
        }
    }, {
        key: 'valuesOn',
        value: function valuesOn(key, indices) {
            var l = indices.length;
            var values = key.split(',');
            var results = [];
            for (var i = 0; i < l; i++) {
                results.push(values[indices[i]]);
            }

            return results;
        }
    }, {
        key: 'marginalOnto',
        value: function marginalOnto(vars) {
            var map = {};
            var set = new Set();
            var indices = this.indicesOn(vars);
            for (var key in this.map) {
                var values = this.valuesOn(key, indices);
                var strV = values.toString();

                if (set.has(strV)) {
                    continue;
                } else {
                    set.add(strV);

                    var sum = 0;
                    for (var _key2 in this.map) {
                        if (strV === this.valuesOn(_key2, indices).toString()) {
                            sum = Tool.addDecimal(sum, this.map[_key2]);
                        }
                    }
                    map[strV] = sum;
                }
            }
            var dis = new (Function.prototype.bind.apply(Distribution, [null].concat([map], _toConsumableArray(vars))))();
            dis.name = '\u03D5(' + vars.map(function (v) {
                return v.name;
            }) + ')';
            return dis;
        }
    }, {
        key: 'divide',
        value: function divide(dis) {
            var result = Distribution.calculate(this, dis, Tool.divisionDecimals);
            result.name = this.name + '/' + dis.name;
            return result;
        }
    }, {
        key: 'multiply',
        value: function multiply(dis) {
            var result = Distribution.calculate(this, dis, Tool.productDecimals);
            result.name = this.name + '*' + dis.name;
            return result;
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
    }], [{
        key: 'calculate',
        value: function calculate(dis1, dis2, operator) {
            var commonVarNames = Tool.arrayIntersect(dis1.varNames, dis2.varNames);
            var commonVarIndices = dis1.getIndices(commonVarNames);
            var vars = Tool.varUnion(dis1.vars, dis2.vars);
            var map = {};
            for (var key in dis1.map) {
                var commonValues = dis1.getValues(commonVarIndices, key);
                var matchingMap = dis2.subMap(commonVarNames, commonValues);
                for (var subKey in matchingMap) {
                    map[Tool.stringUnion(key, subKey)] = operator(dis1.map[key], matchingMap[subKey]);
                }
            }
            var product = new (Function.prototype.bind.apply(Distribution, [null].concat([map], _toConsumableArray(vars))))();
            return product;
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

var map = {};
map[['sunny', 'Regina', 'Yes']] = 0.4;
map[['sunny', 'Toronto', 'No']] = 0.5;
map[['sunny', 'Toronto', 'Yes']] = 0.1;
map[['sunny', 'Regina', 'No']] = 0;

var dis = new Distribution(map, weather, city, party);
dis.name = 'P(w,c,p)';

dis.print();

map = {};
map[['Yes', 'winndy']] = 0.7;
map[['No', 'sunny']] = 0.3;
map[['Yes', 'sunny']] = 0.2;

var dis2 = new Distribution(map, party, weather);

dis2.name = 'P(p,w)';
dis2.print();
dis.multiply(dis2).print();
dis.divide(dis2).print();
dis.marginalOnto([party, weather]).print();
