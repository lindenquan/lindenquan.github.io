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
        var MAX_X = svg.width();
        var maxY = 0;
        var x = 0,
            y;
        var len = this.parents.length;

        this.parents.forEach(function(item) {
            x += item.cx;
            y = item.cy;

            if (y > maxY) {
                maxY = y;
            }
        });

        y = maxY + r * 4;
        y = (y > MAX_Y) ? MAX_Y : y;
        y = (y < r) ? r : y;
        x = x / len;
        x = (x === 0 || len === 0) ? MAX_X / 2 : x;

        this.cx = x;
        this.cy = y;
    }

    this.paint = function(svg, isAnimated, isInfo) {
        var svgId = svg.attr('id');
        this.circle = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'));
        if (this.cx < 0 || this.cy < 0) {
            this.calcXY(svg);
        }

        if (this.isRoot) {
            this.circle.attr('root', 'true');
            if (isAnimated) {
                this.circle.addClass('line-animation');
            }
        }

        if (this.paintSeperator) {
            this.paintSeperator(svg, isAnimated);
            return;
        }

        this.circle.addClass('draggable context-menu-node');
        this.circle.attr('cx', this.cx);
        this.circle.attr('cy', this.cy);
        this.circle.attr('r', this.r);
        this.circle.attr('name', this.name);
        svg.append(this.circle);

        this.text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        this.text.attr('x', this.cx);
        this.text.attr('y', this.cy);
        this.text.attr('name', this.name);
        var name = this.name.split(':');
        if (name.length === 1) {
            name = name[0];
        } else {
            name = name[1];
        }
        this.text.html(name);

        svg.append(this.text);

        if (this.cliqueInfo) {
            this.cliqueInfo(svg, isInfo);
        }

        if (this.paintClique) {
            this.paintClique(svg);
        }
    }

    this.clone = function() {
        var v;

        if (this.cloneClique) {
            v = this.cloneClique();
        } else {
            v = new Vertex();
        }

        v.name = this.name;
        v.cx = this.cx;
        v.cy = this.cy;
        v.clientX = this.clientX;
        v.clientY = this.clientY;
        v.isClicked = false;
        v.r = this.r;

        return v;
    }

    this.print = function() {
        console.log(this.constructor.name + ':' + this.name);
    }
}
Vertex.selected = null; // seleted vertex

function Clique() {
    $.extend(this, new Vertex());
    this.vertices = [];
    this.index = 0;
    this.distName = '';

    this.cliqueInfo = function(svg, isInfo) {
        var names = '';
        this.vertices.forEach(function(v) {
            names += v.name + ', ';
        });
        names = names.slice(0, -2);
        var text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        text.attr('x', 2);
        text.attr('y', 2 + this.index * 15);
        text.attr('class', 'graph-info');
        var name = this.name.split(':');
        if (name.length === 1) {
            name = name[0];
        } else {
            name = name[1];
        }

        if (isInfo) {
            text.html(name + ':' + names + ' < ' + this.distName + ' >');
        } else {
            text.html(name + ':' + names);
        }

        svg.prepend(text);
    }

    this.paintClique = function(svg) {}

    this.setDistName = function(name) {
        this.distName = name.slice(2);
    }

    this.cloneClique = function() {
        var c = new Clique();
        c.index = this.index;
        c.distName = this.distName;
        return c;
    }
}

