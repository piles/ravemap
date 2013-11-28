var mouse = require('./mouse');
var touches = require('./touches');
var cursor = require('./cursor');

var url = require('./url');
var loop = require('./anim_loop');

var tiles = require('./tiles');
var map = require('./map');
var pin = require('./pin');
var anim_map = require('./anim_map');
var zoom = require('./zoom');
var timeline = require('./timeline');
var text_metrics = require('./text_metrics');
var title = require('./title');
var background = require('./background');
var player = require('./player');
var audio = require('./audio')

var geocode = require('./geocode');

var font_load = require('./font_load');
var add = require('./add');
var share = require('./share');
var about = require('./about');

var soundcloud = require('./player_soundcloud');

var we_raved_here = {};

we_raved_here.init = function(){
  url.init();
  mouse.init();
  cursor.init();
  touches.init();
  tiles.init();
  map.init();
  pin.init();
  anim_map.init();
  zoom.init();
  timeline.init();
  player.init();
  background.init();
  //chris's effect:
  loop.fns_render.push(window.loop_chris)
  loop.init();
  
  // have to wait for font to be ready before drawing into canvas with it
  var text_init = function(){
    title.init();
    add.init();
    share.init();
    about.init();
  }

  font_load({
    load_fn: function(){ text_init() },
    fail_fn: function(){ text_init() },
    font: 'MaisonNeue'
  })

};

// export to window
// todo: comment out when site is done
window.we_raved_here = we_raved_here;
window.map = map;
window.cursor = cursor;
window.tiles = tiles;
window.zoom = zoom;
window.timeline = timeline;
// window.mouse = mouse;
window.text_metrics = text_metrics;
window.touches = touches;
window.anim_map = anim_map;
window.loop = loop;
window.url = url;
window.geocode = geocode;
window.player_soundcloud = soundcloud;
// window.text_title = title;
window.audio = audio;

