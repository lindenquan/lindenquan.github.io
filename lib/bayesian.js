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
        this.isUnitDistr = false;
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

        // varNames is an array containing names of variables

    }, {
        key: 'sumOnto',
        value: function sumOnto(varNames) {
            var _this2 = this;

            var vars = [];
            varNames.forEach(function (name) {
                var length = _this2.vars.length;
                for (var i = 0; i < length; i++) {
                    if (_this2.vars[i].name === name) {
                        vars.push(_this2.vars[i]);
                        return;
                    }
                }
            });
            return this.marginalOnto(vars);
        }

        // vars is an array of Variable objects 

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
            if (dis1.isUnitDistr) {
                return dis2;
            }
            if (dis2.isUnitDistr) {
                return dis1;
            }
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
    }, {
        key: 'UNIT',
        get: function get() {
            var dis = new Distribution();
            dis.isUnitDistr = true;
            dis.name = '1';
            return dis;
        }
    }]);

    return Distribution;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Seperator = function Seperator(node1, node2) {
    _classCallCheck(this, Seperator);

    this.between = [];
    this.between.push(node1);
    this.between.push(node2);
    this.distr = Distribution.UNIT;
};

var Node = function () {
    function Node(distr, vars) {
        var _this = this;

        _classCallCheck(this, Node);

        this.varNames = [];
        vars.forEach(function (v) {
            return _this.varNames.push(v.name);
        });

        this.distr = distr;
        //edges contains all neighbour nodes
        this.edges = new Set();
        // father is another Node
        this.father = null;
        // childern is a set object containing children nodes
        this.children = new Set();
    }

    _createClass(Node, [{
        key: "sendMessage",
        value: function sendMessage(node, seperator) {
            var commonVarNames = Tool.arrayIntersect(this.varNames, node.varNames);
            var dist = this.distr.sumOnto(commonVarNames);
            seperator.distr = dist.divide(seperator.distr);
            node.distr = node.distr.multiply(seperator.distr);
        }
    }]);

    return Node;
}();

var JoinTree = function () {
    function JoinTree() {
        _classCallCheck(this, JoinTree);

        this.nodes = [];
        this.seperators = new Set();
    }

    _createClass(JoinTree, [{
        key: "addNode",
        value: function addNode(distr, vars) {
            this.nodes.push(new Node(distr, vars));
        }
    }, {
        key: "addEdge",
        value: function addEdge(dis1, dis2) {
            var node1 = this.findNode(dis1);
            var node2 = this.findNode(dis2);

            node1.edges.add(node2);
            node2.edges.add(node1);

            this.seperators.add(new Seperator(node1, node2));
        }
    }, {
        key: "findNode",
        value: function findNode(distr) {
            var node = this.nodes.filter(function (node) {
                return node.distr === distr;
            });
            if (node.length != 1) {
                console.log("cannot find the node");
            } else {
                return node[0];
            }
        }

        // return Set object which contains leaf nodes

    }, {
        key: "buildHierarchyReturnLeaves",
        value: function buildHierarchyReturnLeaves(root) {
            var fatherPool = new Set();
            var newFatherPool = new Set();
            var childPool = new Set();
            fatherPool.add(root);
            this.nodes.forEach(function (node) {
                if (node != root) {
                    childPool.add(node);
                }
            });
            var leaves = new Set();
            while (childPool.size != 0) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = fatherPool[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var father = _step.value;
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = father.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var neighbour = _step2.value;

                                if (childPool.has(neighbour)) {
                                    father.children.add(neighbour);
                                    neighbour.father = father;
                                    childPool.delete(neighbour);
                                    if (neighbour.edges.size == 1) {
                                        leaves.add(neighbour);
                                    } else {
                                        newFatherPool.add(neighbour);
                                    }
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                fatherPool = newFatherPool;
            }
            return leaves;
        }
    }, {
        key: "findSeperator",
        value: function findSeperator(node1, node2) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.seperators[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var sep = _step3.value;

                    var between = sep.between;
                    if (between[0] === node1 && between[1] === node2) {
                        return sep;
                    }
                    if (between[1] === node1 && between[0] === node2) {
                        return sep;
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }, {
        key: "runHugin",
        value: function runHugin() {
            var _this2 = this;

            var root = this.nodes[0];
            var leaves = this.buildHierarchyReturnLeaves(root);

            var _loop = function _loop() {
                var newLeaves = new Set();
                leaves.forEach(function (leaf) {
                    var father = leaf.father;
                    leaf.sendMessage(father, _this2.findSeperator(leaf, father));
                    if (father != root) {
                        newLeaves.add(father);
                    }
                });
                leaves = newLeaves;
            };

            while (leaves.size != 0) {
                _loop();
            }

            var children = root.children;

            var _loop2 = function _loop2() {
                var newChildren = new Set();
                children.forEach(function (child) {
                    child.father.sendMessage(child, _this2.findSeperator(child.father, child));
                    child.children.forEach(function (child) {
                        newChildren.add(child);
                    });
                });
                children = newChildren;
            };

            while (children.size != 0) {
                _loop2();
            }
        }
    }, {
        key: "runShaferShenoy",
        value: function runShaferShenoy() {}
    }, {
        key: "printTree",
        value: function printTree() {
            console.log("Join Tree:");
            this.nodes.forEach(function (node) {
                node.edges.forEach(function (neig) {
                    console.log(node.distr.name + " -- " + neig.distr.name);
                });
            });
        }
    }, {
        key: "printNodes",
        value: function printNodes() {
            console.log("Join Tree Nodes:");
            this.nodes.forEach(function (node) {
                node.distr.print();
            });
        }
    }]);

    return JoinTree;
}();
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
        key: 'formatFloat',
        value: function formatFloat(num) {
            return parseFloat(num.toFixed(Tool.PRECISION));
        }
    }, {
        key: 'productDecimals',
        value: function productDecimals(d1, d2) {
            var a1 = Tool.getDecimalLength(d1);
            var a2 = Tool.getDecimalLength(d2);
            var c1 = Math.pow(10, a1);
            var c2 = Math.pow(10, a2);

            return Tool.formatFloat(d1 * c1 * (d2 * c2) / (c1 * c2));
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

            return Tool.formatFloat(d1 * c1 / (d2 * c1));
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

            return Tool.formatFloat((d1 * c1 + d2 * c1) / c1);
        }
    }, {
        key: 'stringUnion',
        value: function stringUnion(str1, str2) {
            var set1 = new Set(str1.split(','));
            var set2 = new Set(str2.split(','));
            var union = new Set([].concat(_toConsumableArray(set1), _toConsumableArray(set2)));
            return Array.from(union).join(',');
        }
    }, {
        key: 'PRECISION',
        get: function get() {
            return 5;
        }
    }]);

    return Tool;
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