function SeperatorG(name, from, to, options) {
    $.extend(this, new Vertex());
    options = (options) ? options : {};

    this.name = name;
    this.from = from;
    this.to = to;
    this.isDirected = (options['isDirected'] === true) ? true : false;
    this.isAnimated = (options['isAnimated'] === false) ? false : true;

    this.paintSeperator = function(svg, isAnimated) {
        this.calcXY();
        this.rect = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
        this.rect.attr('x', this.cx - SeperatorG.width / 2);
        this.rect.attr('y', this.cy - SeperatorG.height / 2);
        this.rect.attr('width', SeperatorG.width);
        this.rect.attr('height', SeperatorG.height);
        this.rect.attr('name', this.name);
        this.rect.attr('rx', SeperatorG.radius);
        this.rect.attr('ry', SeperatorG.radius);

        this.text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        this.text.attr('x', this.cx);
        this.text.attr('y', this.cy);
        this.text.attr('name', this.name);
        this.text.attr('stroke', 'orangered');
        this.text.attr('fill', 'orangered');

        var angle = toDegrees(Math.atan(Math.abs(from.cx - to.cx) / Math.abs(from.cy - to.cy)));

        if (this.from.cy > this.to.cy) {
            if (this.from.cx > this.to.cx) {
                this.text.html(SeperatorG.upArrow);
                // anticlockwise rotate angle
                var rotate = 'rotate(-' + angle + ',' + this.cx + ',' + this.cy + ')';
                this.text.attr('transform', rotate);
                this.rect.attr('transform', rotate);
            } else {
                this.text.html(SeperatorG.upArrow);
                // clockwise rotate angle
                var rotate = 'rotate(' + angle + ',' + this.cx + ',' + this.cy + ')';
                this.text.attr('transform', rotate);
                this.rect.attr('transform', rotate);
            }
        } else {
            if (this.from.cx > this.to.cx) {
                this.text.html(SeperatorG.downArrow);
                // clockwise rotate angle
                var rotate = 'rotate(' + angle + ',' + this.cx + ',' + this.cy + ')';
                this.text.attr('transform', rotate);
                this.rect.attr('transform', rotate);

            } else {
                this.text.html(SeperatorG.downArrow);
                // anticlockwise rotate angle
                var rotate = 'rotate(-' + angle + ',' + this.cx + ',' + this.cy + ')';
                this.text.attr('transform', rotate);
                this.rect.attr('transform', rotate);
            }
        }

        isAnimated = (isAnimated === true) ? true : false;

        var r = this.rect;
        var t = this.text;
        if (isAnimated) {
            setTimeout((function() {
                var rect = r;
                var text = t;
                var canvas = svg;
                var task = function() {
                    canvas.append(rect);
                    canvas.append(text);
                }
                return task;
            })(), SeperatorG.time);
            SeperatorG.time += SeperatorG.time;
        } else {
            svg.append(this.rect);
            svg.append(this.text);
        }
    }

    this.calcXY = function() {
        var middleX = (this.from.cx + this.to.cx) / 2 | 0;
        var middleY = (this.from.cy + this.to.cy) / 2 | 0;
        var angle = Math.atan(Math.abs(from.cx - to.cx) / Math.abs(from.cy - to.cy));
        var y = Math.sin(angle) * SeperatorG.d;
        var x = Math.cos(angle) * SeperatorG.d;

        if (this.from.cy > this.to.cy) {
            if (this.from.cx > this.to.cx) {
                this.cx = middleX - x;
                this.cy = middleY + y;
            } else {
                this.cx = middleX + x;
                this.cy = middleY + y;
            }
        } else {
            if (this.from.cx > this.to.cx) {
                this.cx = middleX - x;
                this.cy = middleY - y;
            } else {
                this.cx = middleX + x;
                this.cy = middleY - y;
            }
        }
    }

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }
}

SeperatorG.d = 15;
SeperatorG.upArrow = '&#8679;';
SeperatorG.downArrow = '&#8681;';
SeperatorG.width = 20;
SeperatorG.height = 40;
SeperatorG.time = 0;
SeperatorG.radius = 5;

