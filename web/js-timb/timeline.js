var m = require('./mouse');
var data = require('./data');
var cursor = require('./cursor');
var geom = require('./geom');
var domq = require('./dom').q;
var loop = require('./anim_loop');
var map = require('./map');

var draw = require('./draw');

var model = require('./timeline_model');

//var year_min = 1988
//  , year_max = 1998
//  , months_total = (year_max - year_min) * 12
//  , months_range = d3.range(months_total) // 0 - months_total-1
//    // map mouse co-ords to months scale. 
//    // input domain for d3 scale is set in resize fn.
//  , months_scale = d3.scale.quantize().range(months_range) 

var dom = {};

var timeline = {};

// buttons
var button_prev_action = function(x, y, e, state){
  var step = model.step - 1;
  if (step < 0) step = model.months_total-1;
  model.step = step;
  model.dirty = true;
};

var button_next_action = function(x, y, e, state){
  var step = model.step + 1;
  if (step > model.months_total-1) step = 0;
  model.step = step;
  model.dirty = true;
};

var button_prev_held_down = function(x, y, e, state){
  var time = Date.now();
  if (time - state.down_timestamp < 1000) return
  state.held_down = true;
  state.down_timestamp = time;
  button_prev_action(x, y, e, state);
};

var button_next_held_down = function(x, y, e, state){
  var time = Date.now();
  if (time - state.down_timestamp < 1000) return
  state.held_down = true;
  state.down_timestamp = time;
  button_next_action(x, y, e, state);
};

var button_prev_click = function(x, y, e, state){
  if (state.held_down) return;
  button_prev_action(x, y, e, state);
};

var button_next_click = function(x, y, e, state){
  if (state.held_down) return;
  button_next_action(x, y, e, state);
};

var button_prev_hit_test_fn = function(x, y){
  return geom.bounds_hit_test(timeline['bounds_button_prev'], x, y)
};

var button_next_hit_test_fn = function(x, y){
  return geom.bounds_hit_test(timeline['bounds_button_next'], x, y)
};

var touches_button_prev = {
  bounds_check_down: button_prev_hit_test_fn,
  bounds_check_up: button_prev_hit_test_fn,
  up: button_prev_click,
  anim_while_down: button_prev_held_down
};

var touches_button_next = {
  bounds_check_down: button_next_hit_test_fn,
  bounds_check_up: button_next_hit_test_fn,
  up: button_next_click,
  anim_while_down: button_next_held_down
};

// scale
var scale_hit_test_fn = function(x, y){
  return geom.bounds_hit_test(timeline['bounds_scale'], x, y)
};

var scale_mousemove = function(x,y,e, state){
  if (scale_hit_test_fn(x,y)){
    if (!model.mouseover){
      model.mouseover = true
    }
    model.dirty = true;
  } else {
    if (model.mouseover){
      model.mouseover = false
      model.dirty = true;
    }        
  }
};

var scale_move_while_down = function(x, y, e, state){
  scale_set_value(x);
};

var scale_set_value = function(x){
    model.step = model.months_scale(x);
    model.dirty = true;
};

var touches_scale = {
  bounds_check_down: scale_hit_test_fn,
  move_while_down: scale_move_while_down,
  up: scale_set_value,
  mousemove: scale_mousemove
};

timeline.init = function(){

  timeline.dom = dom;
  dom.canvas = domq('#ui-timeline canvas');
  dom.ctx = dom.canvas.getContext('2d');
  dom.el = domq('#ui-timeline');
  dom.el_date = domq('#ui-timeline .date');

  touches.down_and_up(touches_button_prev);
  touches.down_and_up(touches_button_next);
  touches.down_and_up(touches_scale);

  window.addEventListener('resize', function(){
    model.resize = true;
    model.dirty = true; 
  }); 

  loop.add(timeline.render);
};



