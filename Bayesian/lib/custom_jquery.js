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