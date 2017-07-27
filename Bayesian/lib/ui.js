$(function() {
    var mc = new MainController();
    book = $('.book:first');
    book.booklet({
        width: 900, // container width
        height: 550, // container height
        next: $('#btn-start'),
        finish: onFinish,
        onPage: { 6: mc.onStep3 }
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
    $(document).on('click', '#btn-moralize', onMoralize);
    $(document).on('click', '#btn-demoralize', onDemoralize);
    $(document).on('click', '#parents .confirm', onParentConfirm);
    $(document).on('click', '#modal-cpt .confirm', onCPTConfirm);

    function btn_start() {
        $('.b-page-3').css('visibility', 'visible');
    };
    // CPT_var class
    function CPT_var(name) {
        this.name = name;
        this.var = null; // Variable object
        this.dist = null; // Distribution object
        this.parents = []; // string array - parents names
        this.p_objs = []; // CPT_var array - parents object
        this.c_objs = []; // CPT_var array - children object
        this.cx = {}; // x coordinate format example {svgID:cx} cx value in svg 
        this.cy = {}; // y coordinate
        this.clientX = 0;
        this.clientY = 0;
        this.isClicked = false;
        this.svg = []; // corresponding svg object array. for example: circle text
    }
    CPT_var.c_var = null; // current CPT_var object
    CPT_var.r = 20; // radius
    var CPT_vars = {}; // key is string variable name, value is a CPT_var object.
    CPT_var.c_var = null; // current CPT_var object

    function createCPTtable() {
        var table = $('#table-cpt');
        var str = '';
        var c_name = CPT_var.c_var.name;
        var dist = CPT_vars[c_name].dist;
        var isNew = dist === null;
        var p_c = []; // parents + current variable
        p_c = p_c.concat(CPT_var.c_var.parents);
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
        var default_p = 1 / permute.length;
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
        $('#modal-cpt').modal();
    }

    function addToListInStep2(varObj) {
        var str = '<span id="circle-in-list-' + varObj.name + '" ';
        var varCircle = $(str + 'class="var-in-list" draggable="true">' + varObj.name + '</span>');
        $('#vars-list').append(varCircle);
    }

    function onSpawn() {
        var selector = $('#v-selector');
        var c_var = selector.val().toUpperCase();
        if (typeof c_var === 'string') {
            var varObj = CPT_vars[c_var];
            if (varObj === undefined) {
                CPT_var.c_var = new CPT_var(c_var);
                var otherVars = Object.keys(CPT_vars);
                CPT_vars[c_var] = CPT_var.c_var;
                var modal_body = $('#parents .modal-body');
                modal_body.html('');
                otherVars.forEach(function(i) {
                    var input = $('<input id="toggle_p_' + i + '" type="checkbox">');
                    var lable = $('<label for="toggle_p_' + i + '">' + i + '</label>');
                    modal_body.append(input);
                    modal_body.append(lable);
                });
                var upper = c_var.toLowerCase();
                CPT_var.c_var.var = new Variable(c_var, [upper, '-' + upper]);
                addToListInStep2(CPT_var.c_var);
            } else {
                // already has this variable, select another one.
                console.log('already has this variable, select another one.');
            }
            if (Object.keys(CPT_vars).length === 1) {
                // first node
                createCPTtable();
            } else {
                $('#parents').modal();
            }
        } else {
            // no variable is selected
        }
    }

    function addLine(svg, fromObj, toObj, isMoral, name, p_name, marker, animation) {
        var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        var svgId = svg.attr('id');
        var fromX = fromObj.cx[svgId];
        var fromY = fromObj.cy[svgId];
        var toX = toObj.cx[svgId];
        var toY = toObj.cy[svgId];

        if (!Number.isInteger(fromX) || !Number.isInteger(fromY) || !Number.isInteger(toX) || !Number.isInteger(toY)) {
            return;
        }

        newLine.setAttribute('x1', fromX);
        newLine.setAttribute('y1', fromY);
        newLine.setAttribute('x2', toX);
        newLine.setAttribute('y2', toY);
        newLine.setAttribute('stroke', 'black');
        newLine.setAttribute('stroke-width', 3);
        newLine.setAttribute('marker-end', marker);
        newLine.setAttribute('moral', '' + isMoral);
        newLine.setAttribute('name', name);
        newLine.setAttribute('p-name', p_name);
        if (animation === true) {
            $(newLine).attr('class', 'line-animation');
        } else {
            $(newLine).attr('class', '');
        }

        $(svg).prepend(newLine);
    }

    function onDemoralize() {
        var svg = $('#step3-svg');
        if (svg.data('been-moralized') === 'false') {
            return;
        }

        $('#step3-svg>line[moral="true"]').remove();
        svg.children('line').attr('marker-end', 'url(#arrow3)');
        svg.data('been-moralized', 'false');
        svg.data('moralize', 'false');
    }

    function addMoralLines(svg, animation) {
        var svgID = svg.attr('id');
        var moralize = svg.data('moralize');
        if (moralize === undefined || moralize === 'false' || svg.data('been-moralized') === 'true') {
            return;
        }

        $('#' + svgID + ' line[moral="true"]').remove();
        // add moral lines
        var values = [];
        for (var key in CPT_vars) {
            values.push(CPT_vars[key]);
        }
        var lines = []; // line names format "from+to"

        values.forEach(function(item) {
            var p = item.p_objs;
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

        lines.forEach(function(item) {
            var fromTo = item.split('+');
            var fromObj = CPT_vars[fromTo[0]];
            var toObj = CPT_vars[fromTo[1]];
            addLine(svg, fromObj, toObj, true, '', '', '', animation);
        });

        svg.children('line').attr('marker-end', '');
        svg.data('been-moralized', 'true');
    }

    function onMoralize() {
        var svg = $('#step3-svg');
        svg.data('moralize', 'true');
        addMoralLines(svg, true);
    }

    function onParentConfirm() {
        $('#parents input:checked').each(function(index, item) {
            var p = $(item).attr('id').slice(-1);
            var c_obj = CPT_vars[CPT_var.c_var.name];
            var p_obj = CPT_vars[p];
            var parents = c_obj.parents;
            var p_objs = c_obj.p_objs;
            var c_objs = p_obj.c_objs;
            parents.push(p);
            p_objs.push(p_obj);
            c_objs.push(c_obj);
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

    function calcXY(svg, node) {
        var svgId = svg.attr('id');
        var p = node.p_objs;
        var MAX_Y = svg.height() - CPT_var.r;
        var minX = svg.width() - CPT_var.r;
        var maxX = 0;
        var maxY = 0;
        var x, y;
        p.forEach(function(item) {
            x = item.cx[svgId];
            y = item.cy[svgId];
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

        y = maxY + CPT_var.r * 4;
        y = (y > MAX_Y) ? MAX_Y : y;
        y = (y < CPT_var.r) ? CPT_var.r : y;

        x = minX + (((maxX - minX) / 2) | 0);

        node.cx[svgId] = x;
        node.cy[svgId] = y;
    }

    function addNode(svg, varName) {
        var node = CPT_vars[varName];

        var svgId = svg.attr('id');
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); //Create a path in SVG's namespace
        calcXY(svg, node);

        circle.setAttribute('class', 'draggable context-menu-node');
        circle.setAttribute('cx', node.cx[svgId]);
        circle.setAttribute('cy', node.cy[svgId]);
        circle.setAttribute('r', CPT_var.r);
        circle.setAttribute('stroke', 'black');
        circle.setAttribute('stroke-width', 2);
        circle.setAttribute('name', varName);
        circle.setAttribute('fill', 'white');
        node.svg[0] = $(circle);
        svg.append(circle);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.cx[svgId]);
        text.setAttribute('y', node.cy[svgId]);
        text.setAttribute('name', varName);
        text.innerHTML = varName;
        text.setAttribute('stroke', 'black');
        text.setAttribute('stroke-width', 1);
        text.setAttribute('font-size', '2em');
        text.setAttribute('fill', 'black');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        node.svg[1] = $(text);
        svg.append(text);
    }

    function drawNodePath(svg, varName) {
        var c_obj = CPT_vars[varName];
        var p = c_obj.p_objs;
        var c = c_obj.c_objs;
        var svgID = svg.attr('id');
        var markerID = svg.data('markerID');

        $('#' + svgID + ' line[name=' + varName + ']').remove();
        $('#' + svgID + ' line[p-name=' + varName + ']').remove();

        p.forEach(function(item) {
            addLine(svg, item, c_obj, false, varName, item.name, 'url(#' + markerID + ')');
        });

        c.forEach(function(item) {
            addLine(svg, c_obj, item, false, item.name, varName, 'url(#' + markerID + ')');
        });
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
        var name = CPT_var.c_var.name;
        if (CPT_var.c_var.dist === null) {
            var svg = $('#step1-svg');
            addNode(svg, name);
            drawNodePath(svg, name);
        }
        CPT_var.c_var.dist = new Distribution(map, vars);
    }

    function svgCircleMouseDown(e) {
        var target = $(e.target);
        var name = target.attr('name');
        var varObj = CPT_vars[name];

        var svg = target.parent();
        varObj.svg[0] = target;
        varObj.svg[1] = svg.children('text[name="' + name + '"]');

        svg.data('markerID', svg.children('defs').children('marker').attr('id'));

        CPT_var.c_var = varObj;
        switch (e.which) {
            case 1:
                // Left Mouse button pressed.
                break;
            case 2:
                // Middle Mouse button pressed.
            case 3:
                // Right Mouse button pressed.
            default:
                //'You have a strange Mouse!
                return;
        }

        var svgId = svg.attr('id');
        varObj.cx[svgId] = parseInt(target.attr('cx'));
        varObj.cy[svgId] = parseInt(target.attr('cy'));
        varObj.clientX = e.clientX;
        varObj.clientY = e.clientY;
        varObj.isClicked = true;
    }

    function svgCircleMouseMove(e) {}

    function svgCircleMouseUp(e) {}

    function svgStartDrag(e) {
        e.preventDefault();
    }

    function mouseMove(e) {
        var varObj = CPT_var.c_var;

        if (varObj instanceof CPT_var && varObj.isClicked) {

            var svg = $(e.target);
            if (svg.prop('tagName') === 'circle') {
                svg = svg.parent();
            }

            var svgId = svg.attr('id');
            var varName = varObj.name;
            var target = varObj.svg[0];
            var text = varObj.svg[1];

            var newCx = varObj.cx[svgId] + e.clientX - varObj.clientX;
            var newCy = varObj.cy[svgId] + e.clientY - varObj.clientY;

            if (!Number.isInteger(newCx) || !Number.isInteger(newCy)) {
                return;
            }

            target.attr('cx', newCx);
            target.attr('cy', newCy);
            text.attr('x', newCx);
            text.attr('y', newCy);
            varObj.cx[svgId] = newCx;
            varObj.cy[svgId] = newCy;
            varObj.clientX = e.clientX;
            varObj.clientY = e.clientY;

            drawNodePath(svg, varName);

            svg.data('been-moralized', 'false');
            addMoralLines(svg);
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
        var varObj = CPT_var.c_var;
        if (varObj !== undefined && varObj !== null && CPT_var.c_var.isClicked) {
            CPT_var.c_var.isClicked = false;
        }
    }

    function doubleClickCircle(e) {
        console.log("double");
        createCPTtable();
    }

    this.addContextMenu = function() {
        $.contextMenu({
            selector: '#step1-canvas .context-menu-node',
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
            console.log('clicked', this);
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

    this.onStep3 = function() {
        $('#step3-canvas').html($('#step1-canvas').html());

        var svg = $('#step3-canvas').children('svg');
        svg.attr('id', 'step3-svg');
        //svg.children('circle').removeClass('draggable');
        svg.find('marker').attr('id', 'arrow3');
        svg.children('line').attr('marker-end', 'url(#arrow3)');
        svg.data('moralize', 'false');
        svg.data('been-moralized', 'false');

        for (var key in CPT_vars) {
            var varObj = CPT_vars[key];
            varObj.cx['step3-svg'] = varObj.cx['step1-svg'];
            varObj.cy['step3-svg'] = varObj.cy['step1-svg'];
        }
    }
}