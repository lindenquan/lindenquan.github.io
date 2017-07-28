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
    },

    tagName: function() {
        return this.prop('tagName');
    },

    id: function() {
        return this.attr('id');
    }
});

Array.prototype.remove = function(elem, all) {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] === elem) {
            this.splice(i, 1);
            if (!all)
                break;
        }
    }
    return this;
};