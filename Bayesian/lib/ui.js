$.fn.load_update_url = function(path) {
    var host = $(this);
    $.get(path, function(data, status) {
        var rex_href = /(href\ *=\ *")(.*)"/g;
        data = data.replace(rex_href, function(match, p1, p2) {
            return p1 + p2.slice(3) + '"';
        });
        host.html(data)
    });
}