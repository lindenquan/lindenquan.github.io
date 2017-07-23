var ms = {}; // main scope object
_init();

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

$(function() {

    ms.book = $('.book:first');

    ms.book.booklet({
        width: 900, // container width
        height: 550, // container height

        next: $('#btn-start'),
        finish: function() { $('.loading').css('display', 'none'); }
    });

    $('.book .prevPage').click(function() {
        ms.book.booklet('prev');
    });

    $('.book .nextPage').click(function() {
        ms.book.booklet('next');
    });

    $('#btn-start').click(function() {
        $('.b-page-3').css('visibility', 'visible');
    });

    $('#btn-spawn').click(ms.onSpawn);

    $(document).on('click', '#parents input', ms.onParentSelect);

    $('#parents .confirm').click(ms.onParentConfirm);

});

function _init() {

    ms.vars = {}; // key is string variable name, value is a Variable object.
    ms.varParents = {}; // key is string variable name, value is string array including parents names
    ms.c_var = ''; // current variable

    ms.creatCPTtable = function() {
        var table = $('#table-cpt');
        var str = '';
        var parents = ms.varParents[ms.c_var];
        parents.push(ms.c_var);
        parents.forEach(function(item) {
            str += '<th>' + item + '</th>'
        });

        var th = '<tr>' + str + '</tr>';
        var permute = Tool.permute(parents.map(function(x) { return x.toUpperCase() }));

        str = '';
        permute.forEach(function(tr) {
            str += '<tr>';
            tr.forEach(function(td) {
                str += '<td>' + td + '</td>'
            });
            str += '</tr>';
        });
        table.html(th + str);
    };

    ms.onSpawn = function() {
        var selector = $('#v-selector');
        var c_var = selector.val();
        if (typeof c_var === 'string') {
            var varObj = ms.vars[c_var];
            if (varObj === undefined || varObj === null) {
                ms.c_var = c_var;
                var otherVars = Object.keys(ms.vars);
                var modal_body = $('#parents .modal-body');
                modal_body.html('');
                otherVars.forEach(function(i) {
                    var input = $('<input id="toggle_p_' + i + '" type="checkbox">');
                    var lable = $('<label for="toggle_p_' + i + '">' + i + '</label>');
                    modal_body.append(input);
                    modal_body.append(lable);
                });
                var upper = c_var.toUpperCase();
                ms.vars[c_var] = new Variable(c_var, [upper, '-' + upper]);

            } else {
                // already has this variable, select another one.
                console.log('already has this variable, select another one.');
            }

            ms.varParents[c_var] = [];

            if (Object.keys(ms.vars).length === 1) {
                // first node
                ms.creatCPTtable();
                $('#modal-cpt').modal();
            } else {
                $('#parents').modal();
            }
        } else {
            // no variable is selected
        }
    };

    ms.onParentSelect = function() {
        var p = $(this).attr('id').slice(-1);
        var parents = ms.varParents[ms.c_var];

        if (!$(this).is(':checked')) {
            // remove parent
            var index = parents.indexOf(p);
            parents.splice(index, 1);
        } else {
            // add parent
            parents.push(p);
        }
    };

    ms.onParentConfirm = function() {
        ms.creatCPTtable();
        $('#modal-cpt').modal();
        console.log(ms.varParents[ms.c_var]);
    };
}