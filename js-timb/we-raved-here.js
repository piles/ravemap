;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var domq = require('./dom').q;
var popup = require('./popup');
var pattern = require('./pattern');
var loop = require('./anim_loop');

var about = {};

var open = false;
// var popup_content

var dom = {};

about.init = function(){

  popup.list.about = about;

  var link = domq('#link-about');
  var el = dom.el = domq('#popup-about');
  var el_tail = dom.el_tail = domq('#popup-about canvas');
  el_tail.width = 400
  el_tail.height = 50

  

  dom.tail_ctx = dom.el_tail.getContext('2d');

  //el_tail_ctx.globalCompositeOperation = 'source-atop';
  
  // el_tail_ctx.fillStyle = '#f00'
  // el_tail_ctx.fillRect(0,0, el_tail.width,el_tail.height)



  link.addEventListener('click', function(){
    if (open) about.close()
    else about.open()
  });

  loop.add(about.anim)
}

about.anim = function(){
  if (!about.open) return;

  var ctx = dom.tail_ctx;

  var ps = pattern();

  var p = ((Date.now() / 100) |0) % ps.length

  ctx.fillStyle = ps[p]

  ctx.clearRect(0,0, dom.el_tail.width,dom.el_tail.height)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(400, 0);
  ctx.lineTo(400, 50);
  ctx.lineTo(0, 0);
  ctx.fill();
  // el_tail_ctx.clip();

};


about.open = function(){

  popup.close();

  // popup.render("about some shit", {right: '10px', bottom: '10px'})
  domq('#popup-about').style.display = 'block'
  open = true
}

about.close = function(){
  domq('#popup-about').style.display = 'none'

  open = false
}

