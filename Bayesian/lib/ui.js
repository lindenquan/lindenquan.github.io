$(function() {
    var ms = _init();

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

        $('#btn-spawn').click(ms.onSpawn);

        $(document).on('click', '#parents input', ms.onParentSelect);

        $('#parents .confirm').click(ms.onParentConfirm);
        $('#modal-cpt .confirm').click(ms.onCPTConfirm);

        $(document).on('mousedown', 'svg circle', ms.svgCircleMouseDown);
        $(document).on('mousemove', 'svg circle', ms.svgCircleMouseMove);
        $(document).on('mouseup', 'svg circle', ms.svgCircleMouseUp);

        $('.loading').css('display', 'none');
        $('.book').css('display', 'block');
    }
});



function _init() {
    var ms = {};
    // CPT_var class
    function CPT_var(name) {
        this.name = name;
        this.var = null; // Variable object
        this.dist = null; // Distribution object
        this.parents = []; // string array parents names
        this.cx = 0; // x coordinate
        this.cy = 0; // y coordinate
        this.clientX = 0;
        this.clientY = 0;
        this.isClicked = false;
    }

    CPT_var.c_var = null; // current CPT_var object
    CPT_var.r = 20; // radius
    CPT_var.node_bc = '<defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">\
<stop offset="0%" style="stop-color:rgb(240,240,240);stop-opacity:1" />\
<stop offset="100%" style="stop-color:rgb(200,200,200);stop-opacity:1" />\
</linearGradient></defs>' // node background color 

    $('svg').append(CPT_var.node_bc);

    jQuery.fn.extend({
        attrs: function(attributeName) {
            var results = [];
            var tmp;
            $.each(this, function(i, item) {
                tmp = item.getAttribute(attributeName);
                if (tmp) {
                    results.push(tmp);
                }
            });
            return results;
        }
    });

    var CPT_vars = {}; // key is string variable name, value is a CPT_var object.
    CPT_var.c_var = null; // current CPT_var object

    ms.creatCPTtable = function() {
        var table = $('#table-cpt');
        var str = '';
        var c_name = CPT_var.c_var.name;
        var p_c = CPT_var.c_var.parents; // parents + current variable
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

    ms.onSpawn = function() {
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
                ms.creatCPTtable();
                $('#modal-cpt').modal();
            } else {
                $('#parents').modal();
            }
        } else {
            // no variable is selected
        }
    }

    ms.onParentSelect = function() {
        var p = $(this).attr('id').slice(-1);
        var parents = CPT_vars[CPT_var.c_var.name].parents;

        if (!$(this).is(':checked')) {
            // remove parent
            var index = parents.indexOf(p);
            parents.splice(index, 1);
        } else {
            // add parent
            parents.push(p);
        }
    }

    ms.onParentConfirm = function() {
        ms.creatCPTtable();
        $('#modal-cpt').modal();
    }

    ms.onCPTConfirm = function() {
        var svg = document.getElementById('step1-svg');
        var newElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); //Create a path in SVG's namespace

        newElement.setAttribute('class', 'draggable');
        newElement.setAttribute('cx', 50);
        newElement.setAttribute('cy', 50);
        newElement.setAttribute('r', CPT_var.r);
        newElement.setAttribute('stroke', 'black');
        newElement.setAttribute('stroke-width', 1);
        newElement.setAttribute('name', CPT_var.c_var.name);
        newElement.setAttribute('fill', 'url(#grad1)');

        svg.appendChild(newElement);

        var newElement = document.createElementNS('http://www.w3.org/2000/svg', 'text'); //Create a path in SVG's namespace

        newElement.setAttribute('x', 50);
        newElement.setAttribute('y', 50);
        newElement.innerHTML = CPT_var.c_var.name;
        newElement.setAttribute('stroke', 'black');
        newElement.setAttribute('stroke-width', 1);
        newElement.setAttribute('font-size', '2em');
        newElement.setAttribute('fill', 'black');
        newElement.setAttribute('text-anchor', 'middle');
        newElement.setAttribute('alignment-baseline', 'middle');

        svg.appendChild(newElement);
    }

    ms.svgCircleMouseDown = function(e) {
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

    ms.svgCircleMouseMove = function(e) {
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
        }
    }

    ms.svgCircleMouseUp = function(e) {
        CPT_var.c_var.isClicked = false;
    }

    return ms;
}