$(function() {
    var mc = new MainController();
    book = $('.book:first');
    book.booklet({
        width: 900, // container width
        height: 550, // container height
        next: $('#btn-start'),
        finish: onFinish,
        onPage: { 6: mc.onMoralization, 8: mc.onTriangulation, 10: mc.onJT }
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

        mc.resetOpt();

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
    $(document).on('click', '#btn-cons-jt', onConstructJT);
    $(document).on('click', '#btn-decons-jt', onDeconstructJT);
    $(document).on('click', '#parents .confirm', onParentConfirm);
    $(document).on('click', '#modal-cpt .confirm', onCPTConfirm);
    $(document).on('change', '#parents :checkbox', onParentSelected);

    var originalGraph = new Graph('original graph');
    $('#original-svg').setGraph(originalGraph);
    var selectorHTML = $('#div-selector').html();
    var moralGraph = null;
    var triangulatedGraph = null;
    var optionList =[];

    // CPT_var class
    function CPT_var(name) {
        this.name = name;
        this.var = null; // Variable object
        this.dist = null; // Distribution object
        this.parents = []; // parents object list
        this.children = []; // children object list
    }

    var c_var = null; // current CPT_var object
    var CPT_vars = {}; // key is string variable name, value is a CPT_var object.
    var DAGChanged = false;
    var moralChanged = false;
    var triangleChanged = false;
    var jtChanged = false;

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

        c_var.parents.forEach(function(p) {
            p_c.push(p.name);
        });

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
                    str += '<th>' + item + '</th>'
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

    // insert node in DAG
    // this function for sample feature
    function insertNode(name, map, parents, location) {
        var up = name.toUpperCase(),
            low = name.toLowerCase(),
            mLow = '-' + low;

        optionList.remove(up);
        resetOptions(optionList);

        var varOjb = new CPT_var(up);
        CPT_vars[up] = varOjb;
        addToQueryList(varOjb);

        varOjb.var = new Variable(up, [low, mLow]);

        var mapVar = [];
        parents.forEach(function(item) {
            varOjb.parents.push(item);
            item.children.push(varOjb);
            mapVar.push(item.var);
        });

        mapVar.push(varOjb.var);

        varOjb.dist = new Distribution(map, mapVar);

        var vertex = new Vertex();
        vertex.name = varOjb.name;
        vertex.cx = location.cx;
        vertex.cy = location.cy;
        originalGraph.addVertex(vertex);

        return varOjb;
    }

    this.resetOpt = function(){
        resetOptions();
    }

    function resetOptions(list) {
        var selector, item;

        $('#div-selector').html('');

        selector = $(selectorHTML);

        if (list === undefined) {
            optionList = [];
            for (var i = 65; i < 91; i++) { // from A to Z
                item = String.fromCharCode(i);
                optionList.push(item);
            }
            return resetOptions(optionList);
        } else {
            list.forEach(function(item){
                selector.append('<option value="' + item.toLowerCase() + '">' + item.toUpperCase() + '</option>');
            });
        }

        $('#div-selector').append(selector);
        [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function(el) {
            new SelectFx(el, {
                stickyPlaceholder: false,
                onChange: function(val) {
                    document.querySelector('span.cs-placeholder').style.backgroundColor = val;
                }
            });
        });
    }

    // display a sample DAG
    function onSample() {
        // initialize
        var svg = $('#original-svg');
        DAGChanged = true;
        CPT_vars = [];
        $('#vars-list').html('');
        var map;
        originalGraph = new Graph();
        svg.setGraph(originalGraph);
        resetOptions();
        $('.node-box').html('');
        $('#query-str').text('P()');

        // -------------
        map = {};
        map[['a']] = 0.1;
        map[['-a']] = 0.9;
        var varA = insertNode('A', map, [], { cx: 215, cy: 70 });

        map = {};
        map[['a', 'b']] = 0.1;
        map[['a', '-b']] = 0.9;
        map[['-a', 'b']] = 0.9;
        map[['-a', '-b']] = 0.1;
        var varB = insertNode('B', map, [varA], { cx: 120, cy: 140 });

        map = {};
        map[['a', 'c']] = 0.2;
        map[['a', '-c']] = 0.7;
        map[['-a', 'c']] = 0.5;
        map[['-a', '-c']] = 0.5;
        var varC = insertNode('C', map, [varA], { cx: 310, cy: 140 });

        map = {};
        map[['b', 'd']] = 0.4;
        map[['b', '-d']] = 0.6;
        map[['-b', 'd']] = 0.7;
        map[['-b', '-d']] = 0.3;
        var varD = insertNode('D', map, [varB], { cx: 120, cy: 270 });

        map = {};
        map[['c', 'e']] = 0.4;
        map[['c', '-e']] = 0.6;
        map[['-c', 'e']] = 0.7;
        map[['-c', '-e']] = 0.3;
        var varE = insertNode('E', map, [varC], { cx: 310, cy: 270 });

        map = {};
        map[['d', 'e', 'f']] = 0.1;
        map[['d', 'e', '-f']] = 0.9;
        map[['d', '-e', 'f']] = 0.5;
        map[['d', '-e', '-f']] = 0.5;
        map[['-d', 'e', 'f']] = 0.4;
        map[['-d', 'e', '-f']] = 0.6;
        map[['-d', '-e', 'f']] = 0.8;
        map[['-d', '-e', '-f']] = 0.2;
        var varF = insertNode('F', map, [varD, varE], { cx: 215, cy: 350 });

        originalGraph.addEdgeByName(varA.name, varB.name, { 'isDirected': true });
        originalGraph.addEdgeByName(varA.name, varC.name, { 'isDirected': true });
        originalGraph.addEdgeByName(varB.name, varD.name, { 'isDirected': true });
        originalGraph.addEdgeByName(varC.name, varE.name, { 'isDirected': true });
        originalGraph.addEdgeByName(varD.name, varF.name, { 'isDirected': true });
        originalGraph.addEdgeByName(varE.name, varF.name, { 'isDirected': true });

        originalGraph.paint(svg);
    }

    function onSpawn() {
        var selector = $('#v-selector');
        var selected = selector.val();

        if (selected === undefined || selected === null || selected === '') {
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

                // remove option
                optionList.remove(selected);
                resetOptions(optionList);
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


    function onMoralize() {
        var svg = $('#moral-svg');
        if (svg.children('circle').length) {
            if (svg.data('moralized') === 'true') {
                return;
            } else {
                var g = svg.getGraph();
                g.moralize();
                g.paint(svg, true);
                svg.data('moralized', 'true');
            }
        }
    }

    function onDemoralize() {
        var svg = $('#moral-svg');
        if (svg.children('circle').length) {
            if (svg.data('moralized') === 'false') {
                return;
            } else {
                var g = svg.getGraph();
                g.demoralize();
                g.paint(svg);
                svg.data('moralized', 'false');
            }
        }
    }

    function onConstructJT() {
        var svg = $('#jt-svg');
        if (svg.children('circle').length) {
            if (svg.data('jt-constructed') === 'true') {
                return;
            } else {
                var g = svg.getGraph();
                g.constructJT();
                g.paint(svg, true);
                svg.data('jt-constructed', 'true');
            }
        }
    }

    function onDeconstructJT() {
        var svg = $('#jt-svg');
        if (svg.children('circle').length) {
            if (svg.data('jt-constructed') === 'false') {
                return;
            } else {
                var g = svg.getGraph();
                g.deconstructJT();
                g.paint(svg);
                svg.data('jt-constructed', 'false');
            }
        }
    }

    function onParentSelected() {
        $('#parents .modal-hint').css('visibility', 'hidden');
    }

    function onParentConfirm() {
        var c_obj = CPT_vars[c_var.name];

        var p = $('#parents input:checked');

        if (p.length === 0) {
            //$('#parents .modal-hint').css('visibility', 'visible');
        }
        p.each(function(index, item) {
            var p = $(item).attr('id').slice(-1);
            var p_obj = CPT_vars[p];

            c_obj.parents.push(p_obj);
            p_obj.children.push(c_obj);
            originalGraph.addEdgeByName(p_obj.name, c_obj.name, { 'isDirected': true });
        });
        $('#parents').modal('hide');
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

        if (e.which === 1) {
            // 1 means left click

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
    }

    function onTriangulate() {
        var svg = $('#triangle-svg');
        if (svg.children('circle').length) {
            if (svg.data('triangulated') === 'true') {
                return;
            } else {
                var g = svg.getGraph();
                g.triangulate().paint(svg, true);
                svg.data('triangulated', 'true');
                triangleChanged = true;
            }
        }
    }

    function onDetriangulate() {
        var svg = $('#triangle-svg');

        if (svg.children('circle').length) {
            if (svg.data('triangulated') === 'false') {
                return;
            } else {
                var g = svg.getGraph();
                g.detriangulate().paint(svg);
                svg.data('triangulated', 'false');
            }
        }
    }

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

    function deleteVertex(circle) {
        var name = circle.attr('name');
        var svg = circle.parent();
        var graph = svg.getGraph();

        graph.deleteVertex(name);
        graph.paint(svg);

        var varObj = CPT_vars[name];
        CPT_vars[name] = undefined;

        varObj.parents.forEach(function(p) {
            p.children.remove(varObj);
        });

        varObj.children.forEach(function(c) {
            c.parents.remove(varObj);
        });

        optionList.push(name.toUpperCase());
        optionList.sort();
        resetOptions(optionList);
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
                    case 'delete':
                        deleteVertex($(this));
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
            svg.data('moralized', 'false');
            svg.setGraph(moralGraph);
            moralGraph.paint(svg);
        }
        $('svg line.line-animation').removeClass('line-animation');
    }

    this.onTriangulation = function() {
        if (moralChanged) {
            moralChanged = false;
            triangleChanged = true;
            var svg = $('#triangle-svg');
            triangulatedGraph = moralGraph.clone('triangulated graph');
            triangulatedGraph.moralize(false).normalize();
            svg.data('triangulated', 'false');
            svg.setGraph(triangulatedGraph);
            triangulatedGraph.paint(svg);
        }
        $('svg line.line-animation').removeClass('line-animation');
    }

    this.onJT = function() {
        if (triangleChanged) {
            triangleChanged = false;
            jtChanged = true;
            var svg = $('#jt-svg');
            jtGraph = triangulatedGraph.clone('junction tree graph');
            jtGraph.triangulate().normalize().discardOrder();
            svg.data('jt-constructed', 'false');
            svg.setGraph(jtGraph);
            jtGraph.paint(svg);
        }
        $('svg line.line-animation').removeClass('line-animation');
    }
}