'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Distribution = function () {
    function Distribution(map, vars) {
        var _this = this;

        _classCallCheck(this, Distribution);

        // an array of Variable objects
        this.vars = vars;
        // key is string, value is probability
        // key consists of domain values seperated with comma ','
        this.map = map;
        this.varNames = [];
        this.name = 'unknown';
        this.isUnitDistr = false;
        this.isPotential = true;
        if (vars instanceof Array) {
            vars.forEach(function (v) {
                return _this.varNames.push(v.name);
            });
        }
    }

    _createClass(Distribution, [{
        key: 'getMapValue',
        value: function getMapValue(keyIndex) {
            var keys = Object.keys(this.map);
            if (keys.length > keyIndex) {
                return this.map[keys[keyIndex]];
            }
        }

        // return a cloned distribution.
        // caution: it doesn't clone vars

    }, {
        key: 'clone',
        value: function clone() {
            var map = {};
            for (var key in this.map) {
                map[key] = this.map[key];
            }
            var clone = new Distribution(map, this.vars);
            clone.name = this.name;
            clone.isUnitDistr = this.isUnitDistr;
            return clone;
        }
    }, {
        key: 'normalize',
        value: function normalize() {
            var sum = 0;
            for (var key in this.map) {
                sum = Tool.addDecimal(sum, this.map[key]);
            }

            if (sum === 1) {
                return;
            } else {
                if (DEBUG) {
                    console.log('Normalization on ' + this.name + ' because the sum is:' + sum);
                }
                for (var _key in this.map) {
                    var v = this.map[_key];
                    this.map[_key] = Tool.divisionDecimals(v, sum);
                }
            }
            return this;
        }
    }, {
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
            var dis = new Distribution(map, vars);
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
                return dis2.clone();
            }
            if (dis2.isUnitDistr) {
                return dis1.clone();
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
            var product = new Distribution(map, vars);
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
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Seperator = function Seperator(node1, node2) {
    _classCallCheck(this, Seperator);

    this.between = [];
    this.between.push(node1);
    this.between.push(node2);
    this.distr = Distribution.UNIT;
    this.name = this.between[0].name + '-' + this.between[1].name;
};

var ShaferSeperator = function ShaferSeperator(node1, node2) {
    _classCallCheck(this, ShaferSeperator);

    this.from = node1;
    this.to = node2;
    this.distr = null;
    this.name = this.from.name + '->' + this.to.name;
    this.between = [];
};

var Node = function () {
    function Node(distr, vars, name) {
        var _this = this;

        _classCallCheck(this, Node);

        this.name = name;
        this.varNames = [];
        vars.forEach(function (v) {
            return _this.varNames.push(v.name);
        });

        this.distr = distr;
        //edges contains all neighbour nodes
        this.edges = new Set();
        // father Node
        this.father = null;
        // childern is a set object containing children nodes
        this.children = new Set();
    }

    _createClass(Node, [{
        key: 'sendMessage',
        value: function sendMessage(node, seperator) {
            var commonVarNames = Tool.arrayIntersect(this.varNames, node.varNames);
            var distr = this.distr.sumOnto(commonVarNames);
            node.distr = node.distr.multiply(distr.divide(seperator.distr));
            seperator.distr = distr;
            if (DEBUG) {
                var node1 = seperator.between[0];
                var node2 = seperator.between[1];
                console.log('seperator between ' + node1.varNames + ' and ' + node2.varNames);
                seperator.distr.print();
            }
            seperator.between[0] = this;
            seperator.between[1] = node;

            return seperator;
        }
    }, {
        key: 'setShaferMessage',
        value: function setShaferMessage(node, seperator, seps) {
            var commonVarNames = Tool.arrayIntersect(this.varNames, node.varNames);
            var distr = Distribution.UNIT;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = seps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var sep = _step.value;

                    if (sep.from != node) {
                        distr = distr.multiply(sep.distr);
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

            distr = distr.multiply(this.distr);
            seperator.distr = distr.sumOnto(commonVarNames);

            seperator.between[0] = this;
            seperator.between[1] = node;

            return seperator;
        }
    }]);

    return Node;
}();

var JoinTree = function () {
    function JoinTree() {
        _classCallCheck(this, JoinTree);

        this.nodes = [];
        this.seperators = new Set();
        this.shaferSeperators = new Set();
        this.root = null;
    }

    _createClass(JoinTree, [{
        key: 'addNode',
        value: function addNode(distr, vars, name) {
            this.nodes.push(new Node(distr, vars, name));
        }
    }, {
        key: 'addEdge',
        value: function addEdge(dis1, dis2) {
            var node1 = this.findNode(dis1);
            var node2 = this.findNode(dis2);

            node1.edges.add(node2);
            node2.edges.add(node1);

            this.seperators.add(new Seperator(node1, node2));
            this.shaferSeperators.add(new ShaferSeperator(node1, node2));
            this.shaferSeperators.add(new ShaferSeperator(node2, node1));
        }
    }, {
        key: 'findNode',
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
        key: 'buildHierarchyReturnLeaves',
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
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = fatherPool[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var father = _step2.value;
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = father.edges[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var neighbour = _step3.value;

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

                fatherPool = newFatherPool;
            }
            return leaves;
        }
    }, {
        key: 'findSeperator',
        value: function findSeperator(node1, node2) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.seperators[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var sep = _step4.value;

                    var between = sep.between;
                    if (between[0] === node1 && between[1] === node2) {
                        return sep;
                    }
                    if (between[1] === node1 && between[0] === node2) {
                        return sep;
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: 'findShaferSeperator',
        value: function findShaferSeperator(from, to) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.shaferSeperators[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var sep = _step5.value;

                    if (sep.from === from && sep.to === to) {
                        return sep;
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }, {
        key: 'huginInward',
        value: function huginInward() {
            var _this2 = this;

            var result = {};
            var rootIndex = this.nodes.length * Math.random() | 0;
            var seperator = void 0;
            this.root = this.nodes[rootIndex];
            result.root = this.root;

            this.buildHierarchy();
            this.sort();
            result.seperators = [];
            // set sperators from leaves to root
            this.nodes.forEach(function (node) {
                var father = node.father;
                if (father != null) {
                    seperator = node.sendMessage(father, _this2.findSeperator(node, father));
                    result.seperators.push(seperator);
                }
            });

            result.nodes = this.nodes;
            return result;
        }
    }, {
        key: 'huginOutward',
        value: function huginOutward() {
            var _this3 = this;

            var result = {};
            result.root = this.root;
            result.seperators = [];
            var seperator = void 0;

            // set sperators from root to leaves
            this.nodes.reverse().forEach(function (node) {
                var children = node.children;
                children.forEach(function (child) {
                    var father = node;
                    seperator = father.sendMessage(child, _this3.findSeperator(father, child));
                    result.seperators.push(seperator);
                });
            });

            result.nodes = this.nodes;
            return result;
        }
    }, {
        key: 'runHugin',
        value: function runHugin() {
            this.huginInward();
            this.huginOutward();
        }

        /** ${from} a Node object denoting start node
         *  ${to} a Node object denoting end node. If ${to} is null, it means ${to} is the farest node from ${from} 
         *  return an array contains path nodes from $ { from } to $ { to }
         */

    }, {
        key: 'getPath',
        value: function getPath(from, to) {
            if (from === to) {
                return [from];
            }
            var s = [];
            var q = [];
            s.push(from);
            q.push(from);
            from.path = [from];
            var lastPath = null;

            while (q.length != 0) {
                var c = q.shift();
                var path = c.path;

                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = c.edges[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var neighbour = _step6.value;

                        if (s.indexOf(neighbour) == -1) {
                            var _ret = function () {
                                if (to === neighbour) {
                                    path.push(neighbour);
                                    return {
                                        v: path
                                    };
                                }
                                s.push(neighbour);
                                q.push(neighbour);
                                neighbour.path = [];
                                var np = neighbour.path;
                                path.forEach(function (p) {
                                    return np.push(p);
                                });
                                np.push(neighbour);
                                lastPath = np;
                            }();

                            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                        }
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }
            }

            return lastPath;
        }
    }, {
        key: 'findCenterNode',
        value: function findCenterNode() {
            var node1 = this.nodes[0];
            var path1 = this.getPath(node1, null);
            var path2 = this.getPath(path1[path1.length - 1], null);
            return path2[(path2.length - 1) / 2 | 0];
        }

        // returen a Set ojbect containing all sperators to ${node}

    }, {
        key: 'findAllShaferSeperators',
        value: function findAllShaferSeperators(node) {
            var result = new Set();
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this.shaferSeperators[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var sep = _step7.value;

                    if (sep.to === node) {
                        result.add(sep);
                    }
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'length',
        value: function length(from, to) {
            if (from === to) {
                return 0;
            }
            return this.getPath(from, to).length;
        }

        // sort ${nodes} by the descending distance to ${root}. 
        // after this function the nodes in ${node} will be sorted
        // ${nodes} is a Set object or an Array object containing Node objects

    }, {
        key: 'sortNodes',
        value: function sortNodes(nodes, root) {
            var _this4 = this;

            var array = null;
            var notArray = !Array.isArray(nodes);

            if (notArray) {
                array = Array.from(nodes);
            } else {
                array = nodes;
            }

            if (DEBUG) {
                console.log("before sort:");
                array.forEach(function (n) {
                    return console.log(n.varNames);
                });
            }

            array.sort(function (a, b) {
                a = _this4.length(a, root);
                b = _this4.length(b, root);
                return b - a;
            });

            if (DEBUG) {
                console.log("after sort:");
                array.forEach(function (n) {
                    return console.log(n.varNames);
                });
            }

            if (notArray) {
                nodes.clear();
                array.forEach(function (v) {
                    return nodes.add(v);
                });
            }
        }
    }, {
        key: 'sort',
        value: function sort() {
            this.sortNodes(this.nodes, this.root);
        }
    }, {
        key: 'buildHierarchy',
        value: function buildHierarchy() {
            this.buildHierarchyReturnLeaves(this.root);
        }
    }, {
        key: 'runShaferShenoy',
        value: function runShaferShenoy() {
            var _this5 = this;

            var result = {};
            result.seperators = [];
            var seperator = void 0;

            this.root = this.nodes[0];
            this.buildHierarchy();
            this.sort();

            // set sperators from leaves to root
            this.nodes.forEach(function (node) {
                var father = node.father;
                if (father != null) {
                    seperator = node.setShaferMessage(father, _this5.findShaferSeperator(node, father), _this5.findAllShaferSeperators(node));
                    result.seperators.push(seperator);
                }
            });

            // set sperators from root to leaves
            this.nodes.reverse().forEach(function (node) {
                var children = node.children;
                children.forEach(function (child) {
                    var father = node;
                    seperator = father.setShaferMessage(child, _this5.findShaferSeperator(father, child), _this5.findAllShaferSeperators(father));
                    result.seperators.push(seperator);
                });
            });

            // update each node's distribution
            this.nodes.forEach(function (node) {
                var seps = _this5.findAllShaferSeperators(node);
                seps.forEach(function (sep) {
                    node.distr = node.distr.multiply(sep.distr);
                });
                //node.distr.normalize()
            });

            result.nodes = this.nodes;
            return result;
        }
    }, {
        key: 'calcProbability',
        value: function calcProbability(path, varNames) {
            if (varNames.length === 0) {
                return Distribution.UNIT;
            }

            var len = path.length;
            var commonVarNames = void 0,
                node = void 0,
                node1 = void 0,
                node2 = void 0,
                seperator = void 0,
                result = void 0;

            if (len === 1) {
                node = path[0];
                commonVarNames = Tool.arrayIntersect(node.varNames, varNames);
                return node.distr.sumOnto(commonVarNames);
            }

            node1 = path[0];
            node2 = path[1];
            commonVarNames = Tool.arrayIntersect(node1.varNames, node2.varNames);
            seperator = node1.distr.sumOnto(commonVarNames);
            result = node1.distr.multiply(node2.distr).divide(seperator);
            commonVarNames = Tool.arrayIntersect(Tool.varUnion(node1.varNames, node2.varNames), varNames);
            result = result.sumOnto(commonVarNames);

            if (len === 2) {
                return result;
            }

            for (var i = 2; i < len; i++) {
                node = path[i];
                commonVarNames = Tool.arrayIntersect(result.varNames, node.varNames);
                seperator = result.sumOnto(commonVarNames);
                result = result.multiply(node.distr).divide(seperator);
                commonVarNames = Tool.arrayIntersect(Tool.varUnion(result.varNames, node.varNames), varNames);
                result = result.sumOnto(commonVarNames);
            }

            return result;
        }
    }, {
        key: 'query',
        value: function query(_query, evidence) {

            if (_query.length === 0) {
                return null;
            }

            var total = [];

            _query.forEach(function (q) {
                total.push(q);
            });

            evidence.forEach(function (e) {
                total.push(e);
            });

            var isEvidence = evidence.length !== 0;
            var resultTotal = [];
            var len = this.nodes.length;
            var nodes = this.nodes;
            var path = void 0,
                varNames = void 0;
            var i = void 0,
                j = void 0;
            for (i = 0; i < len; i++) {
                for (j = i; j < len; j++) {
                    var _path = this.getPath(nodes[i], nodes[j]);
                    var valid = true;
                    varNames = [];

                    _path.forEach(function (n) {
                        varNames = Tool.varUnion(varNames, n.varNames);
                    });

                    if (Tool.isSubset(total, varNames)) {
                        resultTotal.push(_path);
                    }
                }
            }

            var comparator = function comparator(a, b) {
                return a.length - b.length;
            };

            resultTotal.sort(comparator);

            var result = this.calcProbability(resultTotal[0], total);
            if (isEvidence) {
                result = result.divide(result.sumOnto(evidence));
            }

            return result;
        }
    }, {
        key: 'printTree',
        value: function printTree() {
            console.log("Join Tree:");
            this.nodes.forEach(function (node) {
                node.edges.forEach(function (neig) {
                    console.log(node.distr.name + ' -- ' + neig.distr.name);
                });
            });
        }
    }, {
        key: 'printNodes',
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
        key: 'permute',
        value: function permute(arr) {
            var result = [];
            if (arr.length === 1) {
                result[0] = [];
                result[0][0] = arr[0];
                result[1] = [];
                result[1][0] = '-' + arr[0];
                return result;
            }

            var first = arr.splice(0, 1)[0];
            var sub = Tool.permute(arr);
            sub.forEach(function (item) {
                var row = [];
                row[0] = first;
                row = row.concat(item);
                result.push(row);
            });

            sub.forEach(function (item) {
                var row = [];
                row[0] = '-' + first;
                row = row.concat(item);
                result.push(row);
            });

            return result;
        }
    }, {
        key: 'combination',
        value: function combination(arr, c) {
            var len = arr.length;
            var result = [];
            var tmp;
            if (c === 1) {
                arr.forEach(function (item) {
                    tmp = [];
                    tmp[0] = item;
                    result.push(tmp);
                });
                return result;
            }

            len = len - c;
            var first;
            var sub;
            for (var i = 0; i <= len; i++) {
                first = arr[i];
                sub = Tool.combination(arr.slice(i + 1), c - 1);
                sub.forEach(function (s) {
                    s.unshift(first);
                    result.push(s);
                });
            }
            return result;
        }
    }, {
        key: 'isSubset',
        value: function isSubset(sub, full) {
            var result = true;
            sub.forEach(function (e) {
                if (full.indexOf(e) === -1) {
                    result = false;
                }
            });
            return result;
        }
    }, {
        key: 'hasCommon',
        value: function hasCommon(arr1, arr2) {
            var len = arr1.length;
            for (var i = 0; i < len; i++) {
                if (arr2.indexOf(arr1[i]) >= 0) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'PRECISION',
        get: function get() {
            return 10;
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
"use strict";

var DEBUG = false;
