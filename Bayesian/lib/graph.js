function Edge(from, to, options) {
    this.from = from; // from Vertex object
    this.to = to; // to Vertex object
    this.isMoral = (options['isMoral'] === true) ? true : false;
    this.isDirected = (options['isDirected'] === true) ? true : false;
    this.isAnimated = (options['isAnimated'] === true) ? true : false;
    this.isColored = (options['isColored'] === true) ? true : false;
    this.options = options;

    this.paint = function(svg, markerID, isAnimated) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        var fromX = this.from.cx;
        var fromY = this.from.cy;
        var toX = this.to.cx;
        var toY = this.to.cy;
        this.isAnimated = (isAnimated === true) ? true : false;

        if (!Number.isInteger(fromX) || !Number.isInteger(fromY) || !Number.isInteger(toX) || !Number.isInteger(toY)) {
            return;
        }

        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', 3);
        if (this.isDirected) {
            line.setAttribute('marker-end', 'url(#' + markerID + ')');
        }

        line.setAttribute('moral', '' + this.isMoral);
        line.setAttribute('name', this.to.name);
        line.setAttribute('p-name', this.from.name);

        if (this.isAnimated === true) {
            $(line).attr('class', 'line-animation');
        } else {
            $(line).attr('class', '');
        }

        if (this.isColored === true) {
            $(line).addClass('colored');
        }

        svg.prepend(line);
    }
}

function Vertex() {
    this.name = '';
    this.cx = -1;
    this.cy = -1;
    this.clientX = 0;
    this.clientY = 0;
    this.isClicked = false;
    this.r = 20;
    this.parents = []; // parents list
    this.neighbor = []; // neighbor list

    this.calcXY = function(svg) {
        var r = this.r;
        var MAX_Y = svg.height() - r;
        var minX = svg.width() - r;
        var maxX = 0;
        var maxY = 0;
        var x, y;

        this.parents.forEach(function(item) {
            x = item.cx;
            y = item.cy;
            if (x < minX) {
                minX = x;
            }
            if (x > maxX) {
                maxX = x;
            }
            if (y > maxY) {
                maxY = y;
            }
        });

        y = maxY + r * 4;
        y = (y > MAX_Y) ? MAX_Y : y;
        y = (y < r) ? r : y;

        x = minX + (((maxX - minX) / 2) | 0);

        this.cx = x;
        this.cy = y;
    }

    this.paint = function(svg) {
        var svgId = svg.attr('id');
        this.circle = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'));
        if (this.cx < 0 || this.cy < 0) {
            this.calcXY(svg);
        }

        this.circle.attr('class', 'draggable context-menu-node');
        this.circle.attr('cx', this.cx);
        this.circle.attr('cy', this.cy);
        this.circle.attr('r', this.r);
        this.circle.attr('name', this.name);
        svg.append(this.circle);

        this.text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        this.text.attr('x', this.cx);
        this.text.attr('y', this.cy);
        this.text.attr('name', this.name);
        this.text.html(this.name);

        svg.append(this.text);
    }

    this.clone = function() {
        var v = new Vertex();
        v.name = this.name;
        v.cx = this.cx;
        v.cy = this.cy;
        v.clientX = this.clientX;
        v.clientY = this.clientY;
        v.isClicked = false;
        v.r = this.r;
        return v;
    }
}

Vertex.selected = null; // seleted vertex