timeline.render = function(){

  if (!model.dirty) return;
  model.dirty = false

  var w_units = (window.innerWidth) * (1/5);

  var scale_w = (w_units * 3) |0, 
      h = 35,
      button_w = h,
      w = scale_w + button_w*2,
      wpx = w +'px',                hpx = h +'px',
      l = (w_units - button_w) |0,  lpx = l +'px', // centered horizontally
      t = 10,                       tpx = t +'px'

  if (model.resize){
    model.resize = false;

    timeline.bounds = {
      x1: l, x2: l + w,
      y1: t, y2: t + h
    };

    //timeline.bounds_slider = {
    //  x1: l + button_w, x2: l + w - button_w,
    //  y1: t, y2: t + h
    //};

    cursor.bounds.timeline_button_prev = timeline.bounds_button_prev = {
      x1: l, x2: l + button_w,
      y1: t, y2: t + h,
      mouseover: 'pointer'
    };

    cursor.bounds.timeline_button_next = timeline.bounds_button_next = {
      x1: l + scale_w + button_w, x2: l + scale_w + button_w*2,
      y1: t, y2: t + h,
      mouseover: 'pointer'
    };

    cursor.bounds.timeline_scale = timeline.bounds_scale = {
      x1: l + button_w, x2: l + button_w + scale_w,
      y1: t, y2: t + h,
      mouseover: 'pointer',
      mousedown: 'move'
    };

    dom.canvas.width = w;
    dom.canvas.height = h;

    var style = dom.el.style;
    style.width = wpx;
    style.height = hpx;
    style.top = tpx;
    style.left = lpx;

    var date_height = t + h + 0
    dom.el_date.style.top = date_height +'px';
    timeline.date_left = l

  }


  var uw = scale_w / (model.months_range.length - 1);
  var uw_2 = uw / 2;

  model.months_scale.domain([l + button_w - uw_2, l + scale_w + button_w + uw_2]);

  var pad = (0.3 * h) |0;

  dom.ctx.clearRect(0,0, dom.canvas.width,dom.canvas.height);

  // slider track
  draw.line_h(dom.ctx, button_w, 0, scale_w, h, 0);

  // buttons
  draw.line_h(dom.ctx, 0,0, button_w,button_w, pad);
  draw.plus(dom.ctx, button_w + scale_w, 0, button_w,button_w, pad);

  var render_line = true;

  if (model.mouseover){

    // console.log(timeline.months_scale(mouse.x));
    var step = model.months_scale(m.x /*+ uw_2*/);

    //if (m.down) timeline.slider.model.val = step;
    // else render_line = false;

    var scale_step_near_mouse = model.months_scale(m.x);

  } else {
    var step = model.step;
  }

    var date_month = (step % 12) + 1;
    var date_year = (model.year_min + (step / 12)) |0;
    dom.el_date.innerHTML = date_month + '/' + date_year;
    
    draw.line_v(dom.ctx, (uw * model.step - uw_2 + button_w)|0, 0, uw, dom.canvas.height)



    /*
    if (typeof scale_step_near_mouse !== 'undefined' && scale_step_near_mouse !== model.step){

      var x_actual = (uw * model.step + button_w)|0
        , x_mouse = (uw * scale_step_near_mouse + button_w)|0

      dom.ctx.beginPath();
      dom.ctx.fillStyle = 'rgba(0,0,0,0.2)'
      dom.ctx.moveTo(x_mouse,0);
      dom.ctx.lineTo(x_mouse,dom.canvas.height)
      dom.ctx.lineTo(x_actual,dom.canvas.height/2)
      dom.ctx.closePath();
      dom.ctx.fill();    
    }
    */

    var date_left = /*timeline.date_left + */ (uw * step - uw_2) + button_w - 100/2;
    dom.el_date.style.left = date_left +'px';


    // update markers
    for (var iy=0, item_year; item_year=data[iy]; iy++){
      var year = item_year.year;
      var events = item_year.data.events;
      if (!(year in events)) continue;
      var marker_matches_year = date_year === parseInt(year);
      var opacity = marker_matches_year ? 1.0 : 0.7;
      var icon = marker_matches_year ? map.icon_pink : map.icon_blue;

      for (var i=0, item; item=events[year][i]; i++){
        item.marker.setIcon(icon)
        // item.marker.setOpacity(opacity);
        // if (marker_matches_year) item.marker.openPopup();
        // else item.marker.closePopup();
      }
    }
};

timeline.proto = {};

module.exports = timeline;

