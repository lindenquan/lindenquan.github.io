/*
Integrate or build upon it for free in your personal or commercial projects. Don't republish, redistribute or sell "as-is". 

Read more here: [License](http://tympanus.net/codrops/licensing/)

[© Codrops 2014](http://www.codrops.com)
*/

$(function() {
    [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function(el) {
        new SelectFx(el, {
            stickyPlaceholder: false,
            onChange: function(val) {
                document.querySelector('span.cs-placeholder').style.backgroundColor = val;
            }
        });
    });
});