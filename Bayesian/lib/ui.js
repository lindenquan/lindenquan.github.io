$(function() {
  if (detectIE()) {
    $('.loading').css('visibility', 'hidden');
    $('#browser-unsupport').css('display', 'block');
    return;
  }

  var mc = new MainController();
  book = $('.book:first');

  book.booklet({
    width: 900, // container width
    height: 550, // container height
    next: $('#btn-start'),
    keyboard: false,
    finish: onFinish,
    onPage: { 4: mc.onMoralization, 6: mc.onTriangulation, 8: mc.onJT, 10: mc.onPropagation, 12: mc.onQuery }
  });

  function onFinish() {
    window.location.hash = '#/page/1';

    mc.onBookReady();

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
  $(document).on('mousedown', 'svg circle, svg rect', svgCircleMouseDown);
  $(document).on('mousemove', 'svg', svgMouseMove);
  $(document).on('mouseup', 'svg', svgMouseUp);
  $(document).on('dragstart', 'svg', svgStartDrag);
  $(document).on('dblclick', 'svg circle, svg rect', doubleClickCircle);
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
  $(document).on('click', '#btn-hugin-inward', onHuginInward);
  $(document).on('click', '#btn-hugin-outward', onHuginOutward);
  $(document).on('click', '#btn-hugin-reset', onHuginReset);
  $(document).on('click', '#btn-shenoy-propagate', onShenoyPropagation);
  $(document).on('click', '#btn-shenoy-reset', onShenoyReset);
  $(document).on('change', '#table-cpt input', onCPTInputChange);

  var originalGraph = new Graph('original graph');
  $('#original-svg').setGraph(originalGraph);
  var selectorHTML = $('#div-selector').html();
  var optionList = [];

  // LogicNode class
  function LogicNode(name) {
    this.name = name;
    this.var = null; // Variable object
    this.dist = null; // Distribution object
    this.parents = []; // parents object list
    this.children = []; // children object list

    this.clone = function(name) {
      var n = new LogicNode();
      n.name = name;
      n.var = this.var;
      n.dist = this.dist.clone();
    }
  }

  var c_node = null; // current LogicNode object
  var LogicNodes = {}; // key is string variable name, value is a LogicNode object.
  var nameDistMap = {}; // key is name string, value is Distribution object
  var DAGChanged = false;
  var moralChanged = false;
  var triangleChanged = false;
  var jtChanged = false;
  var propagationChanged = false;
  var h_joinTree, s_joinTree, joinTree;
  var q_graph; // this graph for query step

  function btn_start() {
    $('.b-page-3').css('visibility', 'visible');
  };

  function toTableHead(arr, isPotential, hide) {
    var th, str = '';
    var last_th;
    var c_name = arr[arr.length - 1]

    if (!isPotential) {
      last_th = '<th>p(' + c_name;
    } else {
      last_th = '<th>&Phi;(';
    }

    if (arr.length === 1) {
      str += '<th>' + c_name + '</th>'
      if (!isPotential) {
        last_th += ')</th>';
      } else {
        last_th += c_name + ')</th>';
      }
    } else {
      if (!isPotential) {
        last_th += '|';
      }
      var len = arr.length;
      arr.forEach(function(item, index) {
        if (index + 1 != len) {
          last_th += item + ',';
        }
        str += '<th>' + item + '</th>'

      });
      if (!isPotential) {
        last_th = last_th.slice(0, -1); // remove last comma ','
      } else {
        last_th += c_name;
      }
      last_th += ')</th>';
    }

    if (hide) {
      th = '<tr>' + str + '<th></th></tr>';

    } else {
      th = '<tr>' + str + last_th + '</tr>';

    }
    return th;
  }

  function toTableBody(dist, permute, isNew, disabled) {
    var str = '';
    var default_p = 0.5;
    permute.forEach(function(tr, index) {
      str += '<tr>';
      tr.forEach(function(td) {
        str += '<td>' + td + '</td>'
      });
      if (disabled) {
        if (isNew) {
          str += '<td>' + default_p + '</td></tr>';
        } else {
          str += '<td>' + dist.getMapValue(index) + '</tr>';
        }
      } else {
        if (isNew) {
          str += '<td><input type="text" value="' + default_p + '"></td></tr>';
        } else {
          str += '<td><input type="text" value="' + dist.getMapValue(index) + '"></td></tr>';
        }
      }
    });
    return str;
  }

  function getTableFromDist(dist, hide, disabled) {
    th = toTableHead(dist.varNames, dist.isPotential, hide);
    var keys = Object.keys(dist.map);
    var permute = [];
    keys.forEach(function(key) {
      permute.push(key.split(','));
    });
    td = toTableBody(dist, permute, false, disabled);

    var result = {};
    result.td = td;
    result.th = th;
    return result;
  }

  function createCPTtable(parameter) {
    var table = $('#table-cpt');
    var str = '';
    var c_name = c_node.name;
    var dist = LogicNodes[c_name].dist;
    var isNew = dist === null;
    var th, td;
    var disabled = true; // disabled table cannot be edited

    if (parameter.target && $(parameter.target).parent().id() === 'original-svg') {
      disabled = false;
    } else if (parameter.parent && parameter.parent().id() === 'original-svg') {
      disabled = false;
    } else if (parameter === false) {
      disabled = false;
    }

    if (isNew) {
      var p_c = []; // parents + current variable

      c_node.parents.forEach(function(p) {
        p_c.push(p.name);
      });

      p_c.push(c_name);

      th = toTableHead(p_c, false);

      var permute = Tool.permute(p_c.map(function(x) {
        return x.toLowerCase()
      }));

      td = toTableBody(null, permute, true, disabled);
    } else {
      dist.disabled = disabled;
      var thtd = getTableFromDist(dist, false, disabled);
      th = thtd.th;
      td = thtd.td;
    }

    table.html(th + td);
    $('#modal-cpt').modal({
      keyboard: false,
      backdrop: 'static'
    });
  }

  function addToQueryList(varObj) {
    var str = '<span id="circle-in-list-' + varObj.name + '" ';
    var varCircle = $(str + 'class="var-in-list" draggable="true">' + varObj.name + '</span>');
    $('#vars-list').append(varCircle);
    str = $('#vars-list').html();
    resetQuery();
    $('#vars-list').html(str);
  }

  function removeFromQueryList(varObj) {
    var list = $('#vars-list');
    list.append($('#query-box').children());
    list.append($('#evidence-box').children());
    if (varObj) {
      $('span[id="circle-in-list-' + varObj.name + '"]', list).remove();
    }
    var str = list.html();
    resetQuery();
    list.html(str);
  }

  // insert node in DAG
  // this function for sample feature
  function insertNode(name, map, parents, location) {
    var up = name.toUpperCase(),
      low = name.toLowerCase(),
      mLow = '-' + low;

    optionList.remove(up);
    resetOptions(optionList);

    var varObj = new LogicNode(up);
    LogicNodes[up] = varObj;
    addToQueryList(varObj);

    varObj.var = new Variable(up, [low, mLow]);

    var mapVar = [];
    parents.forEach(function(item) {
      varObj.parents.push(item);
      item.children.push(varObj);
      mapVar.push(item.var);
    });

    mapVar.push(varObj.var);

    varObj.dist = new Distribution(map, mapVar);
    varObj.dist.isPotential = false;
    setDistName(varObj);

    var vertex = new Vertex();
    vertex.name = varObj.name;
    vertex.cx = location.cx;
    vertex.cy = location.cy;
    originalGraph.addVertex(vertex);

    return varObj;
  }

  function setDistName(varObj) {
    var name = '|';
    varObj.parents.forEach(function(p) {
      name += p.name + ',';
    });
    name = name.slice(0, -1);
    varObj.dist.name = 'P(' + varObj.name + name + ')';
  }

  this.resetOpt = function() {
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
      list.forEach(function(item) {
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

  // disable menu button from given button name to following all buttons
  function disableMenu(name) {
    var found = false;
    $('.sideMenu button').each(function(i, item) {
      if (found === false && name === $(item).text().norm()) {
        found = true;
      }
      if (found) {
        $(item).disable();
      }
    });
  }

  function enableMenu(name) {
    var m;
    $('.sideMenu button').each(function(i, item) {
      m = $(item).text().norm();
      if (name === m) {
        $(item).enable();
      }
    });
  }

  function resetQuery() {
    $('.node-box').html('');
    $('#query-str').text('P()');
    $('#table-query').html('');
  }

  // display a sample DAG
  function onSample() {
    onDAGChanged();
    // initialize
    var svg = $('#original-svg');
    LogicNodes = [];
    $('#vars-list').html('');
    var map;
    originalGraph = new Graph();
    svg.setGraph(originalGraph);
    resetOptions();
    resetQuery();

    // -------------
    map = {};
    map[['a']] = 0.7;
    map[['-a']] = 0.3;
    var varA = insertNode('A', map, [], { cx: 215, cy: 70 });

    map = {};
    map[['a', 'b']] = 0.5;
    map[['a', '-b']] = 0.5;
    map[['-a', 'b']] = 0.7;
    map[['-a', '-b']] = 0.3;
    var varB = insertNode('B', map, [varA], { cx: 120, cy: 140 });

    map = {};
    map[['a', 'c']] = 0.2;
    map[['a', '-c']] = 0.8;
    map[['-a', 'c']] = 0.9;
    map[['-a', '-c']] = 0.1;
    var varC = insertNode('C', map, [varA], { cx: 310, cy: 140 });

    map = {};
    map[['b', 'd']] = 0.6;
    map[['b', '-d']] = 0.4;
    map[['-b', 'd']] = 0.6;
    map[['-b', '-d']] = 0.4;
    var varD = insertNode('D', map, [varB], { cx: 120, cy: 270 });

    map = {};
    map[['c', 'e']] = 0.1;
    map[['c', '-e']] = 0.9;
    map[['-c', 'e']] = 0.2;
    map[['-c', '-e']] = 0.8;
    var varE = insertNode('E', map, [varC], { cx: 310, cy: 270 });

    map = {};
    map[['d', 'e', 'f']] = 0.2;
    map[['d', 'e', '-f']] = 0.8;
    map[['d', '-e', 'f']] = 0.8;
    map[['d', '-e', '-f']] = 0.2;
    map[['-d', 'e', 'f']] = 0.5;
    map[['-d', 'e', '-f']] = 0.5;
    map[['-d', '-e', 'f']] = 0.5;
    map[['-d', '-e', '-f']] = 0.5;
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
      var varObj = LogicNodes[selected];
      if (varObj === undefined) {
        c_node = new LogicNode(selected);

        var otherVars = Object.keys(LogicNodes);
        LogicNodes[selected] = c_node;

        var modal_body = $('#parents .modal-body');
        modal_body.html('');
        otherVars.forEach(function(i) {
          if (i.length > 1) {
            return;
          }
          var input = $('<input id="toggle_p_' + i + '" type="checkbox">');
          var lable = $('<label for="toggle_p_' + i + '">' + i + '</label>');
          modal_body.append(input);
          modal_body.append(lable);
        });

        var lowercase = selected.toLowerCase();
        c_node.var = new Variable(selected, [lowercase, '-' + lowercase]);

        addToQueryList(c_node);

        // add vertex
        var vertex = new Vertex();
        vertex.name = c_node.name;
        originalGraph.addVertex(vertex);

        // remove option
        optionList.remove(selected);
        resetOptions(optionList);

        // DAG changed
        onDAGChanged();
      } else {
        // already has this variable, select another one.
        console.log('already has this variable, select another one.');
      }

      if (Object.keys(LogicNodes).length === 1) {
        // first node
        createCPTtable(false);
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

  function fromCliqueToLogicNode(c, used) {
    var varObj = new LogicNode();
    varObj.name = c.name;
    varObj.dist = Distribution.UNIT;
    var cliqueVarNames = [];
    var temp;
    var sub;
    varObj.vars = [];

    c.vertices.forEach(function(v) {
      cliqueVarNames.push(v.name);
    });

    c.vertices.forEach(function(v) {
      temp = LogicNodes[v.name];
      if (used.indexOf(temp) === -1) {
        sub = [];
        sub.push(temp.name);
        temp.parents.forEach(function(p) {
          sub.push(p.name);
        });
        if (Tool.isSubset(sub, cliqueVarNames)) {
          used.push(temp);
          varObj.dist = varObj.dist.multiply(temp.dist);
        }
      }
    });
    varObj.dist.isPotential = true;

    return varObj;
  }

  function assignCPTs(graph) {
    var cliques = graph.getCliques();
    var varObj;
    var used = [];
    cliques.forEach(function(c) {
      varObj = fromCliqueToLogicNode(c, used);
      LogicNodes[c.name] = varObj;
      c.setDistName(varObj.dist.name);
    });
  }

  function onConstructJT() {
    var svg = $('#jt-svg');
    if (svg.children('circle').length) {
      if (svg.data('jt-constructed') === 'true') {
        return;
      } else {
        var g = svg.getGraph();
        g.constructJT();
        svg.data('jt-constructed', 'true');
        assignCPTs(g);
        g.paint(svg, true);
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
    var c_obj = LogicNodes[c_node.name];

    var p = $('#parents input:checked');

    p.each(function(index, item) {
      var p = $(item).attr('id').slice(-1);
      var p_obj = LogicNodes[p];

      c_obj.parents.push(p_obj);
      p_obj.children.push(c_obj);
      originalGraph.addEdgeByName(p_obj.name, c_obj.name, { 'isDirected': true });
    });
    $('#parents').modal('hide');
    createCPTtable(false);
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
      vars.push(LogicNodes[item].var);
    });
    return vars;
  }

  function onCPTConfirm(e) {
    if (c_node.dist && c_node.dist.disabled) {
      return;
    }

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

    c_node.dist = new Distribution(map, vars);
    c_node.dist.isPotential = false;
    setDistName(c_node);
    originalGraph.paint($('#original-svg'));
  }

  function svgCircleMouseDown(e) {

    if (e.which === 1) {
      // 1 means left click

      var target = $(e.target);
      var name = target.attr('name');
      c_node = LogicNodes[name];

      if (target.tagName() === 'rect') {
        return;
      }

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
        disableMenu('step4');
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
    createCPTtable(e);
  }

  function deleteVertex(circle) {
    onDAGChanged();

    var name = circle.attr('name');
    var svg = circle.parent();
    var graph = svg.getGraph();
    var vars;

    graph.deleteVertex(name);
    graph.paint(svg);

    var varObj = LogicNodes[name];
    delete LogicNodes[name];

    varObj.parents.forEach(function(p) {
      p.children.remove(varObj);
    });

    varObj.children.forEach(function(c) {
      c.parents.remove(varObj);
      vars = [];
      c.parents.forEach(function(p) {
        vars.push(p.var);
      });
      vars.push(c.var);
      c.dist = c.dist.marginalOnto(vars).normalize();
    });

    optionList.push(name.toUpperCase());
    optionList.sort();
    resetOptions(optionList);

    removeFromQueryList(varObj);
  }

  function onDAGChanged() {
    DAGChanged = true;
    disableMenu('step2');
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
            createCPTtable($(this));
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

    updateQueryResultTable(query, evidence);

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

  function updateQueryResultTable(query, evidence) {
    var result = joinTree.query(query, evidence);
    if (result === null) {
      $('#table-query').html('');
    } else {
      result = getTableFromDist(result, true, true);
      $('#table-query').html(result.th + result.td);
    }
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
          str += '-' + varName;
          break;
        case 'query-box':
          str += '+' + varName;
          break;
        case 'evidence-box':
          str += '|' + varName;
          break;
      }

      str = cleanUpStr(str);
      queryUI.text('P(' + str + ')');
    }
  }

  function fromGraphToTree(graph) {
    var tree = new JoinTree();
    var cliques = graph.getCliques();
    var edges = graph.getCliqueEdges();
    var varObj, vars;

    cliques.forEach(function(c) {
      varObj = LogicNodes[c.name];
      vars = [];
      c.vertices.forEach(function(v) {
        vars.push(LogicNodes[v.name].var);
      });
      nameDistMap[c.name] = varObj.dist;
      tree.addNode(varObj.dist, vars, c.name);
    });

    edges.forEach(function(e) {
      tree.addEdge(LogicNodes[e.from.name].dist, LogicNodes[e.to.name].dist);
    });

    return tree;
  }

  function onHuginInward() {
    $('#btn-hugin-inward').prop('disabled', true);
    $('#btn-hugin-outward').prop('disabled', false);
    $('#btn-hugin-reset').prop('disabled', false);

    var svg = $('#p-hugin-svg');
    var graph = svg.getGraph();

    h_joinTree = fromGraphToTree(graph);
    var result = h_joinTree.huginInward();

    result.nodes.forEach(function(node) {
      node.distr.isPotential = true;
      LogicNodes[node.name].dist = node.distr;
    });

    graph.paint(svg, true, result);

    var temp;
    result.seperators.forEach(function(s) {
      temp = new LogicNode();
      temp.name = s.name;
      temp.dist = s.distr;
      temp.dist.isPotential = true;
      temp.cx = s.cx;
      temp.cy = s.cy;
      LogicNodes[temp.name] = temp;
    });
  }

  function onHuginOutward() {
    $('#btn-hugin-outward').prop('disabled', true);
    var svg = $('#p-hugin-svg');
    var graph = svg.getGraph();

    graph.removeSeperators();
    var result = h_joinTree.huginOutward();

    result.nodes.forEach(function(node) {
      node.distr.isPotential = true;
      LogicNodes[node.name].dist = node.distr;
    });

    graph.paint(svg, true, result);

    var temp;
    result.seperators.forEach(function(s) {
      temp = new LogicNode();
      temp.name = s.name;
      temp.dist = s.distr;
      temp.dist.isPotential = true;
      temp.cx = s.cx;
      temp.cy = s.cy;
      LogicNodes[temp.name] = temp;
    });
  }

  function onHuginReset() {
    $('#btn-hugin-inward').prop('disabled', false);
    $('#btn-hugin-outward').prop('disabled', true);
    $('#btn-hugin-reset').prop('disabled', true);

    var svg = $('#p-hugin-svg');
    var graph = svg.getGraph();

    graph.removeSeperators();
    graph.removeRoot();

    graph.paint(svg);

    graph.getCliques().forEach(function(c) {
      LogicNodes[c.name].dist = nameDistMap[c.name];
    });
  }

  function onShenoyPropagation() {
    $('#btn-shenoy-propagate').prop('disabled', true);
    $('#btn-shenoy-reset').prop('disabled', false);

    var svg = $('#p-shenoy-svg');
    var graph = svg.getGraph();

    s_joinTree = fromGraphToTree(graph);
    var result = s_joinTree.runShaferShenoy();

    result.nodes.forEach(function(node) {
      node.distr.isPotential = true;
      LogicNodes[node.name].dist = node.distr;
    });

    graph.paint(svg, true, result);

    var temp;
    result.seperators.forEach(function(s) {
      temp = new LogicNode();
      temp.name = s.name;
      temp.dist = s.distr;
      temp.dist.isPotential = true;
      temp.cx = s.cx;
      temp.cy = s.cy;
      LogicNodes[temp.name] = temp;
    });
  }

  function onShenoyReset() {
    $('#btn-shenoy-propagate').prop('disabled', false);
    $('#btn-shenoy-reset').prop('disabled', true);

    var svg = $('#p-shenoy-svg');
    var graph = svg.getGraph();

    graph.removeSeperators();

    graph.paint(svg);

    graph.getCliques().forEach(function(c) {
      LogicNodes[c.name].dist = nameDistMap[c.name];
    });
  }

  function addLogicNode(graph) {
    var name;
    graph.getCliques().forEach(function(c) {
      name = c.name.split(':');
      if (name.length === 1) {
        name = name[0];
      } else {
        name = name[1];
      }
      LogicNodes[c.name] = LogicNodes[name].clone(c.name);
    });
  }

  function onDAGnext(e) {
    if (!originalGraph.connected()) {
      e.stopImmediatePropagation();
      $('#connect-hint').modal();
    }
  }

  function onCPTInputChange(e) {
    onDAGChanged();
    removeFromQueryList(null);
  }

  this.onBookReady = function() {
    $('#draw-dag .nextPage').click(onDAGnext);
  }

  this.onMoralization = function() {
    if (DAGChanged) {
      enableMenu('step2');
      DAGChanged = false;
      moralChanged = true;
      var svg = $('#moral-svg');
      var graph = originalGraph.clone();
      svg.data('moralized', 'false');
      svg.setGraph(graph);
      graph.paint(svg);
    }
    $('svg line.line-animation').removeClass('line-animation');
  }

  this.onTriangulation = function() {
    if (moralChanged) {
      enableMenu('step3');
      moralChanged = false;
      triangleChanged = true;

      onMoralize();
      var svg = $('#triangle-svg');
      var graph = $('#moral-svg').getGraph().clone();
      graph.normalize();
      svg.data('triangulated', 'false');
      svg.setGraph(graph);
      graph.paint(svg);
    }
    $('svg line.line-animation').removeClass('line-animation');
  }

  this.onJT = function() {
    if (triangleChanged) {
      triangleChanged = false;
      jtChanged = true;

      onTriangulate();
      var svg = $('#jt-svg');
      var graph = $('#triangle-svg').getGraph().clone();
      graph.normalize();
      svg.data('jt-constructed', 'false');
      svg.setGraph(graph);
      graph.paint(svg);
      enableMenu('step4');
    }
    $('svg line.line-animation').removeClass('line-animation');
  }

  this.onPropagation = function() {
    if (jtChanged) {
      $('#btn-hugin-inward').prop('disabled', false);
      $('#btn-hugin-outward').prop('disabled', true);
      $('#btn-hugin-reset').prop('disabled', true);
      $('#btn-shenoy-propagate').prop('disabled', false);
      $('#btn-shenoy-reset').prop('disabled', true);

      onConstructJT();

      jtChanged = false;
      propagationChanged = true;

      var h_svg = $('#p-hugin-svg');
      var s_svg = $('#p-shenoy-svg');
      var jtGraph = $('#jt-svg').getGraph();
      var h_graph = jtGraph.clone();
      var s_graph = jtGraph.clone();
      q_graph = jtGraph.clone();
      q_graph.constructJT(false, true);

      var prefix = 'hp';
      h_graph.constructJT(false, true, prefix);
      addLogicNode(h_graph);

      prefix = 'sp';
      s_graph.constructJT(false, true, prefix);
      addLogicNode(s_graph);

      assignCPTs(h_graph);
      assignCPTs(s_graph);

      h_svg.data('h-propagation-inward-done', 'false');
      h_svg.data('h-propagation-outward-done', 'false');

      s_svg.data('s-propagation-done', 'false');

      h_svg.setGraph(h_graph);
      s_svg.setGraph(s_graph);

      h_graph.paint(h_svg);
      s_graph.paint(s_svg);
      enableMenu('query');
    }
  }

  this.onQuery = function() {
    if (propagationChanged) {
      propagationChanged = false;
      joinTree = fromGraphToTree(q_graph);
      joinTree.runShaferShenoy();
    }
  }
}