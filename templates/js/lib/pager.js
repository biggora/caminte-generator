/**
 * Simple pager - couldn't find one for Express that worked for me.
 */
var qs = require('querystring');

exports.version = '0.0.1';

exports.render = function (skip, limit, total, path, data) {

    var querystring = qs.stringify(data);
    var totalPages = Math.ceil(total / limit) + 1;
    var currentPage = skip / limit + 1;
    var result = '', start, finish;
    var selectedClass = 'page-selected';
    var visiblePages = 5;

    // Remember how many we have
    var totalPageLinks = 0;
    querystring = querystring.length ? '?' + querystring : '';
    result += pageSpan(currentPage, true);

    var additionalForward = currentPage < visiblePages ? visiblePages - currentPage : 0;
    for (i = currentPage + 1; (i < currentPage + visiblePages + additionalForward) && (i < totalPages); i++) {
        start = (i - 1) * limit + 1;
        result += pageLink(path, start, limit, i, querystring);
    }

    if (currentPage < totalPages - 1) {
        result += pageLink(path, skip + limit + 1, limit, ">", querystring);
        var lastPageStart = (totalPages - 2) * limit + 1;
        result += pageLink(path, lastPageStart, limit, ">>", querystring);
    }

    var additionalBackward = (totalPages - currentPage) < visiblePages ? visiblePages - (totalPages - currentPage) : 0;
    for (i = currentPage - 1; (i > currentPage - visiblePages - additionalBackward) && (i > 0); i--) {
        start = (i - 1) * limit + 1;
        result = pageLink(path, start, limit, i, querystring) + result;
    }

    if (currentPage > 1) {
        result = pageLink(path, (skip - limit + 1), limit, "<", querystring) + result;
        result = pageLink(path, 1, limit, "<<", querystring) + result;
    }

    // result += "<li style='margin-left:10px;'>&nbsp;Go To: <input id='pagerGoto' type='text' name='skip' value='' class='input-mini pager-page' title='Go to a specific start point, type and enter ...' /></li>";
    result += "</ul>";
    result += "<span class='pull-right' style='font-size:14px;margin-top:22px'>" + (skip + 1) + " to " + (skip + limit) + " of " + (total) + "</span>";

    return "<div><ul class='pagination pagination-sm'>" + result + "</div>";

};

function pageLink(path, skip, limit, page, querystring) {
    return "<li><a href='" + path + "/" + skip + "-" + limit + querystring + "'>" + page + "</a></li>";
}

function pageSpan(page, cur) {
    var cssclass = (cur) ? "active" : "disabled";
    return '<li class="' + cssclass + '"><a href="#">' + page + "</a></li>";
}