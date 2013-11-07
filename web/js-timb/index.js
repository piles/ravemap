var mouse = require('./mouse');
var touches = require('./touches');
var cursor = require('./cursor');
var tiles = require('./tiles');
var map = require('./map');
var anim_map = require('./anim_map');
var loop = require('./anim_loop');
var zoom = require('./zoom');
var timeline = require('./timeline');
var text_metrics = require('./text_metrics');
var title = require('./title');
var background = require('./background');
var url = require('./url');

var geocode = require('./geocode');

var font_load = require('./font_load');

var add = require('./add');
var share = require('./share');
var about = require('./about');

var we_raved_here = {};

we_raved_here.init = function(){
  url.init();
  mouse.init();
  cursor.init();
  touches.init();
  map.init();
  anim_map.init();
  zoom.init();
  timeline.init();

  background.init();
  //chris's effect:
  loop.add(window.loop_chris)
  loop.start();

  loop.stats.domElement.style.position = 'absolute';
  loop.stats.domElement.style.left = '0px';
  loop.stats.domElement.style.top = '0px';
  document.body.appendChild( loop.stats.domElement );
  
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
window.we_raved_here = we_raved_here;
window.map = map;
window.cursor = cursor;
window.tiles = tiles;
window.zoom = zoom;
window.timeline = timeline;
window.mouse = mouse;
window.text_metrics = text_metrics;
window.touches = touches;
window.anim_map = anim_map;
window.loop = loop;
window.url = url;
window.geocode = geocode;
// window.text_title = title;

