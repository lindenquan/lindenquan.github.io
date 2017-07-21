var ms = {};

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
;$(function() {
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

    $('#btn-start').click(function(){
    	$('.b-page-3').css('visibility','visible');
    });

});