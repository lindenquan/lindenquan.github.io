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
    },

    disable: function(){
        return this.prop('disabled', true);
    },

    enable: function(){
        return this.prop('disabled', false);
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

String.prototype.norm = function() {
    return this.replace(/\s/g, '').toLowerCase();
};



function detectIE() {
    var ua = window.navigator.userAgent;
    if (ua.indexOf('MSIE ') > 0) {
        return true;
    }

    if (ua.indexOf('Trident/') > 0) {
        return true;
    }

    if (ua.indexOf('Edge/') > 0) {
        return true;
    }
    return false;
}