module.exports = about;
},{"./anim_loop":3,"./dom":11,"./pattern":20,"./popup":21}],2:[function(require,module,exports){
var domq = require('./dom').q;
var domqs = require('./dom').qs;
var popup = require('./popup');
var pattern = require('./pattern');
var loop = require('./anim_loop');
var text_metrics = require('./text_metrics');

var add = {};

var open = false;
// var popup_content

var dom = {};

add.init = function(){

  popup.list.add = add;

  var link = domq('#link-add');
  var el = dom.el = domq('#popup-add');
  var el_tail = dom.el_tail = domq('#popup-add canvas');
  el_tail.width = 400
  el_tail.height = 50

  dom.tail_ctx = dom.el_tail.getContext('2d');

  //el_tail_ctx.globalCompositeOperation = 'source-atop';
  
  // el_tail_ctx.fillStyle = '#f00'
  // el_tail_ctx.fillRect(0,0, el_tail.width,el_tail.height)

  // size inputs to popup
  var labels = domqs('#popup-add label');
  var inputs = domqs('#popup-add input');
  var css_props = {
    fontFamily: 'MaisonNeue',
    fontSize: '14px'
  };

  for (var i=0, l=labels.length; i<l; i++){
    var label = labels[i];
    var input = inputs[i];
    var text_size = text_metrics.text_wh_dom(label.innerHTML, css_props)
    var width = 400 - text_size.w - 30; //padding

    input.style.width = width + 'px';
  }

  link.addEventListener('click', function(){
    if (open) add.close()
    else add.open()
  });

  loop.add(add.anim)
}

// &bounds=34.172684,-118.604794|34.236144,-118.500938
// latlng sw, ne
  // var southWest = new L.LatLng(49.95121990866206, -10.634765625),
  //     northEast = new L.LatLng(60.6301017662667, 2.4609375),
// var southWest = new L.LatLng(50.680797145321655, -9.20654296875),
//     northEast = new L.LatLng(57.645400667406605, 0.98876953125),
// &bounds=50,-9.5|58,1

// http://maps.googleapis.com/maps/api/geocode/json?address=Fooville&sensor=false&bounds=50,-9.5|58,1
// http://maps.googleapis.com/maps/api/geocode/json?address=Fooville&sensor=false&region=uk

add.anim = function(){
  if (!add.open) return;

  var ctx = dom.tail_ctx;

  var ps = pattern();

  var p = ((Date.now() / 100) |0) % ps.length

  ctx.fillStyle = ps[p]

  ctx.clearRect(0,0, dom.el_tail.width,dom.el_tail.height)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(400, 0);
  ctx.lineTo(0, 50);
  ctx.lineTo(0, 0);
  ctx.fill();
  // el_tail_ctx.clip();

};


add.open = function(){
  // popup.render("about some shit", {right: '10px', bottom: '10px'})

  popup.close();

  domq('#popup-add').style.display = 'block'
  open = true
}

add.close = function(){
  domq('#popup-add').style.display = 'none'

  open = false
}

module.exports = add;
},{"./anim_loop":3,"./dom":11,"./pattern":20,"./popup":21,"./text_metrics":24}],3:[function(require,module,exports){

require('./anim_shim');

var anim = {};

anim.stats = new Stats();


var fns = anim.fns = [];
var anim_id = -1;
anim.frame_skip = 0;
var frame_num = 0;

anim.start = function(){
  if (anim_id === -1)
    anim_id = requestAnimationFrame(loop);
}

anim.stop = function(){
  cancelAnimationFrame(anim_id)
  anim_id = -1;
};

anim.add = function(fn){
  fns.push(fn);
};

var loop = function(){
  anim_id = requestAnimationFrame(loop);

  anim.stats.begin();

  if (anim.frame_skip > 0){
    frame_num += 1;
    if (frame_num < anim.frame_skip)
      return
    else
      frame_num = 0;
  }

  for (var i=0, fn; fn=fns[i]; i++)
    fn();

  anim.stats.end();
}

module.exports = anim;
},{"./anim_shim":5}],4:[function(require,module,exports){
var url = require('./url');
var css = require('./css');
var map = require('./map');
var benchmark = require('./benchmark')();
var loop = require('./anim_loop');

var anim = {};
var dom = {};
var map_state = '';

anim.gif_url = "http://25.media.tumblr.com/c6720c696cf792254c05f2509a3d200f/tumblr_mrl6ciiN7P1qz6yl6o1_400.gif";
anim.gif_loaded = false;
anim.benchmark = benchmark;

anim.init = function(){

  // visible canvas
  var canvas = anim.canvas = dom.canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = anim.ctx = dom.ctx = canvas.getContext('2d');

  // canvas for raw gif animation
  // var canvas_tmp = anim.canvas_tmp = document.createElement('canvas');
  // canvas_tmp.width = window.innerWidth;
  // canvas_tmp.height = window.innerHeight;

  // var ctx_tmp = anim.ctx_tmp = canvas_tmp.getContext('2d');
  // ctx_tmp.webkitImageSmoothingEnabled = false;
  // ctx_tmp.mozImageSmoothingEnabled = false;
  // ctx_tmp.imageSmoothingEnabled = false;

  dom.canvas_mask = document.createElement('canvas');
  dom.canvas_mask.width = window.innerWidth;
  dom.canvas_mask.height = window.innerHeight;
  dom.ctx_mask = dom.canvas_mask.getContext('2d');

  window.addEventListener('resize', function(){
    dom.canvas_mask.width = 
//    canvas_tmp.width = 
    canvas.width = window.innerWidth;

    dom.canvas_mask.height = 
//    canvas_tmp.height = 
    canvas.height = window.innerHeight;

  });

  // canvas to composite animation and map tiles on
  var canvas_tile_composite = anim.canvas_tile_composite = document.createElement('canvas');
  canvas_tile_composite.width = 256;
  canvas_tile_composite.height = 256;
  anim.ctx_tile_composite = canvas_tile_composite.getContext('2d');
  //document.body.appendChild(canvas_tile_composite);

  //anim.gif = GIF(url.proxify(anim.gif_url))
  //anim.gif.on("rendered", function(){ anim.gif_loaded = true });
  //anim.gif.render();

  // force mask rebuild when a tile loads
  map.layer_uk_mask.on('tileload', function(e){ map_state = 'dirty!' })

  // requestAnimationFrame(anim.loop);
  loop.add(anim.loop);
};




anim.loop = function(){

  //var ui_layers = document.querySelectorAll('.leaflet-layer div');

  var map_pane_xy = css.get_transform_translate_coords(map.ui_map_pane);

  // find visible map zoom level
//  for (var i=0, layer; layer=ui_layers[i]; i++){
//    if (ui_has_a_transform(layer)) continue;
//    else visible_layer = layer;
//  }
//  if (!visible_layer) return;

  var visible_layer = document.querySelectorAll('.leaflet-layer')[0];

  //anim.ctx.clearRect(0,0, anim.canvas.width, anim.canvas.height)

/*
  if (anim.gif_loaded) {
    var frameCanvas = anim.gif.frames[anim.gif.currentFrame()].ctx.canvas;
    anim.ctx_tmp.drawImage(frameCanvas, 
                           0,0, frameCanvas.width, frameCanvas.height,
                           0,0, anim.canvas_tmp.width, anim.canvas_tmp.height
                          );
  }
*/

  // avoid rebuilding mask if map not moved/resized/zoomed
  var ml = map.leaflet
    , map_state_new = ml._size.x + ' ' + 
                      ml._size.y + ' ' + 
                      ml._zoom + ' ' + 
                      ml._mapPane._leaflet_pos.x + ' ' +
                      ml._mapPane._leaflet_pos.y

  if (map_state !== map_state_new){

    dom.ctx_mask.clearRect(0,0, dom.canvas_mask.width,dom.canvas_mask.height)

    // find visible tiles in layer
    for (var i=0, tile; tile=visible_layer.children[i]; i++){
      if (!tile.src || !tile.complete) continue;

      benchmark.start('get-dom');
      // calculating tile coords from images in the dom
      if (tile.style.left){ // node using top/left css
        var tile_l = parseInt(tile.style.left) + map_pane_xy[0];
        var tile_t = parseInt(tile.style.top) + map_pane_xy[1];
      } else { // node using transform css
        var tile_xy = css.get_transform_translate_coords(tile)
        var tile_l = tile_xy[0] + map_pane_xy[0];
        var tile_t = tile_xy[1] + map_pane_xy[1];
      }
      benchmark.stop('get-dom');


      // gotta keep coords inside canvas size or context2d api errors
      if (tile_l < 0){
        var x_tile = Math.abs(tile_l)
        var x_tmp = 0;
        var w_tmp = map.tile_size + tile_l;
      } else {
        var x_tile = 0;
        var x_tmp = tile_l;
        var w_tmp = map.tile_size;
      }

      if (tile_t < 0){
        var y_tile = Math.abs(tile_t)
        var y_tmp = 0;
        var h_tmp = map.tile_size + tile_t;
      } else {
        var y_tile = 0;
        var y_tmp = tile_t;
        var h_tmp = map.tile_size;
      }

      if (x_tmp + w_tmp >= anim.canvas.width){
        w_tmp = anim.canvas.width - x_tmp;
      }
      if (y_tmp + h_tmp >= anim.canvas.height){
        h_tmp = anim.canvas.height - y_tmp;
      }

      if (h_tmp < 0 || w_tmp < 0) continue;

      benchmark.start('compositing');

      // compositing: old way
      //    each tile:
      //         draw piece of anim into tmp_tile
      //         mask tile into tmp_tile
      //         draw tmp_tile into main
      // takes 3*num_tiles writes, which could be like 48 writes if there were 16 tiles

      // new way:
      //    each tile:
      //         draw tile into mask
      //    draw anim into main
      //    draw mask on main
      // would take num_tiles+2 writes, which could be like 18 writes
      // but the same number of pixels

  /* old way
      anim.ctx_tile_composite.clearRect(0,0, map.tile_size, map.tile_size)
      // composite this tile from animation canvas
      anim.ctx_tile_composite.globalCompositeOperation = 'source-over';
      // anim.ctx_tile_composite.drawImage(anim.canvas_tmp, x_tmp,y_tmp,w_tmp,h_tmp,    0,0,w_tmp,h_tmp);
      anim.ctx_tile_composite.drawImage(window.canvas, x_tmp,y_tmp,w_tmp,h_tmp,    0,0,w_tmp,h_tmp);
  */

  // new way
      // draw map tile into fullscreen mask
      dom.ctx_mask.drawImage(tile, x_tile,y_tile,w_tmp,h_tmp,    tile_l+x_tile,tile_t+y_tile,w_tmp,h_tmp);

  /* old way
      // mask it with map tile
      anim.ctx_tile_composite.globalCompositeOperation = 'destination-in';
      anim.ctx_tile_composite.drawImage(tile, x_tile,y_tile,w_tmp,h_tmp, 0,0,w_tmp,h_tmp);
      // composite tile to main canvas
      anim.ctx.drawImage(anim.canvas_tile_composite, 0,0,w_tmp,h_tmp, x_tmp,y_tmp,w_tmp,h_tmp  )

      benchmark.stop('compositing');
  */
    }
  }

  map_state = map_state_new
// new way
  benchmark.start('compositing');

  dom.ctx.globalCompositeOperation = 'source-over';
  dom.ctx.drawImage(window.canvas, 
                         0,0,window.canvas.width,window.canvas.height,
                         0,0,dom.canvas.width,dom.canvas.height);
  dom.ctx.globalCompositeOperation = 'destination-in';
  dom.ctx.drawImage(dom.canvas_mask, 
                         0,0,dom.canvas_mask.width,dom.canvas_mask.height,
                         0,0,dom.canvas.width,dom.canvas.height);  

  benchmark.stop('compositing');

};

module.exports = anim;
},{"./anim_loop":3,"./benchmark":7,"./css":8,"./map":18,"./url":30}],5:[function(require,module,exports){
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                               || window[vendors[x]+'CancelRequestAnimationFrame'];
};
},{}],6:[function(require,module,exports){
var domq = require('./dom').q;
var loop = require('./anim_loop');
var url = require('./url');

var background = {};

var dom = {};

background.init = function(){
  dom.el = domq("#background");

  var q = url.parse(location.href).queryKey

  if (q.bg === 'anim') background.fn = background.as_anim
  if (q.bg === 'checkers') background.fn = background.as_gif
  if (q.bg === 'chris') background.fn = background.as_chris

  else background.fn = background.as_gif

  background.fn();
}

background.as_chris = function(){
  // var c = document.createElement('canvas');
  // c.width = window.innerWidth
  // c.height = window.innerHeight
  dom.el.style.backgroundColor = '#000'
  dom.el.appendChild(window.canvas_bg)
  // dom.ctx = c.getContext('2d');

  loop.add(window.loop_chris_bg);
}

background.as_anim = function(){
  var c = document.createElement('canvas');
  c.width = window.innerWidth
  c.height = window.innerHeight
  dom.el.appendChild(c)
  dom.ctx = c.getContext('2d');

  loop.add(background.anim_render);
}

background.anim_render = function(){

  /*
  170380
  0a0e79
  03357e
  084b82
  025f80
  027280
  027f7b

  110c10
  e1e1e1
  */
  var ctx = dom.ctx
  var sky_w = window.innerWidth
    ,  w2 = (window.innerWidth/2) |0
    , sky_h = window.innerHeight
    , sky_h2 = window.innerHeight/2

  ctx.canvas.width = sky_w;
  ctx.canvas.height = sky_h;

  var sky = ctx.createLinearGradient(0,0,0,sky_h2);
  sky.addColorStop(0, "#170380");
  sky.addColorStop(1, "#027f7b");

  var floor = ctx.createLinearGradient(0,sky_h2,0,sky_h);
  floor.addColorStop(0, "#110c10");
  floor.addColorStop(1, "#e1e1e1");
  
  ctx.fillStyle = sky;
  ctx.fillRect(0,0, sky_w,sky_h2);

  ctx.fillStyle = floor;
  ctx.fillRect(0,sky_h2, sky_w,sky_h2);

  // draw vert grid lines
  var speed = 20;
  var offset_initial = (1 - ((Date.now() / speed) % 100) / 100);

  var pos = 1, end = sky_h2, mult = 1.6, offset = 0, old_pos = 0

  dom.ctx.fillStyle = '#000'

  while (pos - offset < end){
    old_pos = pos;
    pos *= mult
    offset = ((pos - old_pos) * offset_initial);
    dom.ctx.fillRect(0, sky_h2 + pos - offset, sky_w, 1)
  }


  // draw horiz grid lines

  var x1 = w2, x2 = w2
    , x1_inc = 32, x2_inc = 128

  while(x1 < sky_w){
    ctx.beginPath()
    ctx.moveTo(x1, sky_h2+1)
    ctx.lineTo(x2, sky_h)
    ctx.stroke();
    x1 += x1_inc;
    x2 += x2_inc; 
  }

  x1 = w2, x2 = w2

  while(x1 > 0){
    x1 -= x1_inc;
    x2 -= x2_inc; 
    ctx.beginPath()
    ctx.moveTo(x1, sky_h2+1)
    ctx.lineTo(x2, sky_h)
    ctx.stroke();
  }

};

background.as_gif = function(){
  dom.el.style.backgroundImage = "url(img/bg.checkerboard.light.gif)";
}




module.exports = background;
},{"./anim_loop":3,"./dom":11,"./url":30}],7:[function(require,module,exports){
// var b = Benchmark();
// b.start("something") // start a timer named "something"
// b.stop("something") // stop it
// b.something <-- time it took between start and stop calls in ms
// b.total <--- total ms of all benchmarks

var Benchmark = function(){
  var b = Object.create(Benchmark.proto);
  b.total = 0;
  return b;
};
Benchmark.proto = {};
Benchmark.proto.start = function(name){
  this[name+"_start_timestamp"] = Date.now();
};
Benchmark.proto.stop = function(name){
  if (!this[name+"_start_timestamp"]) return;
  var val = Date.now() - this[name+"_start_timestamp"];
  delete this[name+"_start_timestamp"];
  this[name] = val + (this[name] || 0);
  this.total += val;
};

//module.exports = Benchmark;

if (typeof module !== "undefined") module.exports = Benchmark;
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
var m = require('./mouse');
var geom = require('./geom');

var cursor = {};

cursor.state = 'default';

cursor.set = function(c){
  cursor.state = c;
  document.body.style.cursor = c;
};

cursor.init = function(){
  window.addEventListener('mousemove', function(e){
    cursor.check_cursor_bounds();
  });
};

cursor.bounds = {};
cursor.check_cursor_bounds = function(){
  var x =m.x, y =m.y;

  for (key in cursor.bounds){ var cb = cursor.bounds[key];
    if (geom.bounds_hit_test(cb, x, y)) {
      if (m.down && 'mousedown' in cb){
        cursor.set(cb.mousedown)
        return;
      }
      if ('mouseover' in cb){
        cursor.set(cb.mouseover)
        return;
      }
    }
  }

  cursor.set('default');

};

module.exports = cursor;
},{"./geom":16,"./mouse":19}],10:[function(require,module,exports){
var data = [
  {year: '1991',
   data: {"events":{"1991":[{"id":"14","eventname":"","url":"https:\/\/soundcloud.com\/dannychicago\/rage-1991","venue":"Rage","latitude":"26.5681406","longitude":"53.934423","eventdate":"1991-01-01","location":"Heaven","eventdate_known":"0"}]},"meta":{"years":["1991","1992","1993","1994","1995","1996"]}}
  },
  {year: '1992',
   data: {"events":{}}
  },  
  {year: '1993',
   data: {"events":{"1993":[{"id":"5","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-the-edge-january","venue":"The Edge","latitude":"41.7673292","longitude":"-72.3196697","eventdate":"1993-01-01","location":"Coventry The edge","eventdate_known":"0"},{"id":"6","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-dreamscape-7-26","venue":"Dreamscape 7","latitude":"52.0406224","longitude":"-0.7594171","eventdate":"1993-01-01","location":"Sanctury Milton Keynes","eventdate_known":"0"},{"id":"7","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-arcadia-the","venue":"Seduction","latitude":"51.3964896","longitude":"0.8365233","eventdate":"1993-01-01","location":"The Crest, Isle Of Sheppy","eventdate_known":"0"},{"id":"11","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-dreamscape-8-31","venue":"dreamscape 8","latitude":"52.0406224","longitude":"-0.7594171","eventdate":"1993-01-12","location":"denbigh leisure centre milton keynes","eventdate_known":"1"},{"id":"12","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-quest-10-04-1993","venue":"the adrenalin corporation","latitude":"52.5876743","longitude":"-2.1242283","eventdate":"1993-10-04","location":"braodstreet, wolverhampton","eventdate_known":"1"},{"id":"13","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-helter-skelter","venue":"Helter Skelter","latitude":"52.0406224","longitude":"-0.7594171","eventdate":"1993-03-12","location":"Sanctury Milton Keynes","eventdate_known":"1"}]},"meta":{"years":["1991","1992","1993","1994","1995","1996"]}}
  },
  {year: '1994',
   data: {"events":{"1994":[{"id":"2","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-world-dance","venue":"World Dance","latitude":"50.9557437","longitude":"0.9336241","eventdate":"1994-01-01","location":"Lydd Airport","eventdate_known":"0"},{"id":"3","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-united-dance-02","venue":"United Dance","latitude":"51.9779","longitude":"-0.20709","eventdate":"1994-01-01","location":"Stevenage Leisure Centre","eventdate_known":"0"},{"id":"8","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-world-dance-lydd","venue":"World Dance","latitude":"50.9557437","longitude":"0.9336241","eventdate":"1994-01-01","location":"Lydd Airport","eventdate_known":"0"},{"id":"10","eventname":"","url":"https:\/\/soundcloud.com\/ill-axion\/sets\/dreamscape-xii-1994","venue":"Dream Scape 12","latitude":"52.0406224","longitude":"-0.7594171","eventdate":"1994-10-26","location":"Sanctury Milton Keynes","eventdate_known":"1"},{"id":"16","eventname":"","url":"https:\/\/soundcloud.com\/ravearchive\/sets\/randall-elevation-together-for","venue":"Elevation","latitude":"51.419095","longitude":"-0.068858","eventdate":"1994-01-01","location":"Crystal palace sports centre","eventdate_known":"0"}]},"meta":{"years":["1991","1992","1993","1994","1995","1996"]}}
  },
  {year: '1995',
   data: {"events":{"1995":[{"id":"1","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-the-pleasuredome","venue":"Fantasy Island","latitude":"53.146403","longitude":"0.337881","eventdate":"1995-01-01","location":"Skegness","eventdate_known":"0"},{"id":"9","eventname":"","url":"https:\/\/soundcloud.com\/ill-axion\/dj-hype-helter-skelter-1995","venue":"Helter Skelter","latitude":"52.0406224","longitude":"-0.7594171","eventdate":"1995-10-07","location":"denbigh leisure centre milton keynes","eventdate_known":"1"}]},"meta":{"years":["1991","1992","1993","1994","1995","1996"]}}
  },
  {year: '1996',
   data: {"events":{"1996":[{"id":"4","eventname":"","url":"https:\/\/soundcloud.com\/slipmatt-1\/slipmatt-live-moondance","venue":"Moondance","latitude":"51.542141","longitude":"-0.1277349","eventdate":"1996-01-01","location":"Bagleys Kings Cross London","eventdate_known":"0"},{"id":"15","eventname":"","url":"https:\/\/soundcloud.com\/metalheadz\/kemistry-storm-goldie","venue":"Metalheadz","latitude":"50.82253","longitude":"-0.137163","eventdate":"1996-01-01","location":"Brighton","eventdate_known":"0"}]},"meta":{"years":["1991","1992","1993","1994","1995","1996"]}}
  }
];

module.exports = data;
},{}],11:[function(require,module,exports){
var dom = {};

// turn html text into live elements
dom.text2el = function(text){
  dom.el = dom.el || document.createElement('div');
  dom.el.innerHTML = text;
    // IEmakeUnselectable(text2el.el.childNodes[0]); //todo: hook to do this on creation?
  return dom.el.childNodes[0];
}

dom.q = function(q){
  return document.querySelector(q)
};

dom.qs = function(q){
  return document.querySelectorAll(q)
};

module.exports = dom;
},{}],12:[function(require,module,exports){
var draw = {};

draw.line_h = function(ctx, x,y, w,h, pad){
  pad = pad||0;
  var mid = (h/2)|0;
  // ctx.fillStyle = '#000';
  ctx.fillRect(x+pad,y+mid, w-pad*2, 1);
};

draw.line_v = function(ctx, x,y, w,h, pad){
  pad = pad||0;
  var mid = (w/2)|0;
  // ctx.fillStyle = '#000';
  ctx.fillRect(x+mid,y+pad, 1,h-pad*2)
};

draw.plus = function(ctx, x,y, w,h, pad){
  draw.line_v(ctx, x,y, w,h, pad);
  draw.line_h(ctx, x,y, w,h, pad);
};

draw.rect = function(ctx, x,y, w,h, pad){
  pad = pad||0;
  draw.edge.t(ctx, x,y, w,h, pad);
  draw.edge.b(ctx, x,y, w,h, pad);
  draw.edge.l(ctx, x,y, w,h, pad);
  draw.edge.r(ctx, x,y, w,h, pad);
};

draw.edge = {};
draw.edge.t = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(0,0, w,1);
};
draw.edge.b = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(0,h-1, w,1);
};
draw.edge.l = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(0,0, 1,h);
};
draw.edge.r = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(w-1,0, 1,h);
};


