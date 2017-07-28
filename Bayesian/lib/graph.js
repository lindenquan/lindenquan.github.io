function Edge(from, to, options) {
    this.from = from; // from Vertex object
    this.to = to; // to Vertex object
    this.isMoral = (options['isMoral'] === true) ? true : false;
    this.isDirected = (options['isDirected'] === true) ? true : false;
    this.isAnimated = (options['isAnimated'] === true) ? true : false;
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
        if (this.isAnimated === true && this.isMoral) {
            $(line).attr('class', 'line-animation');
        } else {
            $(line).attr('class', '');
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
    this.name = name;

    this.addVertex = function(vertex) {
        nameVertexMap[vertex.name] = vertex;
        vertices.push(vertex);
    }

    this.getVertices = function() {
        return vertices;
    }

    function addEdge(edge) {
        var isDuplicate = false;
        edges.forEach(function(item) {
            if (item.from.name === edge.from.name && item.to.name === edge.to.name) {
                // identical edge
                isDuplicate = true;
                return;
            }
        });

        if (!isDuplicate) {
            edges.push(edge);
        }
    }

    this.getEdges = function() {
        return edges;
    }

    this.addEdgeByName = function(pName, name, options) {
        var isDirected = (options['isDirected'] === true) ? true : false;
        var isMoral = options['isMoral'];

        var pVertex = nameVertexMap[pName];
        var vertex = nameVertexMap[name];

        if (isDirected) {
            vertex.parents.push(pVertex);
        }

        addEdge(new Edge(pVertex, vertex, options));
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

    this.paint = function(svg, isAnimated) {
        svg.html('');

        var markerID = addMarker(svg);

        vertices.forEach(function(item) {
            item.paint(svg);
        });

        edges.forEach(function(item) {
            item.paint(svg, markerID, isAnimated);
        });
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

        return g;
    }

    this.normalize = function() {
        edges.forEach(function(item) {
            item.isMoral = false;
        });
    }

    this.moralize = function(highlight) {
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
    }

    this.demoralize = function() {
        var e = [];

        edges.forEach(function(item) {
            if (item.isMoral === false) {
                item.isDirected = true;
                e.push(item);
            }
        });

        edges = e;
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