function Graph() {
    var vertices = [];
    var edges = [];
    var cliques = [];
    var cliqueEdges = [];
    var nameVertexMap = {};
    var order = []; // mcs order
    var seperators = [];

    this.isMoral = false;
    this.isTriangulated = false;
    this.isJT = false;
    this.isInfo = false;

    this.addClique = function(clique) {
        nameVertexMap[clique.name] = clique;
        cliques.push(clique);
    }

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

    this.getCliqueEdges = function() {
        if (cliqueEdges.length === 0) {
            edges.forEach(function(e) {
                if (e.from instanceof Clique) {
                    cliqueEdges.push(e);
                }
            });
        }
        return cliqueEdges;
    }

    // check if the edge is duplicate or not. default value is true
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

    this.deleteVertex = function(name) {
        var v = nameVertexMap[name];
        vertices.remove(v);

        var newEdges = [];
        edges.forEach(function(e) {
            if (e.from.name === name || e.to.name === name) {
                return;
            }
            newEdges.push(e);
        });
        edges = newEdges;
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
        text.attr('class', 'graph-info');
        text.html(str.slice(0, -2));

        svg.prepend(text);
    }

    this.paint = function(svg, isAnimated, propagation) {
        svg.html('');

        if (this.isJT) {
            if (propagation) {
                if (propagation.root) {
                    nameVertexMap[propagation.root.name].isRoot = true;
                }
                SeperatorG.time = 200;
                var temp;
                propagation.seperators.forEach(function(s) {
                    var vertex1 = nameVertexMap[s.between[0].name];
                    var vertex2 = nameVertexMap[s.between[1].name];

                    temp = new SeperatorG(s.name, vertex1, vertex2);
                    temp.paint(svg, false);
                    seperators.push(temp);
                });
            } else {
                seperators.forEach(function(s) {
                    s.paint(svg);
                });
            }
            var info = this.isInfo;
            cliques.forEach(function(c) {
                c.paint(svg, isAnimated, info);
            });

            edges.forEach(function(item) {
                if (item.from instanceof Clique) {
                    item.paint(svg, '', false);
                }
            });

        } else {
            var markerID = addMarker(svg);

            vertices.forEach(function(item) {
                item.paint(svg);
            });

            edges.forEach(function(item) {
                if (item.from instanceof Vertex) {
                    if (item.isMoral || item.isColored) {
                        item.paint(svg, markerID, isAnimated);
                    } else {
                        item.paint(svg, markerID, false);
                    }
                }
            });
            if (this.isInfo) {
                paintMCSorder(svg);
            }
        }
    }

    this.getVertex = function(name) {
        return nameVertexMap[name];
    }

    this.clone = function() {
        var g = new Graph();

        vertices.forEach(function(item) {
            g.addVertex(item.clone());
        });

        edges.forEach(function(item) {
            var pVertex = item.from;
            var vertex = item.to;
            if (pVertex instanceof Vertex) {
                g.addEdgeByName(pVertex.name, vertex.name, item.options);
            }
        });

        g.isMoral = this.isMoral;
        g.isTriangulated = this.isTriangulated;
        g.isJT = this.isJT;

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

    this.isComplete = function(arr) {
        var comb = Tool.combination(arr, 2);
        var len = comb.length;
        var item;

        for (var i = 0; i < len; i++) {
            item = comb[i];
            if (!this.isDuplicateEdge(item[0].name, item[1].name, false)) {
                return false;
            }
        }
        return true;
    }

    this.isSubClique = function(item, arry) {
        var len = arry.length;
        var tmp;
        var itemLen = item.length;
        var i, j;
        var result;
        for (i = 0; i < len; i++) {
            tmp = arry[i];
            result = true;
            for (j = 0; j < itemLen; j++) {
                if (tmp.indexOf(item[j]) < 0) {
                    result = false;
                    break;
                }
            }
            if (result) {
                return result;
            }
        }
        return false;
    }

    this.printVertices = function(vertices) {
        var str = '';
        vertices.forEach(function(v) {
            str += v.name + ' ';
        });
        console.log(str);
    }

    // input: vertex array
    // output: corresponding clique
    this.toClique = function(arry) {
        var c = new Clique();
        var cx = 0;
        var cy = 0;
        var len = arry.length;

        arry.forEach(function(item) {
            cx += item.cx;
            cy += item.cy;
            c.vertices.push(item);
        });

        c.cx = (cx / len) | 0;
        c.cy = (cy / len) | 0;

        return c;
    }

    this.findAllCliques = function(prefix) {
        if (prefix == undefined) {
            prefix = '';
        } else {
            prefix += ':';
        }

        var c = [];
        var temp;
        var self = this;
        var cliques = [];

        var len = vertices.length;

        for (var i = len; i > 0; i--) {
            temp = Tool.combination(vertices, i);

            temp.forEach(function(item) {
                if (self.isComplete(item)) {
                    if (!self.isSubClique(item, c)) {
                        c.push(item);
                    }
                }
            });
        }

        c.forEach(function(item) { cliques.push(self.toClique(item)); });
        cliques.forEach(function(item, index) {
            item.name = prefix + 'C' + (index + 1);
            item.index = index;
            self.addClique(item);
        });

        return cliques;
    }

    this.root = function(id, ids) {
        while (ids[id] != id) {
            ids[id] = ids[ids[id]];
            id = ids[id];
        }
        return id;
    }

    this.union = function(fromId, toId, ids) {
        var r1 = this.root(fromId, ids);
        var r2 = this.root(toId, ids);
        ids[r1] = ids[r2];
    }

    this.findMaximumSpanningTree = function(edges) {
        var ids = [];
        var len = cliques.length;
        var i, from, to;
        var self = this;
        for (i = 0; i < len; i++) {
            cliques[i].id = i;
        }

        for (i = 0; i < len; i++) {
            ids[i] = i;
        }

        edges.sort(function(a, b) {
            return b.weight - a.weight;
        });

        edges.forEach(function(e) {
            from = e.from;
            to = e.to;
            if (self.root(from.id, ids) !== self.root(to.id, ids)) {
                self.union(from.id, to.id, ids);
                self.addEdge(e, false);
            }
        });
    }

    this.addEdgesForCliques = function() {
        var edges = [];
        var from, to, v1, v2;
        var len = cliques.length;
        var vLen, i, j, k, count, edge;
        for (var i = 0; i + 1 < len; i++) {
            for (j = i + 1; j < len; j++) {
                from = cliques[i];
                to = cliques[j];
                count = 0;
                v1 = from.vertices;
                v2 = to.vertices;

                vLen = v1.length;
                for (k = 0; k < vLen; k++) {
                    if (v2.indexOf(v1[k]) > -1) {
                        count++;
                    }
                }
                if (count > 0) {
                    from.neighbor.push(to);
                    to.neighbor.push(from);
                    edge = new Edge(from, to, {});
                    edge.weight = count;
                    edges.push(edge);
                }
            }
        }

        this.findMaximumSpanningTree(edges);
    }

    this.refineCliquePosition = function() {
        var from, to;
        var d = 30;
        var angle;
        var x, y;

        edges.forEach(function(item) {
            from = item.from;
            if (from instanceof Vertex) {
                return;
            }

            to = item.to;
            angle = Math.atan(Math.abs(from.cx - to.cx) / Math.abs(from.cy - to.cy));
            x = Math.sin(angle) * d;
            y = Math.cos(angle) * d;

            if (from.cx < to.cx) {
                from.cx -= x;
                to.cx += x;
            } else {
                to.cx -= x;
                from.cx += x;
            }
            if (from.cy < to.cy) {
                from.cy -= y;
                to.cy += y;
            } else {
                to.cy -= y;
                from.cy += y;
            }
        });
    }

    this.getCliques = function() {
        return cliques;
    }
    // force: re-construct JT, even it's been constructed
    this.constructJT = function(showInfo, force, prefix) {
        this.isJT = true;
        this.isInfo = (showInfo === false) ? false : true;
        force = (force === true) ? true : false;

        if (force === false) {
            if (cliques.length > 0) {
                return;
            }
        }

        this.findAllCliques(prefix);
        this.addEdgesForCliques();
        this.refineCliquePosition();
    }

    this.deconstructJT = function() {
        this.isJT = false;
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

    this.triangulate = function(showInfo) {
        this.isInfo = (showInfo === false) ? false : true;

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
                                self.addEdgeByName(fromName, toName, { 'isColored': true }, false);
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
        this.isInfo = false;
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
        var random = unmarked[(Math.random() * len) | 0];
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

    this.removeSeperators = function() {
        seperators = [];
    }

    this.removeRoot = function() {
        cliques.forEach(function(c) {
            c.isRoot = false;
        });
    }

    this.connected = function() {
        if (vertices.length < 2) {
            return true;
        }

        var vl = vertices.length;
        var el = edges.length;

        if (el + 1 < vl) {
            return false;
        }

        var connected = [];

        edges.forEach(function(e) {
            connected.push(e.from);
            connected.push(e.to);
        })

        var len = vertices.length;
        for (var i = 0; i < len; i++) {
            if (connected.indexOf(vertices[i]) < 0) {
                return false;
            }
        }
        return true;
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