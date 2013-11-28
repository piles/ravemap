// measure 

var metrics = {};

// get size of some text via dom
metrics.text_wh_dom = function(text, css_props, el){
  css_props = css_props || {};

  el = el || document.createElement('span');
  
  var s = el.style;

  for (var key in css_props)
    s[key] = css_props[key];

  s.visibility = 'hidden';
  s.position = 'absolute';
  s.zIndex = '0';
  s.pointerEvents = 'none';

  el.innerHTML = text.replace(/ /g, '&nbsp;');
  document.body.appendChild(el);

  var textrect = el.getBoundingClientRect();

  document.body.removeChild(el);

  return {w: textrect.width, h: textrect.height};
};

// get size of some text via 2d context TextMetrics api
metrics.text_w_ctx = function(text, font, ctx){

  if (!ctx) ctx = document.createElement('canvas').getContext('2d');

  if (font) ctx.font = font;

  return ctx.measureText(text).width;
};

// x positions of characters
metrics.char_xs = function(text, css_props, letter_spacing){
  css_props = css_props || {};
  var font = ('font' in css_props) ? css_props.font : undefined;
  letter_spacing = letter_spacing || (('letterSpacing' in css_props) ? css_props.letterSpacing : 0 );

  var total_spacing = 0;
  // var xs_dom = [];
  var xs_ctx = [];

  for (var i=0, l=text.length+1; i<l; i++){
    // xs_dom.push(metrics.text_wh_dom(text.substr(0,i), css_props).w + total_spacing)
    xs_ctx.push(metrics.text_w_ctx(text.substr(0,i), font) + total_spacing)
    total_spacing += letter_spacing;
  }

  // console.log(xs_dom)
  // console.log(xs_ctx)

  return xs_ctx;

};


module.exports = metrics;

/*
// until TextMetrics api in canvas is widely supported,
// measure text size by creating an invisible dom element
var text_metrics = function(text, css_props){ css_props = css_props || {};

  var span = document.createElement('span');
  
  for (var key in css_props)
    span.style[key] = css_props[key];

  span.style.visibility = 'none';
  span.style.position = 'absolute';
  span.style.zIndex = '0';
  span.style.pointerEvents = 'none';

  span.innerHTML = text;
  document.body.appendChild(span);

  var textrect = span.getBoundingClientRect();

  document.body.removeChild(span);

  return {w: Math.ceil(textrect.width), h: Math.ceil(textrect.height)};
};
*/

module.exports = metrics;