$(function() {
    var mc = new MainController();
    book = $('.book:first');
    book.booklet({
        width: 900, // container width
        height: 550, // container height
        next: $('#btn-start'),
        finish: onFinish,
        onPage: { 6: mc.onMoralization, 8: mc.onTriangulation }
    });

    function onFinish() {
        $('.book .prevPage').click(function() {
            book.booklet('prev');
        });
        $('.book .nextPage').click(function() {
            book.booklet('next');
        });
        mc.addContextMenu();
        $('.book').css('display', 'block');
        setTimeout(function() {
            $('.loading').css('display', 'none');
        }, 500);
    }
});

function MainController() {
    $(document).on('dragstart', '.var-in-list', circleInListDragStart);
    $(document).on('dragover', '.node-box', circleInListDragover);
    $(document).on('drop', '.node-box', circleInListDrop);
    $(document).on('dragenter', '.node-box', circleInListEnter);
    $(document).on('dragleave', '.node-box', circleInListLeave);
    $(document).on('mousedown', 'svg circle', svgCircleMouseDown);
    $(document).on('mousemove', 'svg', svgMouseMove);
    $(document).on('mouseup', 'svg', svgMouseUp);
    $(document).on('dragstart', 'svg', svgStartDrag);
    $(document).on('dblclick', 'svg circle', doubleClickCircle);
    $(document).on('click', '#btn-start', btn_start);
    $(document).on('click', '#btn-spawn', onSpawn);
    $(document).on('click', '#btn-sample', onSample);
    $(document).on('click', '#btn-moralize', onMoralize);
    $(document).on('click', '#btn-demoralize', onDemoralize);
    $(document).on('click', '#btn-triangulate', onTriangulate);
    $(document).on('click', '#btn-detriangulate', onDetriangulate);
    $(document).on('click', '#parents .confirm', onParentConfirm);
    $(document).on('click', '#modal-cpt .confirm', onCPTConfirm);

    var originalGraph = new Graph('original graph');
    $('#original-svg').setGraph(originalGraph);

    var moralGraph = null;
    var triangulatedGraph = null;

    // CPT_var class
    function CPT_var(name) {
        this.name = name;
        this.var = null; // Variable object
        this.dist = null; // Distribution object
        this.parents = []; // parents name list
    }

    var c_var = null; // current CPT_var object
    var CPT_vars = {}; // key is string variable name, value is a CPT_var object.
    var DAGChanged = false;
    var moralChanged = false;

    function btn_start() {
        $('.b-page-3').css('visibility', 'visible');
    };

    function createCPTtable() {
        var table = $('#table-cpt');
        var str = '';
        var c_name = c_var.name;
        var dist = CPT_vars[c_name].dist;
        var isNew = dist === null;
        var p_c = []; // parents + current variable

        p_c = p_c.concat(c_var.parents);
        p_c.push(c_name);

        var last_th = '<th>p(' + c_name;
        if (p_c.length === 1) {
            str += '<th>' + c_name + '</th>'
            last_th += ')</th>';
        } else {
            last_th += '|';
            var len = p_c.length;
            p_c.forEach(function(item, index) {
                if (index + 1 != len) {
                    str += '<th>' + item + '<button type="button" class="btn-x">×</button></th>'
                    last_th += item + ',';
                } else {
                    str += '<th>' + item + '</th>'
                }
            });
            last_th = last_th.slice(0, -1); // remove last comma ','
            last_th += ')</th>';
        }
        var th = '<tr>' + str + last_th + '</tr>';

        var permute = Tool.permute(p_c.map(function(x) {
            return x.toLowerCase()
        }));

        str = '';
        var default_p = 0.5;
        permute.forEach(function(tr, index) {
            str += '<tr>';
            tr.forEach(function(td) {
                str += '<td>' + td + '</td>'
            });
            if (isNew) {
                str += '<td><input type="text" value="' + default_p + '"></td></tr>';
            } else {
                str += '<td><input type="text" value="' + dist.getMapValue(index) + '"></td></tr>';
            }
        });

        table.html(th + str);
        $('#modal-cpt').modal({
            keyboard: false,
            backdrop: 'static'
        });
    }

    function addToQueryList(varObj) {
        var str = '<span id="circle-in-list-' + varObj.name + '" ';
        var varCircle = $(str + 'class="var-in-list" draggable="true">' + varObj.name + '</span>');
        $('#vars-list').append(varCircle);
    }

    // display a sample DAG
    function onSample() {
        var svg = $('#original-svg');
        DAGChanged = true;
        CPT_vars = [];
        $('#vars-list').html('');
        var map;
        originalGraph = new Graph();
        svg.setGraph(originalGraph);

        var var1 = new CPT_var('A');
        var1.var = new Variable('A', ['a', '-a']);
        CPT_vars['A'] = var1;
        map = {};
        map[['a']] = 0.8;
        map[['-a']] = 0.2;
        var1.dist = new Distribution(map, [var1.var]);
        addToQueryList(var1);

        var var2 = new CPT_var('B');
        var2.var = new Variable('B', ['b', '-b']);
        CPT_vars['B'] = var2;
        map = {};
        map[['b']] = 0.3;
        map[['-b']] = 0.7;
        var2.dist = new Distribution(map, [var2.var]);
        addToQueryList(var2);

        var var3 = new CPT_var('C');
        var3.var = new Variable('C', ['c', '-c']);
        CPT_vars['C'] = var3;
        map = {};
        map[['a', 'b', 'c']] = 0.2;
        map[['a', 'b', '-c']] = 0.8;
        map[['a', '-b', 'c']] = 0.3;
        map[['a', '-b', '-c']] = 0.7;
        map[['-a', 'b', 'c']] = 0.4;
        map[['-a', 'b', '-c']] = 0.6;
        map[['-a', '-b', 'c']] = 0.5;
        map[['-a', '-b', '-c']] = 0.5;
        var3.dist = new Distribution(map, [var1.var, var2.var, var3.var]);
        addToQueryList(var3);
        var3.parents.push(var1.name);
        var3.parents.push(var2.name);

        var vertex1 = new Vertex();
        vertex1.name = var1.name;
        vertex1.cx = 115;
        vertex1.cy = 115;

        var vertex2 = new Vertex();
        vertex2.name = var2.name;
        vertex2.cx = 300;
        vertex2.cy = 115;

        var vertex3 = new Vertex();
        vertex3.name = var3.name;
        vertex3.cx = vertex1.cx + (vertex2.cx - vertex1.cx) / 2 | 0;
        vertex3.cy = 300;

        originalGraph.addVertex(vertex1);
        originalGraph.addVertex(vertex2);
        originalGraph.addVertex(vertex3);

        originalGraph.addEdgeByName(var1.name, var3.name, { 'isDirected': true });
        originalGraph.addEdgeByName(var2.name, var3.name, { 'isDirected': true });

        originalGraph.paint(svg);
    }

    function onSpawn() {
        var selector = $('#v-selector');
        var selected = selector.val();

        if (selected === undefined || selected === null) {
            return;
        }

        selected = selected.toUpperCase();
        if (typeof selected === 'string') {
            var varObj = CPT_vars[selected];
            if (varObj === undefined) {
                c_var = new CPT_var(selected);

                var otherVars = Object.keys(CPT_vars);
                CPT_vars[selected] = c_var;

                var modal_body = $('#parents .modal-body');
                modal_body.html('');
                otherVars.forEach(function(i) {
                    var input = $('<input id="toggle_p_' + i + '" type="checkbox">');
                    var lable = $('<label for="toggle_p_' + i + '">' + i + '</label>');
                    modal_body.append(input);
                    modal_body.append(lable);
                });

                var lowercase = selected.toLowerCase();
                c_var.var = new Variable(selected, [lowercase, '-' + lowercase]);

                addToQueryList(c_var);

                // add vertex
                var vertex = new Vertex();
                vertex.name = c_var.name;
                originalGraph.addVertex(vertex);
                DAGChanged = true;
            } else {
                // already has this variable, select another one.
                console.log('already has this variable, select another one.');
            }

            if (Object.keys(CPT_vars).length === 1) {
                // first node
                createCPTtable();
            } else {
                $('#parents').modal({
                    keyboard: false,
                    backdrop: 'static'
                });
            }
        } else {
            // no variable is selected
        }
    }

    function onDemoralize() {
        var svg = $('#moral-svg');
        if (svg.data('moralized') === 'false') {
            return;
        } else {
            var g = svg.getGraph();
            g.demoralize();
            g.paint(svg);
            svg.data('moralized') === 'false';
        }
    }

    function onMoralize() {
        var svg = $('#moral-svg');
        if (svg.data('moralized') === 'true') {
            return;
        } else {
            var g = svg.getGraph();
            g.moralize();
            g.paint(svg, true);
            svg.data('moralized') === 'true';
        }
    }

    function onParentConfirm() {
        var c_obj = CPT_vars[c_var.name];

        $('#parents input:checked').each(function(index, item) {
            var p = $(item).attr('id').slice(-1);
            var p_obj = CPT_vars[p];

            c_obj.parents.push(p_obj.name);
            originalGraph.addEdgeByName(p_obj.name, c_obj.name, { 'isDirected': true });
        });
        createCPTtable();
    }

    function toDistMap(tds) {
        var map = {};
        tds.forEach(function(item) {
            var p = item.splice(-1);
            map[item] = parseFloat(p);
        });
        return map;
    }

    function toVar(ths) {
        var vars = [];
        ths.splice(-1);
        ths.forEach(function(item) {
            vars.push(CPT_vars[item].var);
        });
        return vars;
    }

    function onCPTConfirm(e) {
        var rows = $('#table-cpt tr');
        var ths = [];
        var tds = [];
        rows.each(function(index, item) {
            if (index === 0) {
                $(item).children().each(function(index, item) {
                    ths.push($(item).text()[0]);
                });
            } else {
                var row = [];
                var children = $(item).children();
                var len = children.length;
                children.each(function(index, item) {
                    if (index + 1 === len) {
                        row.push($(item).children('input').val());
                    } else {
                        row.push($(item).text());
                    }
                });
                tds.push(row);
            }
        });
        var map = toDistMap(tds);
        var vars = toVar(ths);

        c_var.dist = new Distribution(map, vars);
        originalGraph.paint($('#original-svg'));
    }

    function svgCircleMouseDown(e) {

        if (e.which !== 1) {
            // 1 means left click
            return;
        }

        var target = $(e.target);
        var name = target.attr('name');
        c_var = CPT_vars[name];

        var svg = target.parent();
        var vertex = svg.getGraph().getVertex(name);
        Vertex.selected = vertex;

        vertex.clientX = e.clientX;
        vertex.clientY = e.clientY;
        vertex.isClicked = true;
    }

    function onTriangulate() {}

    function onDetriangulate() {}

    function svgStartDrag(e) {
        e.preventDefault();
    }

    function mouseMove(e) {
        var vertex = Vertex.selected;
        var target = $(e.target);
        var svg = null;
        var tagName = target.tagName();
        if (tagName === 'svg') {
            svg = target;
        } else if (tagName === 'circle') {
            svg = target.parent();
        } else {
            return;
        }

        if (vertex !== null && vertex.isClicked) {
            var name = vertex.name;

            var newCx = vertex.cx + e.clientX - vertex.clientX;
            var newCy = vertex.cy + e.clientY - vertex.clientY;

            if (!Number.isInteger(newCx) || !Number.isInteger(newCy)) {
                return;
            }

            vertex.cx = newCx;
            vertex.cy = newCy;
            vertex.clientX = e.clientX;
            vertex.clientY = e.clientY;

            svg.getGraph().paint(svg);
        }
    }

    var busy = false;

    function svgMouseMove(e) {
        if (!busy) {
            busy = true;
            setTimeout(function() {
                mouseMove(e);
                busy = false;
            }, 10);
        }
    }

    function svgMouseUp(e) {
        var vertex = Vertex.selected;
        if (vertex !== undefined && vertex !== null) {
            vertex.isClicked = false;
        }
    }

    function doubleClickCircle(e) {
        createCPTtable();
    }

    this.addContextMenu = function() {
        $.contextMenu({
            selector: '#original-canvas .context-menu-node',
            callback: function(key, options) {
                switch (key) {
                    case 'quit':
                        //$(this).contextMenu('hide');
                        break;
                    case 'edit':
                        createCPTtable();
                        break;
                }
            },
            items: {
                'edit': {
                    name: 'Edit CPT',
                    icon: 'edit'
                },
                'delete': {
                    name: 'Delete',
                    icon: 'delete'
                },
                'sep1': '---------',
                'quit': {
                    name: 'Quit',
                    icon: 'context-menu-icon context-menu-icon-quit'
                }
            }
        });
        $('.context-menu-one').on('click', function(e) {
            //console.log('clicked', this);
        });
    }

    function circleInListDragStart(e) {
        e.originalEvent.dataTransfer.setData("id", e.target.id);
    }

    function circleInListDragover(e) {
        e.preventDefault();
    }

    function circleInListEnter(e) {
        var target = $(e.target);
        if (target.hasClass('node-box')) {
            target.addClass('dragEnter');
        }
    }

    function circleInListLeave(e) {
        var target = $(e.target);
        if (target.hasClass('node-box')) {
            target.removeClass('dragEnter');
        }
    }

    function messUpStr(str) {
        var query = [];
        var evidence = [];
        var isEvi = false;
        str = str.replace(/\s/g, '');
        for (var i = 0, len = str.length; i < len; i++) {
            var c = str[i];
            if (c === ',') {
                continue;
            }
            if (c === '|') {
                isEvi = true;
                continue;
            }
            if (isEvi) {
                evidence.push(c);
            } else {
                query.push(c);
            }
        }
        var result = '';
        query.forEach(function(item) {
            result += '+' + item;
        });
        evidence.forEach(function(item) {
            result += '|' + item;
        });
        return result;
    }

    function cleanUpStr(str) {
        var query = [];
        var evidence = [];
        var result = '';

        for (var i = 0, len = str.length; i < len; i++) {
            var c = str[i];
            i++;
            var nc = str[i];
            if (c === '+') {
                evidence.remove(nc);
                query.remove(nc);
                query.push(nc);
            } else if (c === '|') {
                query.remove(nc);
                evidence.remove(nc);
                evidence.push(nc);
            } else if (c === '-') {
                query.remove(nc);
                evidence.remove(nc);
            }
        }

        if (query.length > 0) {
            result = query[0];
            query.splice(0, 1);
            query.forEach(function(item) {
                result += ', ' + item;
            });
        }

        if (evidence.length > 0) {
            result += '|' + evidence[0];
            evidence.splice(0, 1);
            evidence.forEach(function(item) {
                result += ', ' + item;
            });
        }

        return result;
    }

    function circleInListDrop(e) {
        e.preventDefault();
        var target = $(e.target);
        var id = e.originalEvent.dataTransfer.getData('id');
        var varName = id.slice(-1);

        if (target.hasClass('var-in-list')) {
            target = target.parent();
        }

        if (target.hasClass('node-box')) {
            target.append($('#' + id));
            var id = target.attr('id');
            var queryUI = $('#query-str');
            var str = queryUI.text().slice(2, -1);
            var str = messUpStr(str);
            switch (id) {
                case 'vars-list':
                    str = cleanUpStr(str + '-' + varName);
                    break;
                case 'query-box':
                    str = cleanUpStr(str + '+' + varName);
                    break;
                case 'evidence-box':
                    str = cleanUpStr(str + '|' + varName);
                    break;
            }
            queryUI.text('P(' + str + ')');
        }
    }

    this.onMoralization = function() {
        if (DAGChanged) {
            DAGChanged = false;
            moralChanged = true;
            var svg = $('#moral-svg');
            moralGraph = originalGraph.clone('moral graph');
            svg.setGraph(moralGraph);
            moralGraph.paint(svg);
        }
    }

    this.onTriangulation = function() {
        if (moralChanged) {
            moralChanged = false
            var svg = $('#triangle-svg');
            triangulatedGraph = moralGraph.clone('triangulated graph');
            triangulatedGraph.moralize(false);
            triangulatedGraph.normalize();
            svg.setGraph(triangulatedGraph);
            triangulatedGraph.paint(svg);
        }
    }
}