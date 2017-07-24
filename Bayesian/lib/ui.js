$(function() {
    var mc = new MainController();

    book = $('.book:first');

    book.booklet({
        width: 900, // container width
        height: 550, // container height

        next: $('#btn-start'),
        finish: onFinish
    });

    function onFinish() {
        $('.book .prevPage').click(function() {
            book.booklet('prev');
        });

        $('.book .nextPage').click(function() {
            book.booklet('next');
        });

        $('#btn-start').click(function() {
            $('.b-page-3').css('visibility', 'visible');
        });

        $('#btn-spawn').click(mc.onSpawn);

        $(document).on('click', '#parents input', mc.onParentSelect);

        $('#parents .confirm').click(mc.onParentConfirm);
        $('#modal-cpt .confirm').click(mc.onCPTConfirm);

        $(document).on('mousedown', 'svg circle', mc.svgCircleMouseDown);
        $(document).on('mousemove', 'svg circle', mc.svgCircleMouseMove);
        $(document).on('mouseup', 'svg circle', mc.svgCircleMouseUp);

        $('.loading').css('display', 'none');
        $('.book').css('display', 'block');
    }
});

function MainController() {
    // CPT_var class
    function CPT_var(name) {
        this.name = name;
        this.var = null; // Variable object
        this.dist = null; // Distribution object
        this.parents = []; // string array - parents names
        this.p_objs = []; // CPT_var array - parents object
        this.c_objs = [];
        this.cx = 0; // x coordinate
        this.cy = 0; // y coordinate
        this.clientX = 0;
        this.clientY = 0;
        this.isClicked = false;
    }

    CPT_var.c_var = null; // current CPT_var object
    CPT_var.r = 20; // radius

    var CPT_vars = {}; // key is string variable name, value is a CPT_var object.
    CPT_var.c_var = null; // current CPT_var object

    function creatCPTtable() {
        var table = $('#table-cpt');
        var str = '';
        var c_name = CPT_var.c_var.name;
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
        var permute = Tool.permute(p_c.map(function(x) { return x.toUpperCase() }));

        str = '';
        permute.forEach(function(tr) {
            str += '<tr>';
            tr.forEach(function(td) {
                str += '<td>' + td + '</td>'
            });
            str += '<td><input type="text"></td></tr>';
        });
        table.html(th + str);
    }

    this.onSpawn = function() {
        var selector = $('#v-selector');
        var c_var = selector.val();
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
                var upper = c_var.toUpperCase();
                CPT_vars[c_var].var = new Variable(c_var, [upper, '-' + upper]);

            } else {
                // already has this variable, select another one.
                console.log('already has this variable, select another one.');
            }

            if (Object.keys(CPT_vars).length === 1) {
                // first node
                creatCPTtable();
                $('#modal-cpt').modal();
            } else {
                $('#parents').modal();
            }
        } else {
            // no variable is selected
        }
    }

    this.onParentSelect = function() {

    }

    this.onParentConfirm = function() {
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

        creatCPTtable();
        $('#modal-cpt').modal();
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

    function addNode(svgSelector, varName) {
        var node = CPT_vars[varName];
        var svg = document.getElementById(svgSelector);
        var newElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); //Create a path in SVG's namespace

        node.cx = 50;
        node.cy = 50;
        newElement.setAttribute('class', 'draggable');
        newElement.setAttribute('cx', node.cx);
        newElement.setAttribute('cy', node.cy);
        newElement.setAttribute('r', CPT_var.r);
        newElement.setAttribute('stroke', 'black');
        newElement.setAttribute('stroke-width', 1);
        newElement.setAttribute('name', varName);
        newElement.setAttribute('fill', 'white');

        svg.appendChild(newElement);

        var newElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        newElement.setAttribute('x', node.cx);
        newElement.setAttribute('y', node.cy);
        newElement.innerHTML = varName;
        newElement.setAttribute('stroke', 'black');
        newElement.setAttribute('stroke-width', 1);
        newElement.setAttribute('font-size', '2em');
        newElement.setAttribute('fill', 'black');
        newElement.setAttribute('text-anchor', 'middle');
        newElement.setAttribute('alignment-baseline', 'middle');

        svg.appendChild(newElement);
    }

    function drawNodePath(svgSelector, varName) {
        var svg = document.getElementById(svgSelector);
        var c_obj = CPT_vars[varName];
        var p = c_obj.p_objs;
        var c = c_obj.c_objs;
        var newElement;

        var p_line_str = '#' + svgSelector + ' line[name=' + varName + ']';
        var c_line_str = '#' + svgSelector + ' line[p-name=' + varName + ']';
        $(p_line_str).remove();
        $(c_line_str).remove();

        p.forEach(function(item) {
            newElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            newElement.setAttribute('x1', item.cx);
            newElement.setAttribute('y1', item.cy);
            newElement.setAttribute('x2', c_obj.cx);
            newElement.setAttribute('y2', c_obj.cy);
            newElement.setAttribute('marker-end', 'url(#triangle)');
            newElement.setAttribute('stroke', 'black');
            newElement.setAttribute('stroke-width', 3);
            newElement.setAttribute('name', varName);
            newElement.setAttribute('p-name', item.name);
            svg.appendChild(newElement);
        });

        c.forEach(function(item) {
            newElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            newElement.setAttribute('x1', c_obj.cx);
            newElement.setAttribute('y1', c_obj.cy);
            newElement.setAttribute('x2', item.cx);
            newElement.setAttribute('y2', item.cy);
            newElement.setAttribute('marker-end', 'url(#triangle)');
            newElement.setAttribute('stroke', 'black');
            newElement.setAttribute('stroke-width', 3);
            newElement.setAttribute('name', item.name);
            newElement.setAttribute('p-name', varName);
            svg.appendChild(newElement);
        });


        // var nodes = document.querySelectorAll("line");

        //   var i = nodes.length;
        //  while (i--) {
        // change z-index, so that circles cover lines 
        //       svg.insertBefore(nodes[i], svg.firstChild);
        // }
        $(p_line_str).prependTo('#' + svgSelector);
        $(c_line_str).prependTo('#' + svgSelector);
    }

    this.onCPTConfirm = function() {
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

        CPT_var.c_var.dist = new Distribution(map, vars);

        addNode('step1-svg', CPT_var.c_var.name);
        drawNodePath('step1-svg', CPT_var.c_var.name);
    }

    this.svgCircleMouseDown = function(e) {
        var target = $(e.target);
        var name = target.attr('name');
        var varObj = CPT_vars[name];
        CPT_var.c_var = varObj;

        varObj.cx = parseInt(target.attr('cx'));
        varObj.cy = parseInt(target.attr('cy'));

        varObj.clientX = e.clientX;
        varObj.clientY = e.clientY;

        varObj.isClicked = true;
    }

    this.svgCircleMouseMove = function(e) {
        var target = $(e.target);
        var text = target.next();
        var varObj = CPT_var.c_var;
        var newCx = varObj.cx + e.clientX - varObj.clientX;
        var newCy = varObj.cy + e.clientY - varObj.clientY;

        if (varObj.isClicked) {
            target.attr('cx', newCx);
            target.attr('cy', newCy);
            text.attr('x', newCx);
            text.attr('y', newCy);

            varObj.cx = newCx;
            varObj.cy = newCy;
            varObj.clientX = e.clientX;
            varObj.clientY = e.clientY;
            drawNodePath('step1-svg', varObj.name);
        }
    }

    this.svgCircleMouseUp = function(e) {
        CPT_var.c_var.isClicked = false;
        var target = $(e.target);

        CPT_var.c_var.cx = parseInt(target.attr('cx'));
        CPT_var.c_var.cy = parseInt(target.attr('cy'));
    }
}