module.exports = draw;
},{}],13:[function(require,module,exports){
module.exports = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};
},{}],14:[function(require,module,exports){
var extend = require('./extend');
var css = require('./css');

// based on https://github.com/patrickmarabeas/jQuery-FontFace-onLoad

var font_load = function(config_in){

  var config = extend({
      font: '',
      load_fn: function(){},
      fail_fn: function(){},
      font_to_compare: '"Times New Roman"',
      string: '@@@',
      delay: 50,
      timeout: 8000
  }, config_in);

  var el = document.createElement('span')
    , style = el.style;
  style.position = 'absolute';
  style.top = '-9999px';
  style.left = '-9999px';
  style.visibility = 'hidden';
  style.fontFamily = config.font_to_compare;
  style.fontSize = '50px'; 
  el.innerHTML = config.string;

  document.body.appendChild(el);

  var font_width_old = el.offsetWidth;

  el.style.fontFamily = config.font + ',' + config.font_to_compare;

  function check_loop() {

    var font_width = el.offsetWidth;

    if (font_width_old === font_width){

      if(config.timeout < 0) {
          config.fail_fn();
        // $this.removeClass(config.onLoad);
        // $this.addClass(config.onFail);
      }
      else {
        // $this.addClass(config.onLoad);              
        setTimeout(check_loop, config.delay);
        config.timeout = config.timeout - config.delay;
      }

    }
    else {
      // $this.removeClass(config.onLoad);
      config.load_fn();
    }
  };

  check_loop();

}

module.exports = font_load;
},{"./css":8,"./extend":13}],15:[function(require,module,exports){
var geocode = {};

var gmap_geo = new google.maps.Geocoder();

geocode.from_address = function(txt) {
  var opts = {
    region: 'uk',
    address: txt
  };
  gmap_geo.geocode( opts, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      console.log(results)
    } else {
      console.log("Geocode was not successful for the following reason: " + status);
    }
  });
}