function Graph(name) {
    var vertices = [];
    var edges = [];
    var nameVertexMap = {};
    var order = []; // mcs order
    this.isMoral = false;
    this.isTriangulated = false;
    this.name = name;

    this.addVertex = function(vertex) {
        nameVertexMap[vertex.name] = vertex;
        vertices.push(vertex);
    }

    this.getVertices = function() {
        return vertices;
    }

    this.isExist = function(edge, isDirected) {
        var isDuplicate = false;
        var direct = (isDirected === false) ? false : true;

        edges.forEach(function(item) {
            if (item.from.name === edge.from.name && item.to.name === edge.to.name) {
                if (direct) {
                    if (item.from.name === edge.to.name && item.to.name === edge.from.name) {
                        isDuplicate = true;
                        return;
                    }
                } else {
                    // identical edge
                    isDuplicate = true;
                    return;
                }
            }
        });
        return isDuplicate;
    }

    this.isDuplicateEdge = function(fromName, toName, isDirected) {
        var isDuplicate = false;
        var direct = (isDirected === false) ? false : true;

        edges.forEach(function(item) {
            if (item.from.name === fromName && item.to.name === toName) {
                if (direct) {
                    if (item.from.name === toName && item.to.name === fromName) {
                        isDuplicate = true;
                        return;
                    }
                } else {
                    // identical edge
                    isDuplicate = true;
                    return;
                }
            }

        });
        return isDuplicate;
    }

    this.addEdge = function(edge, check) {
        var c = (check === false) ? false : true;

        if (c) {
            if (!this.isExist(edge)) {
                edges.push(edge);
            }
        } else {
            edges.push(edge);
        }
    }

    this.getEdges = function() {
        return edges;
    }

    this.addEdgeByName = function(pName, name, options, check) {
        var isDirected = (options['isDirected'] === true) ? true : false;

        var pVertex = nameVertexMap[pName];
        var vertex = nameVertexMap[name];

        if (isDirected) {
            vertex.parents.push(pVertex);
        }
        var c = (check === false) ? false : true;
        this.addEdge(new Edge(pVertex, vertex, options), c);
    }

    function addMarker(svg) {
        var markerID = 'tri-' + svg.attr('id');
        var defs = $(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
        var marker = $(document.createElementNS('http://www.w3.org/2000/svg', 'marker'));
        marker.attr('id', markerID);
        marker.attr('viewBox', '0 0 10 10');
        marker.attr('refX', '30');
        marker.attr('refY', '5');
        marker.attr('markerUnits', 'strokeWidth');
        marker.attr('markerWidth', '4');
        marker.attr('markerHeight', '3');
        marker.attr('orient', 'auto');
        var path = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        path.attr('d', 'M 0 0 L 10 5 L 0 10 z');
        marker.append(path);
        defs.append(marker);
        svg.prepend(defs);

        return markerID;
    }

    function paintMCSorder(svg) {
        if (!(order instanceof Array)) {
            return;
        }

        if (order.length === 0) {
            return;
        }

        var str = 'Order: ';

        order.forEach(function(item) {
            str += item.name + ', ';
        });

        var text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        text.attr('x', 2);
        text.attr('y', 2);
        text.attr('class', 'mcs-order');
        text.html(str.slice(0, -2));

        svg.prepend(text);
    }

    this.paint = function(svg, isAnimated) {
        svg.html('');

        var markerID = addMarker(svg);

        vertices.forEach(function(item) {
            item.paint(svg);
        });

        edges.forEach(function(item) {
            if (item.isMoral || item.isColored) {
                item.paint(svg, markerID, isAnimated);
            } else {
                item.paint(svg, markerID, false);
            }
        });

        paintMCSorder(svg);
    }

    this.getVertex = function(name) {
        return nameVertexMap[name];
    }

    this.clone = function(name) {
        var g = new Graph(name);

        vertices.forEach(function(item) {
            g.addVertex(item.clone());
        });

        edges.forEach(function(item) {
            var pVertex = item.from;
            var vertex = item.to;
            g.addEdgeByName(pVertex.name, vertex.name, item.options);
        });

        g.isMoral = this.isMoral;
        g.isTriangulated = this.isTriangulated;

        return g;
    }

    this.normalize = function() {
        edges.forEach(function(item) {
            item.isMoral = false;
            item.isColored = false;
            item.isDirected = false;
        });
        return this;
    }

    this.moralize = function(highlight) {
        if (this.isMoral) {
            return this;
        }
        var lines = []; // line names format "from+to"
        highlight = (highlight === false) ? false : true;

        vertices.forEach(function(item) {
            var p = item.parents;
            var len = p.length;
            var j = 0;
            var temp = ''
            if (len > 1) {
                for (var i = 0; i + 1 < len; i++) {
                    for (j = i + 1; j < len; j++) {
                        temp = p[i].name + '+' + p[j].name;
                        lines.remove(temp); // remove duplicate;
                        lines.push(temp);
                    }
                }
            }
        });

        var self = this;

        lines.forEach(function(item) {
            var fromTo = item.split('+');
            var from = self.getVertex(fromTo[0]);
            var to = self.getVertex(fromTo[1]);
            self.addEdgeByName(from.name, to.name, { 'isDirected': false, 'isMoral': true, 'isAnimated': highlight });

        });

        // remove arrows
        edges.forEach(function(item) {
            item.isDirected = false;
        });
        this.isMoral = true;
        return this;
    }

    this.demoralize = function() {
        if (!this.isMoral) {
            return this;
        }
        var e = [];

        edges.forEach(function(item) {
            if (item.isMoral === false) {
                item.isDirected = true;
                e.push(item);
            }
        });

        edges = e;
        this.isMoral = false;
        return this;
    }

    this.constructJT = function() {}

    this.deconstructJT = function() {}

    this.discardOrder = function() {
        order = null;
    }

    function intersection(a, b) {
        var i = [];
        a.forEach(function(itemA) {
            b.forEach(function(itemB) {
                if (itemA.name === itemB.name) {
                    i.push(itemA);
                }

            });
        });
        return i;
    }

    this.triangulate = function() {
        if (this.isTriangulated) {
            return this;
        }

        order = mcs();

        var self = this;
        var added = true;
        var fromName = '';
        var toName = '';
        while (added === true) {
            added = false;
            order.slice(1).forEach(function(item, index) {
                var nodes = intersection(item.neighbor, order.slice(0, index + 1))
                var len = nodes.length;
                if (len > 1) {
                    for (var i = 0; i + 1 < len; i++) {
                        for (j = i + 1; j < len; j++) {
                            fromName = nodes[i].name;
                            toName = nodes[j].name;
                            if (!self.isDuplicateEdge(fromName, toName, false)) {
                                added = true;
                                nodes[i].neighbor.push(nodes[j]);
                                nodes[j].neighbor.push(nodes[i]);
                                self.addEdgeByName(fromName, toName, { 'isDirected': false, 'isColored': true }, false);
                            }
                        }
                    }
                }
            });
        }
        this.isTriangulated = true;
        return this;
    }

    this.detriangulate = function() {
        if (!this.isTriangulated) {
            return this;
        }
        var e = [];
        edges.forEach(function(item) {
            if (!item.isColored) {
                e.push(item);
            }
        });

        edges = e;
        this.isTriangulated = false;
        return this;
    }

    function findNeighbor(vertex) {
        var name = vertex.name;
        vertex.neighbor = [];
        edges.forEach(function(item) {
            if (item.from.name === name) {
                vertex.neighbor.push(item.to);
            } else if (item.to.name === name) {
                vertex.neighbor.push(item.from);
            }
        });
    }

    function getGreatest(unmarked) {
        var vertex = unmarked[0];
        unmarked.forEach(function(item) {
            if (item.mcs > vertex.mcs) {
                vertex = item;
            }
        });
        return vertex;
    }

    // maximum cardinality search
    function mcs() {
        var order = [];
        var unmarked = [];

        vertices.forEach(function(item) {
            item.mcs = 0;
            findNeighbor(item);
            unmarked.push(item);
        });

        var len = vertices.length;
        var random = unmarked[Math.random() * len | 0];
        order[0] = random;
        order[0].neighbor.forEach(function(item) {
            item.mcs++;
        });
        unmarked.remove(random);

        while (order.length !== len) {
            var vertex = getGreatest(unmarked);
            order.push(vertex);
            vertex.neighbor.forEach(function(item) {
                item.mcs++;
            });
            unmarked.remove(vertex);
        }

        return order;
    }
}

Graph.svgGraphMap = {};

jQuery.fn.extend({
    getGraph: function() {
        if (this.tagName() === 'svg') {
            return Graph.svgGraphMap[this.id()];
        }
    },

    setGraph: function(graph) {
        if (this.tagName() === 'svg') {
            Graph.svgGraphMap[this.id()] = graph;
        }
    }
});