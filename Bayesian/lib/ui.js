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


$(function() {
    ms.book = $('.book:first');

    ms.book.booklet({
        width: 900, // container width
        height: 550, // container height

        pagePadding: 10, // padding for each page wrapper
        pageNumbers: true, // display page numbers on each page

        next: $('#btn-start:first'),

        before: function() {}, // callback invoked before each page turn animation
        after: function() {} // callback invoked after each page turn animation

    });

    $('.book .prevPage').click(function() {
        ms.book.booklet('prev');
    });

    $('.book .nextPage').click(function() {
        ms.book.booklet('next');
    });

});