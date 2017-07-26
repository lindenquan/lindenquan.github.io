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
        this.c_objs = [];
        this.cx = 0; // x coordinate
        this.cy = 0; // y coordinate
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

    function calcXY(svgID, node) {
        var svg = $('#' + svgID);
        var p = node.p_objs;
        var minX = svg.width();
        var maxX = 0;
        var maxY = 0;
        var x, y;
        p.forEach(function(item) {
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
        node.cx = minX + (((maxX - minX) / 2) | 0);
        node.cy = maxY + CPT_var.r * 4;
    }

    function addNode(svgID, varName) {
        var node = CPT_vars[varName];
        var svg = document.getElementById(svgID);
        var newElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); //Create a path in SVG's namespace
        calcXY(svgID, node);
        newElement.setAttribute('class', 'draggable context-menu-node');
        newElement.setAttribute('cx', node.cx);
        newElement.setAttribute('cy', node.cy);
        newElement.setAttribute('r', CPT_var.r);
        newElement.setAttribute('stroke', 'black');
        newElement.setAttribute('stroke-width', 2);
        newElement.setAttribute('name', varName);
        newElement.setAttribute('fill', 'white');
        node.svg.push($(newElement));
        svg.appendChild(newElement);
        newElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        newElement.setAttribute('x', node.cx);
        newElement.setAttribute('y', node.cy);
        newElement.innerHTML = varName;
        newElement.setAttribute('stroke', 'black');
        newElement.setAttribute('stroke-width', 1);
        newElement.setAttribute('font-size', '2em');
        newElement.setAttribute('fill', 'black');
        newElement.setAttribute('text-anchor', 'middle');
        newElement.setAttribute('alignment-baseline', 'middle');
        newElement.setAttribute('dominant-baseline', 'middle');
        node.svg.push($(newElement));
        svg.appendChild(newElement);
    }

    function drawNodePath(svgID, varName) {
        var svg = document.getElementById(svgID);
        var c_obj = CPT_vars[varName];
        var p = c_obj.p_objs;
        var c = c_obj.c_objs;
        var newElement;
        var p_line_str = '#' + svgID + ' line[name=' + varName + ']';
        var c_line_str = '#' + svgID + ' line[p-name=' + varName + ']';
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
        $(p_line_str).prependTo('#' + svgID);
        $(c_line_str).prependTo('#' + svgID);
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
            addNode('step1-svg', name);
            drawNodePath('step1-svg', name);
        }
        CPT_var.c_var.dist = new Distribution(map, vars);
    }

    function svgCircleMouseDown(e) {
        var target = $(e.target);
        var name = target.attr('name');
        var varObj = CPT_vars[name];
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
        varObj.cx = parseInt(target.attr('cx'));
        varObj.cy = parseInt(target.attr('cy'));
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
            var target = varObj.svg[0];
            var text = varObj.svg[1];
            var newCx = varObj.cx + e.clientX - varObj.clientX;
            var newCy = varObj.cy + e.clientY - varObj.clientY;
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
            selector: '.context-menu-node',
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
            if (c === '+') {
                evidence.remove(str[i]);
                query.push(str[i]);
            } else if (c === '|') {
                query.remove(str[i]);
                evidence.push(str[i]);
            } else if (c === '-') {
                query.remove(str[i]);
                evidence.remove(str[i]);
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
}