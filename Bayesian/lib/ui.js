var ms = {};
ms.vars = {}; // key is string variable name, value is a Variable object.
ms.varParents = {}; // key is string variable name, value is string array including parents names
ms.c_var = ''; // current variable

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
});;

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

    [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function(el) {
        new SelectFx(el, {
            stickyPlaceholder: false,
            onChange: function(val) {
                document.querySelector('span.cs-placeholder').style.backgroundColor = val;
            }
        });
    });

    $('#btn-spawn').click(function() {
        var _selector = $('#v-selector');
        var _var = _selector.val();
        if (typeof _var === 'string') {
            var _varObj = ms.vars[_var];
            if (_varObj === undefined || _varObj === null) {
                ms.c_var = _var;
                var _otherVars = Object.keys(ms.vars);
                var _modal_body = $('#parents .modal-body');
                _modal_body.html('');
                _otherVars.forEach(function(i) {
                    var _input = $('<input id="toggle_p_' + i + '" type="checkbox">');
                    var _lable = $('<label for="toggle_p_' + i + '">' + i + '</label>');
                    _modal_body.append(_input);
                    _modal_body.append(_lable);
                });
                var _upper = _var.toUpperCase();
                ms.vars[_var] = new Variable(_var, [_upper, '-' + _upper]);
            } else {
                // already has this variable, select another one.
                console.log('already has this variable, select another one.');
            }
        } else {
            // no variable is selected
        }
    });

    $(document).on('click', '#parents input', function() {
        var _p = $(this).attr('id').slice(-1);
        var _parents = ms.varParents[ms.c_var];
        if (_parents === undefined) {
            _parents = [];
        }

        if (!$(this).is(':checked')) {
            // remove parent
            var _index = _parents.indexOf(_p);
            _parents.splice(_index, 1);
        } else {
            // add parent
            _parents.push(_p);
            ms.varParents[ms.c_var] = _parents;
        }
    });

    $('#parents .confirm').click(function() {
        console.log(ms.varParents[ms.c_var]);
    })
});