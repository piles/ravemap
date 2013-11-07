var m = require('./mouse');
var cursor = require('./cursor');
var touches = require('./touches');

var geom = require('./geom');
var domq = require('./dom').q;

var map = require('./map');
var loop = require('./anim_loop');
var draw = require('./draw');

var model = require('./zoom_model');

var zoom = {};

var dom = {};

var button_zoomin_action = function(x, y, e, state){
  var step = model.step + 1;
  if (step > model.max) step = model.max;
  model.step = step;
  model.dirty = true;
  map.leaflet.zoomIn();
};

var button_zoomout_action = function(x, y, e, state){
  var step = model.step - 1;
  if (step < model.min) step = model.min;
  model.step = step;
  model.dirty = true;
  map.leaflet.zoomOut();
};

var button_zoomin_hit_test_fn = function(x, y){
  return geom.bounds_hit_test(zoom['bounds_button_zoomin'], x, y)
};

var button_zoomout_hit_test_fn = function(x, y){
  return geom.bounds_hit_test(zoom['bounds_button_zoomout'], x, y)
};

var touches_button_zoomin = {
  bounds_check_down: button_zoomin_hit_test_fn,
  bounds_check_up: button_zoomin_hit_test_fn,
  up: button_zoomin_action
};

var touches_button_zoomout = {
  bounds_check_down: button_zoomout_hit_test_fn,
  bounds_check_up: button_zoomout_hit_test_fn,
  up: button_zoomout_action
};

// scale
var scale_hit_test_fn = function(x, y){
  return geom.bounds_hit_test(zoom['bounds_scale'], x, y)
};

var scale_move_while_down = function(x, y, e, state){
  scale_set_value(x, y);
};

var scale_set_value = function(x, y){
    model.step = model.scale(y);
    map.leaflet.setZoom(model.step)
    model.dirty = true;
};

var touches_scale = {
  bounds_check_down: scale_hit_test_fn,
  move_while_down: scale_move_while_down,
  up: scale_set_value
};


zoom.init = function(){

  zoom.dom = dom;
  dom.canvas = domq('#ui-zoom canvas');
  dom.ctx = dom.canvas.getContext('2d');
  dom.el = domq('#ui-zoom');

  model.init();

  touches.down_and_up(touches_button_zoomin);
  touches.down_and_up(touches_button_zoomout);
  touches.down_and_up(touches_scale);

  window.addEventListener('resize', function(){
    model.resize = true;
    model.dirty = true; 
  }); 

  loop.add(zoom.render);

};

zoom.render = function(){

  if (!model.dirty) return;
  model.dirty = false

  var w = 25, h = 200
    , wpx = w + 'px', hpx = h + 'px'
    , l = 10, t = ((window.innerHeight / 2 - h / 2)|0)
    , lpx = l + 'px', tpx = t + 'px'
    , button_w = w
    , scale_h = h - button_w*2
    , pad = (w * 0.3)|0
    , mid = (w/2)|0

  if (model.resize){
    model.resize = false;

    zoom.knob_slider_bounds = {l: l, t: t, r: l + w, b: t + h};

    cursor.bounds.zoom_scale = zoom.bounds_scale = {
      x1: l,     y1: t + button_w,
      x2: l + w, y2: t + button_w + scale_h,
      mouseover: 'pointer',
      mousedown: 'move'
    }

    cursor.bounds.zoom_zoomin = zoom.bounds_button_zoomin = {
      x1: l,     y1: t,
      x2: l + w, y2: t + button_w,
      mouseover: 'pointer'
    }

    cursor.bounds.zoom_zoomout = zoom.bounds_button_zoomout = {
      x1: l,     y1: t + button_w + scale_h,
      x2: l + w, y2: t + button_w*2 + scale_h,
      mouseover: 'pointer'
    }

    dom.canvas.width = w;
    dom.canvas.height = h;
    
    var style = dom.el.style;

    // hide on small screen
    if (window.innerHeight < dom.canvas.height + 100){
      style.display = 'none'
      return;
    } else {
      style.display = 'block'
    }

    style.width = wpx;
    style.height = hpx;
    style.left = lpx;
    style.top = tpx;

  }

  dom.ctx.clearRect(0,0, w,h);

  var uh = scale_h / (model.range.length - 1);
  var uh_2 = uh / 2;

  var normalized_step = (model.max - model.min) - (model.step - model.min);

  model.scale.domain([t + button_w - uh_2, t + scale_h + button_w + uh_2]);

  // handle
  draw.line_h(dom.ctx, 0, (uh * normalized_step - uh_2 + button_w)|0, dom.canvas.width, uh)

  // track
  draw.line_v(dom.ctx, 0,w, w,h-w*2, 0);

  // plus
  draw.plus(dom.ctx, 0,0, w,w, pad);

  // minus
  draw.line_h(dom.ctx, 0,h-w, w,w, pad);

};

module.exports = zoom;