module.exports = geocode;
},{}],16:[function(require,module,exports){
var geom = {};

geom.init

geom.bounds_hit_test = function(b, x, y){
  if (typeof b === 'undefined') return false;
  // console.log(x, y, b.x1, b.y1, b.x2, b.y2);
  if (x > b.x1 && 
      x < b.x2 && 
      y > b.y1 && 
      y < b.y2   ) return true;
      return false;
};


local_xy_to_canvas_xy = function(model, x, y){
  
}

local_xy_to_window_xy = function(model, x, y){
  x = model.l + x;
  y = model.t + y;
  return {x:x, y:y};
}

window_xy_to_local_xy = function(model, x, y){
  
}

module.exports = geom;
},{}],17:[function(require,module,exports){
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


},{"./about":1,"./add":2,"./anim_loop":3,"./anim_map":4,"./background":6,"./cursor":9,"./font_load":14,"./geocode":15,"./map":18,"./mouse":19,"./share":22,"./text_metrics":24,"./tiles":25,"./timeline":26,"./title":28,"./touches":29,"./url":30,"./zoom":31}],18:[function(require,module,exports){
var url = require('./url');
var data = require('./data');
var text2el = require('./dom').text2el;
var soundcloud = require('./soundcloud');

var map = {};
map.tile_size = 256;
map.markers = [];

map.init = function(){

  map.leaflet = L.map('map', {
      minZoom: 3,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: false,
      zoomAnimation: false,
      inertia: false
  });

  map.ui_map_pane = document.querySelector('.leaflet-map-pane');

  // var southWest = new L.LatLng(49.95121990866206, -10.634765625),
  //     northEast = new L.LatLng(60.6301017662667, 2.4609375),
  var southWest = new L.LatLng(50.680797145321655, -9.20654296875),
      northEast = new L.LatLng(57.645400667406605, 0.98876953125),
      bounds = new L.LatLngBounds(southWest, northEast);

  map.leaflet.fitBounds(bounds);

  // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
 map.layer_uk_mask = L.tileLayer(url.tile_server + 'uk_mask/{z}/{x}/{y}.png', {tms: true, opacity: 0.0}).addTo(map.leaflet);
 map.layer_world = L.tileLayer(url.tile_server + 'world/{z}/{x}/{y}.png', {tms: true}).addTo(map.leaflet);
  marker_init();

};



var open_player = null;
var open_player_data = null;

var marker_popup = function(e){
  // console.log(e, e.target)

/*
  map.leaflet.closePopup();

  if (open_popup === e.target.data){
    open_popup = null;
    return;    
  }
*/
  // if (map.leaflet._popup){
    // open_popup = null;
    // return;
  // }

  // console.log(e.target)

  // var anchor = L.point(e.target.options.icon.options.popupAnchor || [0, 0]);
  // anchor = anchor.add(L.Popup.prototype.options.offset);

  // var anchor = L.point([]);

  var content = "<div class='soundcloud-popup'>" + 
  "<h2>We Raved Here:</h2>" +
  "<h3>" + e.target.data.venue + "</h3>" +
  "<a href='" + e.target.data.url + "' class='sc-player'>soundcloud set</a>" +
  "</div>"

  // var options = {offset:anchor};

  if (open_player) map.leaflet.removeLayer(open_player);
  if (open_player_data === e.target.data){
    open_player_data = null;
    return
  }

  open_player = new soundcloud.leaflet_layer(e.target._latlng, content)
  open_player_data = e.target.data;

  map.leaflet.addLayer(open_player);
  return

/*
  map.leaflet.openPopup(content, e.target._latlng, {

  // map.leaflet.openPopup(e.target.data.venue, e.target._latlng, {
    offset: anchor
  });
  
  $('a.sc-player, div.sc-player').scPlayer();


  open_popup = e.target.data;  
*/
}

var marker_init = function(){

  var icon_path = './img/map/'
  map.icon_blue = L.icon({
      iconUrl: icon_path+'marker-icon.png',
      iconRetinaUrl: icon_path+'marker-icon-2x.png',
      shadowUrl: icon_path+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  map.icon_blue_small = L.icon({
      iconUrl: icon_path+'marker-icon.png',
      iconRetinaUrl: icon_path+'marker-icon-2x.png',
      shadowUrl: icon_path+'marker-shadow.png',
      iconSize: [25*0.6, 41*0.6],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41*0.6, 41*0.6]
  });

  map.icon_pink = L.icon({
      iconUrl: icon_path+'marker-icon-pink.png',
      iconRetinaUrl: icon_path+'marker-icon-pink-2x.png',
      shadowUrl: icon_path+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  for (var iy=0, item_year; item_year=data[iy]; iy++){
    var year = item_year.year;
    var events = item_year.data.events;
    if (!(year in events)) continue;
    for (var i=0, item; item=events[year][i]; i++){
      // var latlng = L.LatLng(parseFloat(item.latitude), parseFloat(item.longitude));
      var marker = L.marker([parseFloat(item.latitude), parseFloat(item.longitude)], {
        riseOnHover: true,
        icon: map.icon_blue_small
      });
      marker.on('click', marker_popup);
      marker.data = item;
      // marker.bindPopup(item.venue);
      marker.addTo(map.leaflet);
      map.markers.push(marker);
      item.marker = marker;
    }
  }
}

module.exports = map;

},{"./data":10,"./dom":11,"./soundcloud":23,"./url":30}],19:[function(require,module,exports){
var m = {};

m.x = 0;
m.y = 0;
m.down = false;

m.init = function(){

  window.addEventListener('mousemove', function(e){
    m.x = e.clientX;
    m.y = e.clientY;
  });

  window.addEventListener('mousedown', function(e){ m.down = true });
  window.addEventListener('mouseup',   function(e){ m.down = false });
  document.addEventListener('mouseout', function(e){ m.down = false });

// setInterval(function(){console.log(mouse.down)}, 1000)

};



module.exports = m;
},{}],20:[function(require,module,exports){


var patterns = [];

var popup_tail_fill_pattern_create = function(){
  // var patterns = [];
  if (patterns.length) return patterns;

  var size = 8
    , s2 = size*2
    , speed = 1
    , color_1 = '#000'
    , color_2 = '#222'

  var src_canvas = document.createElement('canvas')
    , src_ctx = src_canvas.getContext('2d')

  src_canvas.width = src_canvas.height = s2;

  src_ctx.fillStyle = color_1;
  src_ctx.fillRect(0,0, size,size)
  src_ctx.fillRect(size,size, size,size)
  src_ctx.fillStyle = color_2;
  src_ctx.fillRect(size,0, size,size)
  src_ctx.fillRect(0,size, size,size)

  for (var i=0, l=size/speed; i<l; i++){
    // tmp_ctx.clearRect(0,0,size,size)
    var tmp_canvas = document.createElement('canvas')
    tmp_canvas.width = tmp_canvas.height = s2;
    var tmp_ctx = tmp_canvas.getContext('2d')

    tmp_ctx.drawImage(src_canvas, i,i,s2-i,s2-i, 0,0,s2-i,s2-i)
    if (i > 0){
      tmp_ctx.drawImage(src_canvas, i,0,s2-i,i, 0,s2-i,s2-i,i)
      tmp_ctx.drawImage(src_canvas, 0,i,i,s2-i, s2-i,0,i,s2-i)
      tmp_ctx.drawImage(src_canvas, 0,0,i,i, s2-i,s2-i,i,i)
    }

    //tmp_c
    var p = tmp_ctx.createPattern(tmp_canvas, "repeat");
    patterns.push(p)
  }

  return patterns;
}

module.exports = popup_tail_fill_pattern_create
},{}],21:[function(require,module,exports){
var popup = {};

popup.list = {};

popup.close = function(){
  for (key in popup.list)
    popup.list[key].close();
};

module.exports = popup;
},{}],22:[function(require,module,exports){
// https://twitter.com/about/resources/buttons#tweet

var domq = require('./dom').q;
var popup = require('./popup');
var pattern = require('./pattern');
var loop = require('./anim_loop');

var share = {};

var open = false;

var dom = {};

share.init = function(){

  popup.list.share = share;

  var link = domq('#link-share');
  var el = dom.el = domq('#popup-share');
  var el_tail = dom.el_tail = domq('#popup-share canvas');
  el_tail.width = 400
  el_tail.height = 50

  dom.tail_ctx = dom.el_tail.getContext('2d');

  link.addEventListener('click', function(){
    if (open) share.close()
    else share.open()
  });

  share.resize()
  loop.add(share.anim);
}

share.anim = function(){
  if (!share.open) return;

  var ctx = dom.tail_ctx;

  var ps = pattern();

  var p = ((Date.now() / 100) |0) % ps.length

  ctx.fillStyle = ps[p]

  ctx.clearRect(0,0, dom.el_tail.width,dom.el_tail.height)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(400, 0);
  ctx.lineTo(200, 50);
  ctx.lineTo(0, 0);
  ctx.fill();
  // el_tail_ctx.clip();

};

share.resize = function(){
  var w = 400;
  var l = (window.innerWidth/2 - w/2) |0;
  dom.el.style.left = l+'px'
};

share.open = function(){
  // popup.render("about some shit", {right: '10px', bottom: '10px'})
  
  popup.close();

  domq('#popup-share').style.display = 'block'
  open = true
}

share.close = function(){
  domq('#popup-share').style.display = 'none'

  open = false
}

module.exports = share;
},{"./anim_loop":3,"./dom":11,"./pattern":20,"./popup":21}],23:[function(require,module,exports){
var text2el = require('./dom').text2el;

var soundcloud = {};

soundcloud.render = function(){
  
}

soundcloud.leaflet_layer = L.Class.extend({

    options: {},

    initialize: function (latlng, content, options) {
        // save position of the layer or any options from the constructor
        this._latlng = latlng;
        this._content = content;
        // this._offset = options.offset
        // L.setOptions(this, options);
    },

    onAdd: function (map) {
        this._map = map;

        // create a DOM element and put it into one of the map panes
        // this._el = L.DomUtil.create('div', 'my-custom-layer leaflet-zoom-hide');
        this._el = text2el(this._content);

        // map.getPanes().overlayPane.appendChild(this._el);
        map.getPanes().popupPane.appendChild(this._el);
        $('a.sc-player, div.sc-player').scPlayer();

        // console.log(this._el.offsetWidth, this._el.offsetHeight)

        this._offset = L.point([-(this._el.offsetWidth/2)|0, -this._el.offsetHeight - 45])
        // this._offset = this._offset.add(L.Popup.prototype.options.offset);

        // add a viewreset event listener for updating layer's position, do the latter
        map.on('viewreset', this._reset, this);
        this._reset();
    },

    onRemove: function (map) {
        // remove layer's DOM elements and listeners
        $('.sc-player.playing a.sc-pause').click();
        map.getPanes().popupPane.removeChild(this._el);
        // $.scPlayer.stopAll();
        map.off('viewreset', this._reset, this);
    },

    _reset: function () {
        // update layer's position
        // console.log(this._offset)
        // var pos = this._map.latLngToLayerPoint(this._latlng);

        var pos = this._offset.add(this._map.latLngToLayerPoint(this._latlng));
        L.DomUtil.setPosition(this._el, pos);
    }
});


module.exports = soundcloud;


// <iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F113559292"></iframe>
},{"./dom":11}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
var tiles = {};

tiles.uk_mask_data = {3:{3:[5],4:[5]},4:{7:[10,11],8:[10]},5:{14:[22],15:[21,22],16:[21]},6:{29:[44],30:[42,43,44],31:[42,43,44,45],32:[42,43]},7:{59:[89],60:[85,86,87,89],61:[84,85,86,87,88,89],62:[84,85,86,87,88,89,90],63:[84,85,86,87,88,89,90,91],64:[85,86]}};
tiles.world_data = {3:{0:[0,1,2,3,4,5,6],1:[0,1,3,4,5,6,7],2:[0,1,2,3,4,5,6,7],3:[0,1,2,3,4,5,6,7],4:[0,1,2,3,4,5,6,7],5:[0,1,2,3,4,5,6,7],6:[0,1,2,3,4,5,6,7],7:[0,1,2,3,4,5,6]},4:{0:[0,1,10,11,12,2,5,6,7,8,9],1:[0,1,10,11,12,2,6,7,8],2:[0,1,10,11,12,13,2,3,6,8,9],3:[0,1,10,11,12,13,14,2,3,6,7,8,9],4:[0,1,10,11,12,13,14,15,2,3,4,5,6,7,8,9],5:[0,1,10,11,12,13,14,15,2,3,4,5,6,7,8,9],6:[0,1,11,12,13,14,15,2,4,5,6,7,8,9],7:[0,1,10,11,12,13,14,15,2,3,6,7,8,9],8:[0,1,10,11,12,13,14,2,3,5,6,7,8,9],9:[0,1,10,11,12,13,14,2,3,5,6,7,8,9],10:[0,1,10,11,12,13,14,2,3,4,5,6,7,8,9],11:[0,1,10,11,12,13,14,2,3,5,6,7,8,9],12:[0,1,10,11,12,13,14,2,3,4,7,8,9],13:[0,1,10,11,12,13,2,3,4,6,7,8,9],14:[0,1,10,11,12,13,2,3,4,5,6,7,8,9],15:[0,1,10,11,12,2,3,5,6,7,8]},5:{0:[0,1,11,13,14,15,16,17,18,21,22,23,24,25],1:[0,1,14,15,16,17,18,2,21,22,23,24,25,3,4],2:[0,1,13,14,15,16,17,2,21,22,23,24,25,3,4,5],3:[0,1,13,14,15,2,22,23,24,3,4,5],4:[0,1,13,19,2,20,21,22,23,24,25,26,3,4,5,6],5:[0,1,17,18,19,2,20,21,22,23,24,25,26,27,3,4,5,6],6:[0,1,13,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6],7:[0,1,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7],8:[0,1,12,13,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6],9:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,7,9],10:[0,1,10,11,12,13,14,15,16,17,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,7,8,9],11:[0,1,12,13,14,15,16,2,20,21,22,23,24,25,26,27,28,29,3,30,4,8,9],12:[0,1,10,13,14,15,2,22,23,24,25,26,27,28,29,3,30,4,9],13:[0,1,14,15,16,17,19,2,23,24,25,26,27,28,29,3,30,4,5,9],14:[0,1,12,15,16,17,18,19,2,23,24,25,26,27,28,29,3,30,4,5,6],15:[0,1,12,14,16,17,18,19,2,20,21,22,23,25,3,4,5,6,7],16:[0,1,10,15,16,17,18,19,2,20,21,22,23,27,28,3,4,5,6,7],17:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7],18:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7],19:[0,1,11,13,14,15,16,17,18,19,2,20,21,22,23,24,28,3,4,5,6,7],20:[0,1,11,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,28,29,3,4,5,6,7,8],21:[0,1,14,15,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7,8],22:[0,1,10,11,12,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7],23:[0,1,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7],24:[0,1,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7,8],25:[0,1,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7,8],26:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,7,8],27:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,7,8],28:[0,1,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,7,8],29:[0,1,11,12,13,14,15,16,18,2,20,21,22,23,24,25,26,27,3,4,5,6,7],30:[0,1,10,11,13,14,15,16,17,2,21,22,23,24,25,3,4,5,6,7],31:[0,1,10,11,12,14,15,16,17,21,22,23,24,25,4,6]},6:{0:[0,1,23,26,27,28,29,32,37,42,47,48,49,50],1:[0,1,2,28,29,3,30,31,35,36,42,43,44,45,46,47,48],2:[0,1,2,29,3,30,36,43,45,46,47,48,49,5,7,8],3:[0,1,2,28,3,30,31,32,33,35,36,43,44,45,46,47,48,49,5,50,7,8,9],4:[0,1,2,28,3,31,32,35,4,43,44,45,46,47,48,49,5,50,6,7,8,9],5:[0,1,10,2,27,28,29,3,4,44,45,46,47,48,49,5,6,7,8,9],6:[0,1,10,11,2,26,28,29,3,30,4,45,46,47,48,49,5,6,7,8,9],7:[0,1,10,11,2,27,28,29,3,30,4,44,45,46,47,48,49,5,6,7,8,9],8:[0,1,10,11,2,27,3,4,42,43,44,45,46,47,48,49,5,6,7,8,9],9:[0,1,10,11,12,2,27,3,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,6,7,8,9],10:[0,1,10,11,12,2,3,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,6,7,8,9],11:[0,1,10,11,12,2,3,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,6,7,8,9],12:[0,1,10,11,2,26,3,33,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,6,7,8,9],13:[0,1,10,11,12,13,2,27,3,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,6,7,8,9],14:[0,1,10,11,12,13,2,3,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,6,7,8,9],15:[0,1,10,11,12,13,14,2,3,31,32,34,35,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,7,8,9],16:[0,1,10,11,12,2,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,7,8,9],17:[0,1,10,11,12,2,25,27,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,7,8,9],18:[0,1,10,11,12,13,14,2,20,21,22,23,24,29,3,30,31,32,33,34,35,36,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,53,54,55,56,57,58,59,6,60,7,8,9],19:[0,1,10,11,12,13,14,15,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,33,34,35,36,39,4,40,41,42,43,44,45,46,47,48,49,5,50,53,54,55,56,57,58,59,6,60,7,8,9],20:[0,1,10,11,12,13,14,15,16,17,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,33,34,35,38,4,40,41,42,43,44,45,46,47,48,49,5,53,54,55,56,57,58,59,6,60,7,8],21:[0,1,11,12,13,14,16,17,2,21,24,25,26,27,28,29,3,30,31,32,33,34,35,4,40,41,42,43,44,47,48,51,52,53,54,55,56,57,58,59,6,7],22:[0,1,17,18,2,25,26,27,28,29,3,30,31,32,33,4,41,42,43,46,47,48,49,50,51,52,53,54,55,56,57,58,59,6,7],23:[0,1,18,2,26,27,28,29,3,30,31,32,4,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,7,8,9],24:[0,1,18,2,20,27,28,29,3,30,31,4,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],25:[0,1,2,20,28,29,3,30,31,4,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],26:[0,1,10,19,2,28,3,31,32,39,4,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],27:[0,1,10,18,19,2,3,34,35,39,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],28:[0,1,10,11,12,2,3,34,35,36,37,38,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,7,8,9],29:[0,1,10,11,12,13,2,24,3,30,33,34,35,36,37,38,4,46,47,48,5,57,58,6,7,8,9],30:[0,1,10,11,12,13,2,24,29,3,32,33,34,35,36,37,38,39,4,40,45,46,5,50,6,7,8,9],31:[0,1,10,11,12,13,14,2,3,32,33,34,35,36,37,38,39,4,40,41,42,5,6,7,8,9],32:[0,1,10,11,12,13,14,2,20,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,5,6,7,8,9],33:[0,1,10,11,12,13,14,2,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,5,55,56,6,7,8,9],34:[0,1,10,11,12,13,14,2,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,53,54,55,56,6,7,8,9],35:[0,1,10,11,12,13,14,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,52,53,54,55,56,57,6,7,8,9],36:[0,1,10,11,12,13,14,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,53,54,55,56,57,6,7,8,9],37:[0,1,10,11,12,13,14,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,55,56,57,6,7,8,9],38:[0,1,10,11,12,13,14,2,22,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,56,6,7,8,9],39:[0,1,10,11,12,13,14,15,2,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,57,6,7,8,9],40:[0,1,10,11,12,13,14,15,16,2,22,27,28,29,3,30,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,56,57,58,6,7,8,9],41:[0,1,10,11,12,13,14,15,16,2,22,28,29,3,30,31,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,56,57,58,6,7,8,9],42:[0,1,10,11,12,13,14,15,16,2,28,3,30,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,56,57,58,6,7,8,9],43:[0,1,10,11,12,13,14,15,2,28,3,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,52,53,54,57,58,6,7,8,9],44:[0,1,10,11,12,13,14,15,2,21,22,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,53,54,6,7,8,9],45:[0,1,10,11,12,13,14,15,2,20,24,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,56,6,7,8,9],46:[0,1,10,11,12,13,14,15,2,3,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,57,6,7,8,9],47:[0,1,10,11,12,13,14,15,2,3,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,58,6,7,8,9],48:[0,1,10,11,12,13,14,15,16,2,3,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,7,8,9],49:[0,1,10,11,12,13,14,15,16,2,29,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,7,8,9],50:[0,1,10,11,12,13,14,15,16,2,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,6,7,8,9],51:[0,1,10,11,12,13,14,15,16,2,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,6,7,8,9],52:[0,1,10,11,12,13,14,15,16,2,25,26,27,28,3,30,31,32,33,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,6,7,8,9],53:[0,1,10,11,12,13,14,15,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,6,7,8,9],54:[0,1,10,11,12,13,14,15,16,2,25,26,27,28,29,3,30,31,32,33,34,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,6,7,8,9],55:[0,1,10,11,12,13,14,15,16,2,25,26,27,28,29,3,30,31,32,33,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,6,7,8,9],56:[0,1,10,11,12,13,14,15,16,2,24,25,26,27,28,29,3,30,31,33,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,6,7,8,9],57:[0,1,10,11,12,13,14,15,2,23,24,25,26,27,28,29,3,30,31,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,6,7,8,9],58:[0,1,10,11,12,13,14,15,2,23,24,25,26,27,28,29,3,30,31,33,4,40,41,45,46,47,48,49,5,50,51,52,53,6,7,8,9],59:[0,1,10,11,12,13,14,15,2,25,26,27,28,29,3,30,31,32,33,36,4,41,42,43,44,45,46,47,48,49,5,50,53,54,6,7,8,9],60:[0,1,10,11,12,13,14,2,20,26,28,29,3,30,32,33,4,42,43,44,45,46,47,48,49,5,50,6,7,8,9],61:[0,1,11,12,13,14,2,21,22,23,26,27,28,29,3,30,31,32,33,34,35,4,43,44,45,46,47,48,49,8,9],62:[0,1,12,13,2,20,21,22,23,24,25,28,29,3,32,33,34,42,43,45,46,47,48,49,9],63:[0,1,2,21,23,24,25,28,29,30,31,42,46,47,48,49,50]},7:{0:[0,1,100,101,2,53,57,58,74,85,94,95,96,97,98],1:[0,1,100,2,46,55,56,57,58,59,64,85,94,95,96,97],2:[0,1,2,56,57,58,59,6,60,62,63,7,73,85,91,93,94,95,96],3:[0,1,2,5,57,58,59,6,60,7,70,85,86,88,93,95,96],4:[0,1,2,4,5,58,6,73,86,87,90,91,92,93,94,95,97,98],5:[0,1,11,15,16,2,3,4,5,6,60,7,72,86,87,90,91,92,93,94,95,96,97,98,99],6:[0,1,10,11,14,15,16,2,3,4,5,6,60,65,66,7,72,87,88,89,90,91,92,93,94,95,96,97,98,99],7:[0,1,100,14,15,17,18,19,2,3,4,5,56,57,6,60,63,64,65,71,72,87,88,89,90,91,92,93,94,95,96,97,98,99],8:[0,1,10,100,11,16,17,18,19,2,3,4,5,56,6,62,64,7,70,71,87,88,89,9,90,91,92,93,94,95,96,97,98,99],9:[0,1,10,100,11,12,15,16,17,18,19,2,3,4,5,6,7,8,88,89,9,90,91,92,93,94,95,96,97,98,99],10:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,3,4,5,55,57,58,59,6,7,8,89,9,90,91,92,93,94,95,96,97,98,99],11:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,3,4,5,55,58,6,7,8,9,90,91,92,93,94,95,96,97,98,99],12:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,3,4,5,53,57,58,6,7,8,9,90,91,92,93,94,95,96,97,98,99],13:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,3,4,5,56,57,58,6,61,7,8,9,90,91,92,93,94,95,96,97,98,99],14:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,3,4,5,56,57,58,6,60,7,8,89,9,90,91,92,93,94,95,96,97,98],15:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,55,56,57,6,7,8,88,89,9,90,91,92,93,94,95,96,97,98],16:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,55,6,7,8,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],17:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,54,55,6,7,8,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],18:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,55,6,7,8,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],19:[0,1,10,101,102,103,104,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,54,6,7,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],20:[0,1,10,100,101,102,103,104,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],21:[0,1,10,100,101,102,103,104,106,107,108,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,74,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],22:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,6,7,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],23:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,70,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],24:[0,1,10,100,101,102,104,105,106,107,108,109,11,110,111,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],25:[0,1,10,100,101,102,103,105,106,107,108,109,11,110,12,13,14,15,16,17,18,19,2,20,21,22,3,4,5,53,6,67,7,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],26:[0,1,10,100,101,102,103,105,106,107,108,109,11,110,111,112,12,13,14,15,16,17,18,19,2,20,21,22,25,3,4,5,54,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],27:[0,1,10,100,101,102,103,105,106,107,109,11,110,111,112,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],28:[0,1,10,100,101,102,103,104,105,106,107,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],29:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],30:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,69,7,70,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],31:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,29,3,4,5,6,63,64,68,69,7,70,71,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,92,93,94,95,96,97,98,99],32:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,63,68,69,7,70,71,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,9,93,94,95,96,97,98,99],33:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,65,67,68,69,7,71,72,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,9,93,94,95,96,97,98,99],34:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,9,92,93,94,95,96,97,98,99],35:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,51,54,6,60,61,62,63,64,66,67,68,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,96,97,98,99],36:[0,1,10,100,101,102,103,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,14,15,16,17,18,19,2,20,21,22,23,24,25,27,3,4,5,58,59,6,60,61,62,63,64,65,66,67,7,70,71,72,73,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],37:[0,1,10,100,101,102,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,15,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,41,42,43,44,45,46,47,48,49,5,58,59,6,60,61,62,63,64,65,66,67,68,7,70,71,72,73,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],38:[0,1,10,100,101,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,14,15,16,18,2,20,21,22,23,24,25,26,27,28,29,3,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,71,72,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],39:[0,1,10,100,106,107,108,109,11,110,111,114,115,116,117,118,119,12,120,121,14,15,16,17,2,20,21,22,23,24,25,26,27,28,29,3,30,31,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,71,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],40:[0,1,10,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,2,21,22,23,24,25,26,27,28,29,3,30,31,32,39,4,40,41,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,76,8,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],41:[0,1,10,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,2,21,22,23,24,25,26,27,28,29,3,30,31,32,33,34,4,40,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,76,8,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],42:[0,1,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,13,14,15,2,22,23,24,25,26,27,28,29,3,32,33,34,35,4,42,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,8,81,82,83,84,85,86,87,88,89,9,95,96],43:[0,1,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,2,3,33,34,35,4,42,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,8,82,83,84,85,86,87],44:[0,1,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,13,14,2,3,34,36,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,8,82,83,84,85,86,9,95,96,97,98,99],45:[0,1,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,13,14,15,2,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,7,8,82,83,9,93,94,95,96,97,98,99],46:[0,1,10,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,2,3,4,5,52,53,54,55,56,57,58,59,6,60,61,62,63,64,7,8,9,91,92,93,94,95,96,97,98,99],47:[0,1,10,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,13,14,15,16,17,18,2,3,36,4,5,54,55,56,57,58,59,6,60,61,62,63,7,8,9,90,91,92,93,94,95,96,97,98,99],48:[0,1,10,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,13,14,15,16,17,18,2,3,36,4,5,55,56,57,58,59,6,60,61,62,63,7,8,9,90,91,92,93,94,95,96,97,98,99],49:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,2,3,4,41,5,55,56,57,58,59,6,60,61,62,63,7,8,9,92,93,94,95,96,97,98,99],50:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,15,2,3,4,40,41,5,57,58,59,6,60,61,62,7,8,9,95,96,97,98,99],51:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,15,16,17,18,19,2,3,4,40,41,5,6,60,61,62,7,8,9,95,96,97,98,99],52:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,14,15,16,17,18,19,2,3,4,5,6,62,7,79,8,9,96,97,98,99],53:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,14,15,16,17,18,19,2,20,3,39,4,5,56,6,64,7,78,8,9,97,98,99],54:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,14,15,16,17,18,19,2,20,21,3,37,38,39,4,5,6,7,70,78,79,8,9,97,98,99],55:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,14,15,16,17,18,19,2,20,21,3,4,5,6,69,7,70,78,8,9,93,94,95,98,99],56:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,8,9,93,94,95,99],57:[0,1,10,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,6,69,7,71,72,74,76,8,9,93,94,95,96],58:[0,1,10,11,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,61,67,68,69,7,70,71,72,73,74,75,76,8,9,93,94,95,96],59:[0,1,10,11,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,49,5,6,66,67,68,69,7,70,71,72,73,74,8,9,94,95],60:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,48,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,78,79,8,80,81,9],61:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,5,58,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,9,91,92],62:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,83,9],63:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,9],64:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,9],65:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,40,5,6,63,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,89,9,90,91,92],66:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93],67:[0,1,10,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94],68:[0,1,10,108,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],69:[0,1,10,107,108,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],70:[0,1,10,104,107,108,109,11,110,111,112,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],71:[0,1,10,100,108,109,11,110,111,112,113,114,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],72:[0,1,10,100,107,108,109,11,110,112,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],73:[0,1,10,100,107,11,110,111,112,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],74:[0,1,10,100,11,111,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],75:[0,1,10,11,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],76:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],77:[0,1,10,11,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,45,5,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],78:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],79:[0,1,10,11,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,54,55,56,57,58,59,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],80:[0,1,10,11,113,114,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,54,55,56,57,58,59,6,60,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],81:[0,1,10,11,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,45,5,55,56,57,58,59,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],82:[0,1,10,100,101,102,103,11,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,45,5,6,61,62,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],83:[0,1,10,100,101,102,103,104,105,11,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,56,58,6,61,62,68,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],84:[0,1,10,100,102,103,104,105,106,11,113,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,56,6,60,61,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],85:[0,1,10,104,105,106,107,11,113,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],86:[0,1,10,105,106,107,11,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,56,6,7,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],87:[0,1,10,100,106,107,108,11,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,7,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],88:[0,1,10,100,101,102,103,107,108,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,43,44,5,6,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],89:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,43,5,6,61,62,63,64,65,66,67,68,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],90:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,41,5,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],91:[0,1,10,100,101,102,103,11,112,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,49,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],92:[0,1,10,100,101,102,103,104,105,106,11,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],93:[0,1,10,100,101,102,103,104,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,66,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],94:[0,1,10,100,101,102,103,104,105,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],95:[0,1,10,100,101,102,103,104,105,106,108,11,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],96:[0,1,10,100,101,102,103,104,105,106,109,11,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,67,68,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],97:[0,1,10,100,101,102,103,104,105,106,107,108,11,110,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],98:[0,1,10,100,101,102,103,104,105,106,107,108,11,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,59,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],99:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],100:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],101:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,60,61,62,63,64,65,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],102:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,61,62,63,64,65,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],103:[0,1,10,100,101,102,103,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,61,62,63,64,65,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],104:[0,1,10,100,101,102,103,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,50,51,52,53,54,55,56,6,60,61,62,63,64,65,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],105:[0,1,10,100,101,102,103,104,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,50,51,52,53,54,55,56,6,60,61,62,63,64,65,66,67,7,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],106:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,50,51,52,53,54,55,56,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],107:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],108:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,72,73,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],109:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,73,74,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],110:[0,1,10,100,101,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,7,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],111:[0,1,10,100,101,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,76,77,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],112:[0,1,10,100,101,103,104,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,7,76,77,78,8,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],113:[0,1,10,100,101,102,103,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,49,5,50,51,52,53,54,55,56,57,58,6,60,61,62,63,67,7,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],114:[0,1,10,100,101,102,103,104,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,7,72,73,74,77,78,79,8,80,81,82,83,84,85,86,87,89,9,90,91,92,93,94,95,96,97,98,99],115:[0,1,10,100,101,102,103,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,68,69,7,70,71,8,80,81,82,83,84,85,9,90,91,92,93,94,95,96,97,98,99],116:[0,1,10,100,101,102,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,60,61,62,63,7,8,81,82,9,90,91,92,93,94,95,96,97,98,99],117:[0,1,10,100,101,104,105,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,49,5,50,51,52,53,54,55,56,57,58,6,60,61,62,63,66,67,7,8,82,9,90,91,92,93,94,95,96,97,98,99],118:[0,1,10,100,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,51,52,53,54,55,56,59,6,60,62,63,65,66,7,72,8,82,83,84,9,90,91,92,93,94,95,96,97,98,99],119:[0,1,10,100,108,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,55,56,6,60,61,62,66,7,8,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],120:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,40,5,52,56,57,59,6,60,61,66,7,8,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],121:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,59,6,60,61,65,7,8,87,88,89,9,90,91,92,93,94,95,96,97,98,99],122:[0,1,16,17,18,19,2,23,24,25,26,27,28,3,4,42,5,56,6,60,68,7,8,87,88,89,9,90,91,92,93,94,95,96,97,98,99],123:[0,1,16,17,18,19,2,24,25,26,27,28,3,4,42,43,44,45,46,5,53,55,56,57,58,59,6,60,63,65,66,67,7,70,8,87,90,91,92,93,94,95,96,97,98,99],124:[0,1,18,19,2,24,25,26,27,3,4,41,42,45,46,47,5,56,57,59,6,65,66,67,69,90,91,92,93,94,95,96,97,98,99],125:[0,1,2,3,4,46,47,48,49,5,50,64,65,66,85,86,91,92,93,94,95,96,97,98,99],126:[0,1,2,3,4,47,48,49,50,56,57,59,61,63,85,92,93,94,95,96,97,98,99],127:[0,1,100,101,2,3,43,48,49,57,58,60,61,85,92,93,94,95,96,97,98]}};

