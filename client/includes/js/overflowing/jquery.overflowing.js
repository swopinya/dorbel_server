jQuery.fn.isChildOverflowing = function (child) {
    var p = jQuery(this).get(0);
    var el = jQuery(child).get(0);
    return (el.offsetTop < p.offsetTop || el.offsetLeft < p.offsetLeft) ||
        (el.offsetTop + el.offsetHeight > p.offsetTop + p.offsetHeight || el.offsetLeft + el.offsetWidth > p.offsetLeft + p.offsetWidth);
};