var A = new Variable('A', ['a', '-a']);
var B = new Variable('B', ['b', '-b']);
var C = new Variable('C', ['c', '-c']);
var D = new Variable('D', ['d', '-d']);
var E = new Variable('E', ['e', '-e']);
var F = new Variable('F', ['f', '-f']);

var map = {};
map[['e', 'c']] = 0.5;
map[['e', '-c']] = 0.4;
map[['-e', 'c']] = 0.5;
map[['-e', '-c']] = 0.6;
var EC = new Distribution(map, E, C);
EC.name = 'P(E|C)';

map = {};
map[['b', 'd']] = 0.4;
map[['b', '-d']] = 0.6;
map[['-b', 'd']] = 0.7;
map[['-b', '-d']] = 0.3;
var BD = new Distribution(map, B, D);
BD.name = 'P(D|B)';

map = {};
map[['a', 'b', 'c']] = 0.007;
map[['a', 'b', '-c']] = 0.003;
map[['a', '-b', 'c']] = 0.063;
map[['a', '-b', '-c']] = 0.027;
map[['-a', 'b', 'c']] = 0.162;
map[['-a', 'b', '-c']] = 0.648;
map[['-a', '-b', 'c']] = 0.018;
map[['-a', '-b', '-c']] = 0.072;
var ABC = new Distribution(map, A, B, C);
ABC.name = 'P(A,B,C)';

map = {};
map[['d', 'e', 'f']] = 0.1;
map[['d', 'e', '-f']] = 0.9;
map[['d', '-e', 'f']] = 0.5;
map[['d', '-e', '-f']] = 0.5;
map[['-d', 'e', 'f']] = 0.4;
map[['-d', 'e', '-f']] = 0.6;
map[['-d', '-e', 'f']] = 0.8;
map[['-d', '-e', '-f']] = 0.2;
var DEF = new Distribution(map, D, E, F);
DEF.name = 'P(F|D,E)';

var tree = new JoinTree();
tree.addNode(EC, [C, D, E]);
tree.addNode(BD, [B, C, D]);
tree.addNode(ABC, [A, B, C]);
tree.addNode(DEF, [D, E, F]);

tree.addEdge(EC, BD);
tree.addEdge(BD, ABC);
tree.addEdge(EC, DEF);

tree.printTree();
tree.runHugin();
tree.printNodes();