tiles.uk_mask_regex = /uk_mask\/([0-9]+)\/([0-9]+)\/([0-9]+)\.png$/;
tiles.world_regex = /world\/([0-9]+)\/([0-9]+)\/([0-9]+)\.png$/;

module.exports = tiles;
},{}],26:[function(require,module,exports){
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


},{"./anim_loop":3,"./cursor":9,"./data":10,"./dom":11,"./draw":12,"./geom":16,"./map":18,"./mouse":19,"./timeline_model":27}],27:[function(require,module,exports){
var model = {};

model.year_min = 1988
model.year_max = 1998
model.months_total = (model.year_max - model.year_min) * 12
model.months_range = d3.range(model.months_total) // 0 - months_total-1
// map mouse co-ords to months scale. 
// input domain for d3 scale is set in resize fn.
model.months_scale = d3.scale.quantize().range(model.months_range)
// initial date
model.step = (model.months_total/2) |0;
model.mouseover = false
model.dirty = true;
model.resize = true;

module.exports = model;
},{}],28:[function(require,module,exports){
var domq = require('./dom').q;

var metrics = require('./text_metrics');

var tau = Math.PI*2;

var title = 'We Raved Here';
var css_props = {font: '16px MaisonNeue', letterSpacing: '5px'};
var window_edge_pad = 10;

var dom = {};

var text_title = {};

text_title.init = function(){

  dom.canvas = domq('#text-title');
  dom.ctx = dom.canvas.getContext('2d');

  var text_wh = metrics.text_wh_dom(title, css_props);
  var xs = metrics.char_xs(title, css_props, parseInt(css_props.letterSpacing));

  var underline_w = 1;
  var underline_pad = 1;

  var w = dom.canvas.width = text_wh.h + 4;
  var h = dom.canvas.height = text_wh.w + 2;

  // console.log({w: xs[xs.length-1], h: wh.h});

  dom.ctx.font = css_props.font;

  // draw text rotated
  dom.ctx.translate(w + underline_w + underline_pad, 0);
  dom.ctx.rotate(tau * 0.25);
  // dom.ctx.translate(wh.h, 0);

  dom.ctx.fillRect(0, w, h, 1);

  // dom.ctx.drawImage(dom.canvas, 0,0);

  // dom.ctx

  for(var i=0, l=xs.length-1; i<l; i++)
      dom.ctx.fillText(title.substr(i,1), xs[i], text_wh.h);



  


  // place attached to center of tr, br
  // center of right side attached to 



  // var wh = text_metrics(title, {
  //   fontSize: '16px',
  //   fontFamily: 'MaisonNeue',
  //   textDecoration: 'underline',
  //   letterSpacing: '5px'
  // });

  window.addEventListener('resize', text_title.render);

  text_title.render();

};

text_title.render = function(){
  var s = dom.canvas.style;

  // hide on small screens
  if (window.innerHeight < dom.canvas.height + 150) {
    dom.canvas.style.display = 'none'
    return;
  } else {
    dom.canvas.style.display = 'block'
  }

  s.top = (window.innerHeight / 2) - (dom.canvas.height / 2) /*+ 20*/ + 'px';
  s.left = window.innerWidth - (dom.canvas.width * 1) - window_edge_pad + 'px';
}

module.exports = text_title;
},{"./dom":11,"./text_metrics":24}],29:[function(require,module,exports){

// var m = require('./mouse');

var touches = {};

                // the mouse state always exists 
touches.state = {mouse: {down: false}};

var down_and_up_fns = [];

var mousemove_fns = [];

touches.down_and_up = function(opts){
  down_and_up_fns.push(opts);
  if ('mousemove' in opts)
    mousemove_fns.push(opts)
};




var handle_touches_down = function(ts, original_event){
  var time = Date.now();
  for (var i=0, t; t=ts[i]; i++){
    var state = 
        touches.state[t.identifier] = 
        {down: true, 
         down_timestamp: time,
         x_down: t.clientX,
         y_down: t.clientY};

    for (var j=0, fns; fns=down_and_up_fns[j]; j++){
      if (fns.bounds_check_down && 
          fns.bounds_check_down(t.clientX, t.clientY, original_event, state))
            state.fns = fns;
    }

  }  
};

var touchstart = function(e){
  if (!('changedTouches' in e)) return;
  handle_touches_down(e.changedTouches, e)
};

var mousedown = function(e){
  // console.log('foo')
  // console.log(e.clientX, e.clientY)
  e.identifier = 'mouse'
  handle_touches_down([e], e)
};




var handle_touches_up = function(ts, original_event){
  for (var i=0, t; t=ts[i]; i++){
    if (t.identifier in touches.state && touches.state[t.identifier].fns){
      var state = touches.state[t.identifier]
        , fns = state.fns;

      if (fns.up){
        if (fns.bounds_check_up){
          if (fns.bounds_check_up(t.clientX, t.clientY, original_event, state))
              fns.up(t.clientX, t.clientY, original_event, state)
        } else fns.up(t.clientX, t.clientY, original_event, state)
      }

    }

    if (t.identifier === 'mouse'){
      touches.state.mouse.down = false;
      touches.state.mouse.x_down = -1;
      touches.state.mouse.y_down = -1;
      touches.state.mouse.down_timestamp = 0;
    } else delete touches.state[t.identifier];

  }  
};

var touchend = function(e){
  if (!('changedTouches' in e)) return;
  handle_touches_up(e.changedTouches, e)
};

var mouseup = function(e){
  // console.log(e.clientX, e.clientY)
  e.identifier = 'mouse'
  handle_touches_up([e], e)
};

// down_and_up_fns

var handle_touches_move = function(ts, original_event){

  for (var i=0, t; t=ts[i]; i++){

    if (t.identifier in touches.state){

      var state = touches.state[t.identifier];

      if (state.down && state.fns && state.fns.move_while_down)
          state.fns.move_while_down(t.clientX, t.clientY, original_event, state);

      // } else if (state.fns && state.fns.bounds_check_move && state.fns.move_while_over &&
      //            state.fns.bounds_check_move(t.clientX, t.clientY, original_event, state)){
      //   console.log('foo')

      //   state.fns.move_while_over(t.clientX, t.clientY, original_event, state)
      // } else { console.log("stuff") }

    }

  }

};


var touchmove = function(e){
  if (!('changedTouches' in e)) return;
  handle_touches_move(e.changedTouches, e)
};

var mousemove = function(e){
  // console.log('foo')
  // console.log(e.clientX, e.clientY)

  if (!touches.state.mouse.down)
    for (var i=0, fns; fns=mousemove_fns[i]; i++)
      fns.mousemove(e.clientX, e.clientY, e, touches.state.mouse);

  e.identifier = 'mouse'
  handle_touches_move([e], e)
};











var loop = function(){

  for (var key in touches.state){
    var state = touches.state[key];
    if (state.down && state.fns && state.fns.anim_while_down) state.fns.anim_while_down(-1,-1, null, state)
  }

  requestAnimationFrame(loop);

};





document.addEventListener('mousedown', mousedown);
document.addEventListener('mouseup', mouseup);
document.addEventListener('mousemove', mousemove);

document.addEventListener("touchstart", touchstart);
document.addEventListener("touchend", touchend);
document.addEventListener("touchmove", touchmove);


touches.init = function(){
  requestAnimationFrame(loop);
}





/*

var onscroll = function(e){
  
  lastScroll = window.scrollY


  if (scheduleAnim) return;

  scheduleAnim = true;
  requestAnimFrame(updatePage)

}

window.addEVentListener('scroll', onscroll, false)

*/

module.exports = touches;
},{}],30:[function(require,module,exports){
var url = {};

url.init = function(){
  var u = url.parse(document.location);
  if (u.host === 'ravemaps.local'){
    url.proxify = url.proxify_corsify;
    url.tile_server = 'http://tiles.ravemaps.local/'
  } else {
    url.proxify = url.proxify_phanes;
    url.tile_server = 'http://198.199.72.134/ravemaps/'
  }
};


url.proxify_phanes = function(u){
  u = "http://198.199.72.134/cors/"+ u.replace(/^https?:\/\//, "");
  return u;
};

url.proxify_corsify = function(u){
  return "http://corsify.appspot.com/" + u;
}

// parseUri 1.2.2
// http://blog.stevenlevithan.com/archives/parseuri
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
url.parse = function(str) {
  var o   = url.parse.options,
    m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i   = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
};

url.parse.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

module.exports = url;
},{}],31:[function(require,module,exports){
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
},{"./anim_loop":3,"./cursor":9,"./dom":11,"./draw":12,"./geom":16,"./map":18,"./mouse":19,"./touches":29,"./zoom_model":32}],32:[function(require,module,exports){
var map = require('./map');

var model = {};

model.init = function(){
  model.min = map.leaflet.getMinZoom()
  model.max = map.leaflet.getMaxZoom()
  model.step = map.leaflet.getZoom()

  model.mouseover = false;
  model.dirty = true;
  model.resize = true;

  model.range = d3.range(model.max, model.min-1, -1);
  model.scale = d3.scale.quantize().range(model.range) 

};

module.exports = model;
},{"./map":18}]},{},[17])
;