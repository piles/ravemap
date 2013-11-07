var css = {};

// browser vendor css prefix junk
css.has_a_transform = function(layer){
  var ls = layer.style
  if (ls.transform || ls.WebkitTransform || ls.MozTransform) return true;
  else return false;
};

css.get_transform = function(layer){
  var ls = layer.style;
  if (ls.transform) return ls.transform;
  if (ls.WebkitTransform) return ls.WebkitTransform;
  if (ls.MozTransform) return ls.MozTransform;
};

css.get_transform_translate_coords_regex = /translate3?d?\(([0-9\-]*)p?x?, ([0-9\-]*)p?x?/;
css.get_transform_translate_coords = function(layer){
  var transform = css.get_transform(layer);
  var matches = transform.match(css.get_transform_translate_coords_regex)
  if (matches.length !== 3) return [0,0];
  return [parseInt(matches[1]), parseInt(matches[2])]
};

css.set = function(el, css_props){
  var s = el.style
  for (var key in css_props)
    s[key] = css_props[key];
}

css.has_class = function (el, class_name) {
    return new RegExp(' ' + class_name + ' ').test(' ' + el.className + ' ');
};


css.add_class = function (el, class_name) {
    if (!(css.has_class(el, class_name))) {
        el.className += ' ' + class_name;
    }
};

css.rm_class = function (class_name) {
    var class_name_normalized = ' ' + el.className.replace(/[\t\r\n]/g, ' ') + ' '
    if (css.has_class(el, class_name)) {
        while (class_name_normalized.indexOf( ' ' + class_name + ' ') >= 0) {
            class_name_normalized = class_name_normalized.replace(' ' + class_name + ' ', ' ');
        }
        el.className = class_name_normalized.replace(/^\s+|\s+$/g, ' ');
    }
};

module.exports = css;