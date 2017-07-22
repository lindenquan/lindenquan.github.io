var ms = {};
ms.vars = {};

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
        var _var = _selector.val() ;
        if(typeof _var === 'string'){
            var _varObj = ms.vars[_var];
            if(_varObj===undefined || _varObj===null){
                var _upper = _var.toUpperCase();
                ms.vars[_var] = new Variable(_var,[_upper,'-'+_upper]);
            }else{
                // already has this variable, select another one.
                console.log('already has this variable, select another one.');
            }
        }else {
            // no variable is selected
        }
    });
});