;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var domq = require('./dom').q;
var popup = require('./popup');
var pattern = require('./pattern');
var loop = require('./anim_loop');
var url = require('./url');

var about = {};

var open = false;
// var popup_content

var dom = {};
var fillStyle = '#000';

about.init = function(){

  popup.list.about = about;

  var link = domq('#link-about');
  var el = dom.el = domq('#popup-about');
  var el_tail = dom.el_tail = domq('#popup-about canvas');
  el_tail.width = 400
  el_tail.height = 50

  fillStyle = (url.parsed.queryKey.bg === 'chris') ? '#fff' : '#000';
  link.style.color = fillStyle
  

  dom.tail_ctx = dom.el_tail.getContext('2d');

  //el_tail_ctx.globalCompositeOperation = 'source-atop';
  
  // el_tail_ctx.fillStyle = '#f00'
  // el_tail_ctx.fillRect(0,0, el_tail.width,el_tail.height)



  link.addEventListener('click', function(){
    if (open) about.close()
    else about.open()
  });

  loop.fns_render.push(about.anim)
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
},{"./anim_loop":3,"./dom":14,"./pattern":26,"./popup":34,"./url":43}],2:[function(require,module,exports){
var domq = require('./dom').q;
var domqs = require('./dom').qs;
var popup = require('./popup');
var pattern = require('./pattern');
var loop = require('./anim_loop');
var text_metrics = require('./text_metrics');
var popup = require('./popup');
var geocode = require('./geocode');
var map = require('./map');
var pin = require('./pin');
var url = require('./url');

var add = {};

var open = false;
// var popup_content
var fillStyle = '#000';

var dom = {};

var input_location_value = ''
  , input_location_timeout = 500
  , input_location_timer = -1

var input_location_set_latlng = function(lat, lng){
  dom.input_location_lat.value = lat;
  dom.input_location_lng.value = lng;  

  if (!(map.leaflet.getBounds().contains([lat, lng])))
    map.leaflet.panTo([lat, lng], {animate: true});

  pin.geocode_place(lat, lng)

}

var input_location_changed = function(){
  var input_location_value_new = dom.input_location.value.trim();

  if (input_location_value_new === ''){
    clearTimeout(input_location_timer);
  } else if (input_location_value_new !== input_location_value) {
    clearTimeout(input_location_timer);
    input_location_timer = setTimeout(input_location_geocode, input_location_timeout)
  }

  input_location_value = input_location_value_new

};

var input_location_geocode = function(){
  geocode.from_address(dom.input_location.value, input_location_geocode_results);
}

var input_location_geocode_results = function(results){
  var loc = results[0].geometry.location

  input_location_set_latlng(loc.lat(), loc.lng());

  // console.log(results)
};

var input_location_reverse_geocode_results = function(results){
  var loc = results[0].geometry.location
  input_location_value = dom.input_location.value = results[0].formatted_address;
  input_location_set_latlng(loc.lat(), loc.lng());
};

add.init = function(){

  popup.list.add = add;

  var link = domq('#link-add');
  var el = dom.el = domq('#popup-add');
  dom.el_form = domq('#popup-add form');
  dom.el_form.addEventListener('submit', function(e){ e.preventDefault(); })

  var el_tail = dom.el_tail = domq('#popup-add canvas');
  el_tail.width = 400
  el_tail.height = 50

  fillStyle = (url.parsed.queryKey.bg === 'chris') ? '#fff' : '#000';
  link.style.color = fillStyle

  dom.tail_ctx = dom.el_tail.getContext('2d');

  //el_tail_ctx.globalCompositeOperation = 'source-atop';
  
  // el_tail_ctx.fillStyle = '#f00'
  // el_tail_ctx.fillRect(0,0, el_tail.width,el_tail.height)

  // size inputs to popup
  var labels = domqs('#popup-add label');
  var inputs = domqs('#popup-add input');
  dom.input_location = domq('#in-location');
  dom.input_location_lat = domq('#in-location-lat');
  dom.input_location_lng = domq('#in-location-lng');

  var css_props = {
    fontFamily: 'MaisonNeue',
    fontSize: '14px'
  };

  // resize inputs to fit popup width
  for (var i=0, l=labels.length; i<l; i++){
    var label = labels[i];
    var input = inputs[i];
    var text_size = text_metrics.text_wh_dom(label.innerHTML, css_props)
    var width = popup.width - text_size.w - 30; //padding

    input.style.width = width + 'px';
  }

  // set up geocoding, use throttling
  dom.input_location.addEventListener('input', input_location_changed);

  link.addEventListener('click', function(){
    if (open) add.close()
    else add.open()
  });

  // get rid of this hack
  pin.geocode_fn = input_location_reverse_geocode_results;

  loop.fns_render.push(add.anim)
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

  if (dom.input_location.value) pin.geocode_place(parseFloat(dom.input_location_lat), parseFloat(dom.input_location_lng))
}

add.close = function(){
  domq('#popup-add').style.display = 'none'

  pin.geocode_remove();

  open = false
}

module.exports = add;
},{"./anim_loop":3,"./dom":14,"./geocode":19,"./map":22,"./pattern":26,"./pin":27,"./popup":34,"./text_metrics":37,"./url":43}],3:[function(require,module,exports){
// the main loop that handles every other animation loop
// the reason for doing it that way is that all of the 
// animation loops can be timed and turned off etc without instrumenting each one individually

require('./anim_shim');
var url = require('./url');

var anim = {};

var anim_id = -1
  , frame_num = 0
  , fns_render = anim.fns_render = []
  , fns_update = anim.fns_update = []

anim.frame_skip = 0;

anim.init = function(){
  if ('stats' in url.parsed.queryKey){
    var s = anim.stats = new Stats();
    s.domElement.style.position = 'absolute';
    s.domElement.style.left = '0px';
    s.domElement.style.top = '0px';
    document.body.appendChild( s.domElement );
    loop = loop_with_stats;
  }
  anim.start();
}

anim.start = function(){
  if (anim_id === -1)
    anim_id = requestAnimationFrame(loop);
}

anim.stop = function(){
  cancelAnimationFrame(anim_id)
  anim_id = -1;
};

var loop_without_stats = function(){
  anim_id = requestAnimationFrame(loop_without_stats);

  for (var i=0, fn; fn=fns_update[i]; i++)
    fn();
  for (var i=0, fn; fn=fns_render[i]; i++)
    fn();

  // for (var i=0, fn; fn=fns[i]; i++)
  //   fn();

};

var loop_with_stats = function(){
  anim_id = requestAnimationFrame(loop_with_stats);

  anim.stats.begin();

  //if (anim.frame_skip > 0){
  //  frame_num += 1;
  //  if (frame_num < anim.frame_skip)
  //    return
  //  else
  //    frame_num = 0;
  //}

  for (var i=0, fn; fn=fns_update[i]; i++)
    fn();
  for (var i=0, fn; fn=fns_render[i]; i++)
    fn();

  // for (var i=0, fn; fn=fns[i]; i++)
  //   fn();

  anim.stats.end();
};

var loop = loop_without_stats;

module.exports = anim;
},{"./anim_shim":5,"./url":43}],4:[function(require,module,exports){
var url = require('./url');
var css = require('./css');
var map = require('./map');
var lerp = require('./math').lerp;
var benchmark = require('./benchmark')();
var loop = require('./anim_loop')
var domqs = require('./dom').qs;

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
  loop.fns_render.push(anim.loop);
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

  // OLD WAY: without zoom
//  var visible_layer = document.querySelectorAll('.leaflet-layer')[0];

  // NEW WAY: zoom
  
  // find opaque leaflet-layer
//  var layers_leaflet = domqs('.leaflet-layer');
//  for (var i=0, layer; layer=layers_leaflet[i]; i++)
//    if (layer.style.opacity === "0") console.log("yeah")

// Bezier.cubicBezier(0,0,0.25,1,,250)

  var css_scale = 1
  var css_scale_rev = 1

  var offset_anim_x = 0;
  var offset_anim_y = 0;

  var map_is_animating_zoom = map.leaflet._pathZooming || map.leaflet._animatingZoom //map.leaflet._pathZooming;

  if (map_is_animating_zoom) { //console.log("zoom")

    //this._zoom_anim_start = Date.now();
    //this._zoom_anim_scale = scale;
    //Bezier.cubicBezier(0,0,0.25,1,0.5,250)

    // replicate css easing calculation (see ".leaflet-zoom-anim .leaflet-zoom-animated" in css)
    // so that we can determine exact size and position of tiles being zoomed by css
    // so the canvas animation mask animates while zooming to match the rest of the map,
    // making it less jumpy, but its still kinda cut off because of the way leaflet handles tile layers...
    // this is a major fucking pain in the ass
    var css_transition_ms = 100 // (see ".leaflet-zoom-anim .leaflet-zoom-animated" in leaflet_edit.css)
    var elapsed_ms = Date.now() - map.leaflet._zoom_anim_start
    var x_point_in_bezier = elapsed_ms / css_transition_ms
    if (x_point_in_bezier > 1) x_point_in_bezier = 1
    var bezier_value = Bezier.cubicBezier(0,0,0.25,1, x_point_in_bezier, css_transition_ms)
    var css_scale = lerp(1, map.leaflet._zoom_anim_scale, bezier_value)

    // console.log(bezier_value, css_scale, offset_anim_x, offset_anim_y)
  
  var layers_mask_container = map.layer_uk_mask._container;
    for (var i=0, layer_mask; layer_mask=layers_mask_container.children[i]; i++){
      if (layer_mask.style.visibility === 'hidden') continue;
      // var first_tile = layer_mask.children[0]
      // if (first_tile && first_tile.src.match("/"+zoom_level+"/[0-9]+/[0-9]+\.png")){
      //   var visible_layer = layer_mask; break;
      // }

    //  var tile_transform = css.get_transform(layer_mask);
    //  if (tile_transform) console.log(tile_transform)

      //if (layer_mask.style.visibility === 'hidden') continue;

      var visible_layer = layer_mask;
      var offset_coords_2 = css.get_transform_translate_coords(visible_layer)
      var offset_anim_x = lerp(0, offset_coords_2[0], bezier_value)
      var offset_anim_y = lerp(0, offset_coords_2[1], bezier_value) 
    }



    // console.log(visible_layer)

  } else {
    var zoom_level = map.leaflet.getZoom();
    // the tile container WITHOUT a transform is the visible one that is the current map tileset
    var layers_mask_container = map.layer_uk_mask._container;
    for (var i=0, layer_mask; layer_mask=layers_mask_container.children[i]; i++){
      if (css.get_transform(layer_mask) || layer_mask.children.length === 0) { /*console.log(css.get_transform(layer_mask));*/ continue; }
      else { var visible_layer = layer_mask; break; }
      // if (layer_mask.children.length && layer_mask.children[0].src.match("/"+zoom_level+"/[0-9]+/[0-9]+\.png")){
      //   var visible_layer = layer_mask; break;
      // }
    } 
  }

  // if (typeof visible_layer === 'undefinied') return;

  // look at first tile of each container
  
//  var visible_layer = map.layer_uk_mask._tileContainer
//  console.log(map.layer_uk_mask._container.children.length)




//  var tile_layers = domqs('.leaflet-layer .leaflet-tile-container');
//  console.log(tile_layers)
//  for (var i=0, l=tile_layers.length; i<l; i++) { var tile_layer = tile_layers[i]
//    console.log(tile_layer.style.opacity, css.get_transform(tile_layer))
//  }

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

  if (map_state !== map_state_new || map_is_animating_zoom){
    dom.ctx_mask.clearRect(0,0, dom.canvas_mask.width,dom.canvas_mask.height)

    // find visible tiles in layer
    for (var i=0, tile; tile=visible_layer.children[i]; i++){
      if (!tile.src || !tile.complete) continue;

      benchmark.start('get-dom');
      // calculating tile coords from images in the dom
      if (tile.style.left){ // node using top/left css
        var tile_l_o = parseInt(tile.style.left);
        var tile_t_o = parseInt(tile.style.top);
      } else { // node using transform css
        var tile_xy = css.get_transform_translate_coords(tile)
        var tile_l_o = tile_xy[0];
        var tile_t_o = tile_xy[1];
      }
      var tile_l = tile_l_o + map_pane_xy[0];
      var tile_t = tile_t_o + map_pane_xy[1];
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
// todo: use this if not zooming

  

//      dom.ctx_mask.drawImage(tile, x_tile,y_tile,w_tmp,h_tmp,
//                                  tile_l+x_tile, tile_t+y_tile, w_tmp, h_tmp);

      if (map_is_animating_zoom){
// this nasty equation takes into consideration the css eased translate3d/scale of the tiles
        dom.ctx_mask.drawImage(tile, x_tile,y_tile,w_tmp,h_tmp,
                                  tile_l_o*css_scale+x_tile*css_scale+offset_anim_x+ map_pane_xy[0],
                                  tile_t_o*css_scale+y_tile*css_scale+offset_anim_y+ map_pane_xy[1],
                                  w_tmp*css_scale,
                                  h_tmp*css_scale);

      } else
        dom.ctx_mask.drawImage(tile, x_tile,y_tile,w_tmp,h_tmp,
                                  tile_l+x_tile, tile_t+y_tile, w_tmp, h_tmp);        


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
},{"./anim_loop":3,"./benchmark":10,"./css":11,"./dom":14,"./map":22,"./math":24,"./url":43}],5:[function(require,module,exports){
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                               || window[vendors[x]+'CancelRequestAnimationFrame'];
};
},{}],6:[function(require,module,exports){
// two audio engines... 
// prefer html5 mp3 playing, but this doesnt seem to work in firefox, so fallback to flash


var engines = {};

engines.html5 = require('./audio_html5')
engines.flash = require('./audio_flash')

// var audio_html5_mp3_test = require('./audio_html5_mp3_test');

var audio = {};
var ts = audio.tracks = {};

audio.init = function(){

  for (var key in engines){ var e = engines[key];
    if (e.test()){
      audio.engine = e;
      e.init({attach_fns_to: audio})
      break;
    }
  }

};




/*

 var html5Driver = function() {
      var player = new Audio(),
          onTimeUpdate = function(event){
            var obj = event.target,
                buffer = ((obj.buffered.length && obj.buffered.end(0)) / obj.duration) * 100;
            // ipad has no progress events implemented yet
            callbacks.onBuffer(buffer);
            // anounce if it's finished for the clients without 'ended' events implementation
            if (obj.currentTime === obj.duration) { callbacks.onEnd(); }
          },
          onProgress = function(event) {
            var obj = event.target,
                buffer = ((obj.buffered.length && obj.buffered.end(0)) / obj.duration) * 100;
            callbacks.onBuffer(buffer);
          };

      $('<div class="sc-player-engine-container"></div>').appendTo(document.body).append(player);

      // prepare the listeners
      player.addEventListener('play', callbacks.onPlay, false);
      player.addEventListener('pause', callbacks.onPause, false);
      // handled in the onTimeUpdate for now untill all the browsers support 'ended' event
      // player.addEventListener('ended', callbacks.onEnd, false);
      player.addEventListener('timeupdate', onTimeUpdate, false);
      player.addEventListener('progress', onProgress, false);


      return {
        load: function(track, apiKey) {
          player.pause();
          player.src = track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
          player.load();
          player.play();
        },
        play: function() {
          player.play();
        },
        pause: function() {
          player.pause();
        },
        stop: function(){
          if (player.currentTime) {
            player.currentTime = 0;
            player.pause();
          }
        },
        seek: function(relative){
          player.currentTime = player.duration * relative;
          player.play();
        },
        getDuration: function() {
          return player.duration * 1000;
        },
        getPosition: function() {
          return player.currentTime * 1000;
        },
        setVolume: function(val) {
          player.volume = val / 100;
        }
      };
*/

module.exports = audio;
},{"./audio_flash":7,"./audio_html5":8}],7:[function(require,module,exports){
// this is pretty tied into the soundmanager2 player that the soundcloud sdk automatically loads, unfortuneately

var text2el = require('./dom').text2el;
var p, audio;
// a = SC.stream("https://api.soundcloud.com/tracks/89408819?consumer_key=htuiRd1JP11Ww0X72T1C3g")
// a.play()

var audio_flash = {};

var secureDocument = false;

var play = function(){
  p.play()
};
var pause = function(){
  p.pause()
};
var stop = function(){
  p.stop()
  p.unload()
};
var load_and_play = function(url){
  console.log(url)
  SC.stream(url, function(sound_manager_obj){ 
    // console.log("foo")
    audio.player = p = sound_manager_obj
    p.play();
  })
};
var load = function(url){
  console.log(url)
  SC.stream(url, function(sound_manager_obj){ audio.player = p = sound_manager_obj })
};
var seek = function(){
  // p.setPosition()
};



var interface = {
  play: play,
  pause: pause,
  stop: stop,
  load: load,
  load_and_play: load_and_play,
  seek: seek
}


audio_flash.test = function(){
  return true;
}

audio_flash.init = function(opts){
  opts = opts || {};
  audio = opts.attach_fns_to || {}


  for (var name in interface){
    audio[name] = interface[name];
  }

  // var id = 'soundcloud-flash-player'
  // var domain = 'soundcloud.com'
  // var url = ''
  // var url_swf = (secureDocument ? 'https' : 'http') + '://player.' + domain +'/player.swf?url=' + url +'&amp;enable_api=true&amp;player_type=engine&amp;object_id=' + id;

  // if (false /*$.browser && $.browser.msie*/) { // timb edit
  //   var html = '<object zheight="100%" zwidth="100%" id="' + id + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" data="' + swf + '">'+
  //     '<param name="movie" value="' + url_swf + '" />'+
  //     '<param name="allowscriptaccess" value="always" />'+
  //     '</object>';
  // } else {
  //   var html = '<object zheight="100%" zwidth="100%" id="' + id + '">'+
  //     '<embed allowscriptaccess="always" height="100%" width="100%" src="' + url_swf + '" type="application/x-shockwave-flash" name="' + id + '" />'+
  //     '</object>';
  // }

  // p = audio.player = text2el(html)

  // document.body.appendChild(p)

  //p = audio.player = 

  return audio;
}

module.exports = audio_flash;
},{"./dom":14}],8:[function(require,module,exports){

var audio_html5 = {};
var p;









audio_html5.test = function(){
  var state = false;
  try{
    var a = new Audio();
    state = a.canPlayType && (/maybe|probably/).test(a.canPlayType('audio/mpeg'));
    // uncomment the following line, if you want to enable the html5 audio only on mobile devices
    // state = state && (/iPad|iphone|mobile|pre\//i).test(navigator.userAgent);
  }catch(e){
    // there's no audio support here sadly
  }
  // AA = a
  // console.log(a, a.canPlayType('audio/mpeg'))
  return state;  
  // return true;
}

var play = function(){ p.play() };

var pause = function(){ p.pause() };

var stop = function(){
  if (p.currentTime) {
    p.currentTime = 0;
  }
  p.pause()
};

var load_and_play = function(url){
  console.log("load", url)
  p.pause();
  // player.src = track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
  p.src = url;
  p.load();
  p.play();  
};

var load = function(url){
  console.log("load", url)
  p.pause();
  // player.src = track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
  p.src = url;
  p.load();
  // player.play();  
};

var seek = function(relative){
  p.currentTime = p.duration * relative;
  p.play()
};

var interface = {
  play: play,
  pause: pause,
  stop: stop,
  load: load,
  load_and_play: load_and_play,
  seek: seek
}

audio_html5.init = function(opts){
  opts = opts || {};
  var audio = opts.attach_fns_to || {}

  p = audio.player = new Audio()
  document.body.appendChild(p)

  for (var name in interface){
    audio[name] = interface[name];
  }

  return audio;
};


// audio.play = function(){

// }

// audio.pause = function(){

// }

// audio.stop = function(){
  
// }

// audio.seek = function(){
  
// }


module.exports = audio_html5;
},{}],9:[function(require,module,exports){
var domq = require('./dom').q;
var loop = require('./anim_loop');
var url = require('./url');

var background = {};

var dom = {};

background.init = function(){
  dom.el = domq("#background");

  var q = url.parsed.queryKey

  if (q.bg === 'anim') background.fn = background.as_anim
  // if (q.bg === 'checkers') background.fn = background.as_gif
  else if (q.bg === 'chris') background.fn = background.as_chris
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

  loop.fns_render.push(window.loop_chris_bg);
}

background.as_anim = function(){
  var c = document.createElement('canvas');
  c.width = window.innerWidth
  c.height = window.innerHeight
  dom.el.appendChild(c)
  dom.ctx = c.getContext('2d');

  loop.fns_render.push(background.anim_render);
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
  dom.el.style.backgroundImage = "url(img/bg/checkers-light.gif)";
}




module.exports = background;
},{"./anim_loop":3,"./dom":14,"./url":43}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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

css.get_transform_translate_coords_regex = /translate3?d?\(([0-9\-\.]*)p?x?, ([0-9\-\.]*)p?x?/;
css.get_transform_translate_coords = function(layer){
  var transform = css.get_transform(layer);
  var matches = transform.match(css.get_transform_translate_coords_regex)
  if (matches.length !== 3) return [0,0];
  return [parseFloat(matches[1]), parseFloat(matches[2])]
};

css.set = function(el, css_props){
  var s = el.style
  for (var key in css_props)
    s[key] = css_props[key];
}

// todo: use el.classList instead...

css.has_class = function (el, class_name) {
    return new RegExp(' ' + class_name + ' ').test(' ' + el.className + ' ');
};


css.add_class = function (el, class_name) {
    if (!(css.has_class(el, class_name))) {
        el.className += ' ' + class_name;
    }
};

css.rm_class = function (el, class_name) {
    var class_name_normalized = ' ' + el.className.replace(/[\t\r\n]/g, ' ') + ' '
    if (css.has_class(el, class_name)) {
        while (class_name_normalized.indexOf( ' ' + class_name + ' ') >= 0) {
            class_name_normalized = class_name_normalized.replace(' ' + class_name + ' ', ' ');
        }
        el.className = class_name_normalized.replace(/^\s+|\s+$/g, ' ');
    }
};

module.exports = css;
},{}],12:[function(require,module,exports){
// functions for setting mouse cursor state, because the css:hover method is pretty bad

var m = require('./mouse');
var geom = require('./geom');

var cursor = {};

cursor.state = 'default';

cursor.set = function(c){
  var css_class = 'cursor-' + c
  // var css_class_old = 'cursor-' + cursor.state
  document.body.classList.remove(cursor.state)
  document.body.classList.add(css_class)

  // console.log(c)
  cursor.state = css_class;
  // document.body.style.cursor = c;
};

cursor.init = function(){
  window.addEventListener('mousemove', function(e){
    cursor.check_cursor_bounds();
  });
};

cursor.bounds = {};
cursor.check_cursor_bounds = function(){
  var x =m.x, y =m.y;

  for (var key in cursor.bounds){ var cb = cursor.bounds[key];
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
},{"./geom":20,"./mouse":25}],13:[function(require,module,exports){
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
  ,
  {year: '1997',
  data: {events: {"1997": [{"id":"test","eventname":"","url":"http://www.mixcloud.com/Slipmatt/slipmatt-world-of-rave-28/","venue":"blah","latitude":"43.653226","longitude":"-79.38318429999998","eventdate":"1997-01-01","location":"bluh"}]}}}
];

module.exports = data;
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
module.exports = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};
},{}],17:[function(require,module,exports){
var fn = {};

fn.empty = function(){};

module.exports = fn;
},{}],18:[function(require,module,exports){
// hacky font polling to check for loading
// the reason for doing this is that firefox will draw text into a canvas 
// using the wrong font before the right one is loaded
// based on https://github.com/patrickmarabeas/jQuery-FontFace-onLoad

var extend = require('./extend');
var css = require('./css');


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
      }
      else {
        setTimeout(check_loop, config.delay);
        config.timeout = config.timeout - config.delay;
      }

    }
    else {
      config.load_fn();
    }
  };

  check_loop();

}

module.exports = font_load;
},{"./css":11,"./extend":16}],19:[function(require,module,exports){
var geocode = {};

var gmap_geo = new google.maps.Geocoder();

geocode.from_address = function(txt, fn) {
  var opts = {
    region: 'uk',
    address: txt
  };
  gmap_geo.geocode( opts, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) 
      fn(results);
    // else
    //   console.log("Geocode was not successful for the following reason: " + status);
  });
};

geocode.from_latlng = function(lat, lng, fn){
  var latlng = new google.maps.LatLng(lat, lng);
  var opts = {
    region: 'uk',
    latLng: latlng
  };
  gmap_geo.geocode( opts, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) 
      fn(results);
    // else
    //   console.log("Geocode was not successful for the following reason: " + status);
  });  
}

module.exports = geocode;
},{}],20:[function(require,module,exports){
// basic geometry functions

var geom = {};

geom.bounds_hit_test = function(b, x, y){
  if (typeof b === 'undefined') return false;
  // console.log(x, y, b.x1, b.y1, b.x2, b.y2);
  if (x > b.x1 && 
      x < b.x2 && 
      y > b.y1 && 
      y < b.y2   ) return true;
      return false;
};


// local_xy_to_canvas_xy = function(model, x, y){
  // 
// }

// local_xy_to_window_xy = function(model, x, y){
  // x = model.l + x;
  // y = model.t + y;
  // return {x:x, y:y};
// }

// window_xy_to_local_xy = function(model, x, y){
  // 
// }

module.exports = geom;
},{}],21:[function(require,module,exports){
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


},{"./about":1,"./add":2,"./anim_loop":3,"./anim_map":4,"./audio":6,"./background":9,"./cursor":12,"./font_load":18,"./geocode":19,"./map":22,"./mouse":25,"./pin":27,"./player":28,"./player_soundcloud":31,"./share":35,"./text_metrics":37,"./tiles":38,"./timeline":39,"./title":41,"./touches":42,"./url":43,"./zoom":45}],22:[function(require,module,exports){
// create the leaflet map

require('./map_leaflet_edit');
var domq = require('./dom').q;
var url = require('./url');
var css = require('./css');

var map = {};
map.tile_size = 256;
map.pins = [];

var dom = {};

map.init = function(){

  map.leaflet = new L.MapWithAnimPane('map', {
      minZoom: 3,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: false,
      zoomAnimation: true,
      inertia: false
  });

  map.ui_map_pane = document.querySelector('.leaflet-map-pane');
  dom.el = domq('#map');

  // tightly centered on the uk
  // var southWest = new L.LatLng(49.95121990866206, -10.634765625),
  //     northEast = new L.LatLng(60.6301017662667, 2.4609375),
  var southWest = new L.LatLng(50.680797145321655, -9.20654296875),
      northEast = new L.LatLng(57.645400667406605, 0.98876953125),
      bounds = new L.LatLngBounds(southWest, northEast);

  map.leaflet.fitBounds(bounds);

  if (url.parsed.queryKey.bg === 'chris') {
    var world_tiles = 'world_dark'
  } else {
    var world_tiles = 'world_light'
  }

  // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
  map.layer_uk_mask = L.tileLayer(url.tile_server + 'uk_mask/{z}/{x}/{y}.png', {tms: true, opacity: 0.0}).addTo(map.leaflet);
  map.layer_world = L.tileLayer(url.tile_server + world_tiles + '/{z}/{x}/{y}.png', {tms: true}).addTo(map.leaflet);

  map.leaflet.on('zoomend', function(e){
    var zoom = map.leaflet.getZoom();
    var cl = dom.el.classList
    if (zoom < 5) {
      cl.remove('zoomed-in')
      cl.add('zoomed-out')
      // css.rm_class(dom.el, 'zoomed-in')
      // css.add_class(dom.el, 'zoomed-out')
    } else {
      cl.remove('zoomed-out')
      cl.add('zoomed-in')
      // css.rm_class(dom.el, 'zoomed-out')
      // css.add_class(dom.el, 'zoomed-in')
    }
  });
};


module.exports = map;

},{"./css":11,"./dom":14,"./map_leaflet_edit":23,"./url":43}],23:[function(require,module,exports){
// extensions, hacks, edits on the leaflet source
// todo: clean this up and get rid of old bits

// add an extra pane to contain animated pin bits
L.MapWithAnimPane = L.Map.extend({
    _initPanes: function () {
    var panes = this._panes = {};

    this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);

    this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
    panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
    panes.shadowPane = this._createPane('leaflet-shadow-pane');
    panes.overlayPane = this._createPane('leaflet-overlay-pane');
    panes.markerAnimPane = this._createPane('leaflet-marker-anim-pane');
    panes.markerPane = this._createPane('leaflet-marker-pane');
    panes.popupPane = this._createPane('leaflet-popup-pane');

    var zoomHide = ' leaflet-zoom-hide';

    if (!this.options.markerZoomAnimation) {
      L.DomUtil.addClass(panes.markerPane, zoomHide);
      L.DomUtil.addClass(panes.markerAnimPane, zoomHide);
      L.DomUtil.addClass(panes.shadowPane, zoomHide);
      L.DomUtil.addClass(panes.popupPane, zoomHide);
    }
  },


  _animatePathZoom: function (e) {
console.log("FUCK")
    var scale = this.getZoomScale(e.zoom),
        offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

    this._zoom_anim_start = Date.now();
    this._zoom_anim_scale = scale;
    this._zoom_anim_offset = offset;
    // console.log(offset)
    //console.log(scale);

    // console.log(this._pathRoot.style[L.DomUtil.TRANSFORM], L.DomUtil.getTranslateString(offset))

    this._pathRoot.style[L.DomUtil.TRANSFORM] =
            L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';


            console.log("FUCK")

    // console.log(offset.x, offset.y, L.DomUtil.getTranslateString(offset) )

    this._pathZooming = true;
  },

  _tryAnimatedZoom: function (center, zoom, options) {

    if (this._animatingZoom) { return true; }

    options = options || {};

    // don't animate if disabled, not supported or zoom difference is too large
    if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
            Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

    // offset is the pixel coords of the zoom origin relative to the current center
    var scale = this.getZoomScale(zoom),
        offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
      origin = this._getCenterLayerPoint()._add(offset);

    this._zoom_anim_start = Date.now();
    this._zoom_anim_scale = scale;
    this._zoom_anim_offset = offset;

    // don't animate if the zoom origin isn't within one screen from the current center, unless forced
    if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

    this
        .fire('movestart')
        .fire('zoomstart');

    this._animateZoom(center, zoom, origin, scale, null, true);

    return true;
  },


});

L.IconAnim = L.Icon.extend({
    _setIconStyles: function (img, name) {
    var options = this.options,
        size = L.point(options[name + 'Size']),
        anchor;

    if (name === 'shadow') {
      anchor = L.point(options.shadowAnchor || options.iconAnchor);
    } else if (name === 'anim') {
      anchor = L.point(options.animAnchor || options.iconAnchor);
    } else {
      anchor = L.point(options.iconAnchor);
    }

    if (!anchor && size) {
      anchor = size.divideBy(2, true);
    }

    img.className = 'leaflet-marker-' + name + ' ' + options.className;

    if (anchor) {
      img.style.marginLeft = (-anchor.x) + 'px';
      img.style.marginTop  = (-anchor.y) + 'px';
    }

    if (size) {
      img.style.width  = size.x + 'px';
      img.style.height = size.y + 'px';
    }
  },

  createAnim: function (oldAnim) {
    return this._createIcon('anim', oldAnim);
  }

});



L.Icon.prototype.createAnim = function (oldAnim) {
    return this._createIcon('anim', oldAnim);
  }




L.MarkerAnim = L.Marker.extend({

  _initIcon: function () {
    var options = this.options,
        map = this._map,
        animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
        classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

    var icon = options.icon.createIcon(this._icon),
      addIcon = false;

    // if we're not reusing the icon, remove the old one and init new one
    if (icon !== this._icon) {
      if (this._icon) {
        this._removeIcon();
      }
      addIcon = true;

      if (options.title) {
        icon.title = options.title;
      }
    }

    L.DomUtil.addClass(icon, classToAdd);

    if (options.keyboard) {
      icon.tabIndex = '0';
    }

    this._icon = icon;

    this._initInteraction();

    if (options.riseOnHover) {
      L.DomEvent
        .on(icon, 'mouseover', this._bringToFront, this)
        .on(icon, 'mouseout', this._resetZIndex, this);
    }

    var newShadow = options.icon.createShadow(this._shadow),
      addShadow = false;

    if (newShadow !== this._shadow) {
      this._removeShadow();
      addShadow = true;
    }

    if (newShadow) {
      L.DomUtil.addClass(newShadow, classToAdd);
    }
    this._shadow = newShadow;


    var addAnim = false;
    if (this.options.icon.options.animUrl){

      var newAnim = options.icon.createAnim(this._anim);

      if (newAnim !== this._anim) {
        this._removeAnim();
        addAnim = true;
      }

      if (newAnim) {
        L.DomUtil.addClass(newAnim, classToAdd);
      }
      this._anim = newAnim;
    }

    if (options.opacity < 1) {
      this._updateOpacity();
    }


    var panes = this._map._panes;

    if (addIcon) {
      panes.markerPane.appendChild(this._icon);
    }

    if (addAnim) {
      panes.markerPane.appendChild(this._anim);

      // panes.markerAnimPane.appendChild(this._anim);
    }

    if (newShadow && addShadow) {
      panes.shadowPane.appendChild(this._shadow);
    }
  },

  _removeAnim: function () {
    if (this._anim) {
      // this._map._panes.markerAnimPane.removeChild(this._anim);
      this._map._panes.markerPane.removeChild(this._anim);

    }
    this._anim = null;
  },

  _setPos: function (pos) {
    L.DomUtil.setPosition(this._icon, pos);

    if (this._shadow) {
      L.DomUtil.setPosition(this._shadow, pos);
    }

    if (this._anim) {
      L.DomUtil.setPosition(this._anim, pos);
    }

    this._zIndex = pos.y + this.options.zIndexOffset;

    this._resetZIndex();
  },

  _updateZIndex: function (offset) {
    // console.log("buh", offset, "buh")
    this._icon.style.zIndex = this._zIndex + offset;
    if (this._anim)
      this._anim.style.zIndex = this._zIndex + offset;
  }



});








},{}],24:[function(require,module,exports){
var math = {};

math.lerp = function(a, b, w){
  return (1 - w) * a + w * b;
}

module.exports = math;
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
// the pattern inside popup tails

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
},{}],27:[function(require,module,exports){
var data = require('./data');
var url = require('./url');
var map = require('./map');
var player = require('./player');
var hash_djb2 = require('./text').hash_djb2;

var pin = {};

var path_pin = './img/map/'
var path_pin_anim = './img/pins/';


var pin_anim_make = function(url){
  return new L.DivIcon({
    html: '<img src="./img/pins/strokeoverlay.png" class=pin-anim-overlay>' +
          '<img src="' + url + '" class=pin-anim-bg>',
    className: 'pin-anim',
    iconAnchor: [15, 50]
  });
};

var pin_url_from_id = function(id){
  var hash = hash_djb2(id);
  // console.log(hash, hash % pin.icons_anim.length)
  return pin.icons_anim[hash % pin.icons_anim.length]
}

pin.init = function(){


  pin.icon_blue = L.icon({
      iconUrl: path_pin+'marker-icon.png',
      iconRetinaUrl: path_pin+'marker-icon-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  pin.icon_blue_small = L.icon({
      iconUrl: path_pin+'marker-icon.png',
      iconRetinaUrl: path_pin+'marker-icon-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      iconSize: [25*0.6, 41*0.6],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41*0.6, 41*0.6]
  });

  pin.icon_pink = L.icon({
      iconUrl: path_pin+'marker-icon-pink.png',
      iconRetinaUrl: path_pin+'marker-icon-pink-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  pin.icon_geocode = L.icon({
      iconUrl: path_pin+'marker-icon-pink-2x.png',
      // iconRetinaUrl: path_pin+'marker-icon-pink-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      // iconSize: [50, 82],
      // iconAnchor: [25, 82],
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  pin.icon_geocode2 = new L.IconAnim({
      animUrl: './img/pins/blue_1.gif',
      // iconUrl: path_pin+'marker-icon-pink-2x.png',
      iconUrl: './img/pins/strokeoverlay.png',
      // iconRetinaUrl: path_pin+'marker-icon-pink-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      // iconSize: [50, 82],
      // iconAnchor: [25, 82],
      iconSize: [30, 50],
      iconAnchor: [15, 50],
      popupAnchor: [1, -34],
      shadowAnchor: [12, 41],
      shadowSize: [41, 41]
  });

  pin.icons_anim = [];
  for (var i=1; i<17; i++){
    pin.icons_anim.push(pin_anim_make(path_pin_anim + 'red_' + i + '.gif'));
    pin.icons_anim.push(pin_anim_make(path_pin_anim + 'green_' + i + '.gif'));
    pin.icons_anim.push(pin_anim_make(path_pin_anim + 'blue_' + i + '.gif'));
  }

  pin.data_onto_map();

  pin.geocode = L.marker([0,0], {
      icon: pin.icon_geocode,
      draggable: true
  });

  pin.geocode.on('dragend', function(e){
    geocode.from_latlng(e.target._latlng.lat, e.target._latlng.lng, pin.geocode_fn)
  });

  pin.geocode_fn = function(results){ console.log(results) };

};

pin.data_onto_map = function(){

/*
  var marker_cluster = L.markerClusterGroup({
    // disableClusteringAtZoom: 7,
    // animateAddingMarkers: true,
    maxClusterRadius: 35
    // zoomToBoundsOnClick: false
  });
*/
    
  /*
    for (var i = 0; i < addressPoints.length; i++) {
      var a = addressPoints[i];
      var title = a[2];
      var marker = L.marker(new L.LatLng(a[0], a[1]), { title: title });
      marker_cluster.bindPopup(title);
      marker_cluster.addLayer(marker);
    }
  */
    

  for (var iy=0, item_year; item_year=data[iy]; iy++){
    var year = item_year.year;
    var events = item_year.data.events;
    if (!(year in events)) continue;
    for (var i=0, item; item=events[year][i]; i++){
      // var latlng = L.LatLng(parseFloat(item.latitude), parseFloat(item.longitude));
      // var p = L.marker([parseFloat(item.latitude), parseFloat(item.longitude)], {

      // cluster
/*

      var p = new L.MarkerAnim([parseFloat(item.latitude), parseFloat(item.longitude)], {
        riseOnHover: true,
        //icon: pin.icon_html //pin.icon_geocode2
        icon: pin_url_from_id(item.id)
      });
      p.on('click', player.popup);
      p.data = item;
      item.pin = p;
      marker_cluster.addLayer(p);
      map.pins.push(p);
*/
      // no-cluster

      var p = new L.MarkerAnim([parseFloat(item.latitude), parseFloat(item.longitude)], {
        riseOnHover: true,
        //icon: pin.icon_html //pin.icon_geocode2
        icon: pin_url_from_id(item.id)
      });
      p.on('click', player.open);
      p.data = item;
      item.pin = p;
      // marker.bindPopup(item.venue);
      p.addTo(map.leaflet);
      map.pins.push(p);
      
    
      

    }
  }

  //   marker_cluster.on('clusterclick', function (a) {
  //     a.layer.spiderfy();
  //   });
  // map.leaflet.addLayer(marker_cluster);


}

// map.removeLayer(marker)

pin.geocode_place = function(lat, lng){

  if (!pin.geocode._map) pin.geocode.addTo(map.leaflet)

  pin.geocode.setLatLng([lat, lng])

};

pin.geocode_remove = function(){
  map.leaflet.removeLayer(pin.geocode);
}

//pin.geocode

module.exports = pin;
},{"./data":13,"./map":22,"./player":28,"./text":36,"./url":43}],28:[function(require,module,exports){
var url = require('./url');
var map = require('./map');
var loop = require('./anim_loop');

var audio = require('./audio');
require('./player_leaflet');
// var soundcloud = require('./player_soundcloud');
// var mixcloud = require('./player_mixcloud');
var domq = require('./dom').q;

// var model = require('./player_model');

var players = {};
players.soundcloud = require('./player_soundcloud');
players.mixcloud = require('./player_mixcloud');


var player = {is_open: false};
var dom = {};
var popup = {};

player.layer_leaflet = null;
player.layer_id = null;

var popup_wrapper_html = function(data, html_to_wrap){
  html_to_wrap = html_to_wrap || ""

  // console.log(html_to_wrap)

  var content = 
  "<div class=player-popup>" + 
    "<h2>We Raved Here:</h2>" +
    "<h3>" + data.venue + "</h3>" +
    '<img src="img/player/close.png" class=player-close>' + 
    "<div class=player-embed-container>" +
      html_to_wrap +
    // "<a href='" + data.url + "' class='sc-player'>soundcloud set</a>" +
    "</div>" +
  "</div>"

  return content
};

player.anim = function(){
  if (!player.layer_id || !player.player_type.anim) return;
  player.player_type.anim(player)
}

player.close = function(){
  dom.el.classList.add('hidden')
  dom.el_embed_container.innerHTML = ''

  //if (player.layer_leaflet) {
  //  map.leaflet.removeLayer(player.layer_leaflet);
  //  player.layer_leaflet = null;
  //}

  if ("player_type" in player && "fn_rm" in player.player_type) player.player_type.fn_rm(player)

  player.canvas.classList.add('hidden')
  player.layer_id = null;
  player.is_open = false;

}

player.pan_map_to_fit = function(){
  var r = dom.el.getBoundingClientRect()
    , pan_x = 0
    , pan_y = 0
    , pad = 50
    , ww = window.innerWidth
    , wh = window.innerHeight

  if (r.left < pad) pan_x = r.left - pad;

  if (r.right > ww - pad) pan_x = Math.abs(ww - r.right) + pad;

  if (r.top < pad) pan_y = r.top - pad;

  if (r.bottom > wh - pad) pan_y = Math.abs(wh - r.bottom) + pad;

  if (pan_x !== 0 || pan_y !== 0)
    map.leaflet.panBy([pan_x, pan_y]);  
};



player.open = function(e){

  var data = e.target.data;

  // console.log(e.target)

  var u = url.parse(data.url);

  if (player.layer_id === data.id){ // same pin clicked as current open player... just close
    player.close()
    return;
  } else {
    player.close()
  }

  dom.el.classList.remove('hidden')
  // dom.el.innerHTML = "<h1>FUCK</h1>"

  var domain_parts = u.host.split(".")
  var domain = domain_parts[domain_parts.length - 2];

  if (domain === 'soundcloud')
    var player_type = players.soundcloud
  else if (domain === 'mixcloud')
    var player_type = players.mixcloud
  else
    return;

  player.player_type = player_type;


  // var initial_content = player_type.html_content(data)
  // var content = popup_wrapper_html(data, initial_content)

  dom.el_embed_container.innerHTML = player_type.html_content(data)

  // return;
// console.log(e.target._icon);
  player.is_open = true;
  dom.el_venue.innerHTML = data.venue || ''
  player.pin = e.target
  player.latlng = e.target._latlng
  player.url = data.url;
  player.layer_id = data.id;
  player.dirty = true;
  if ("fn_add" in player.player_type) player_type.fn_add(player)
  player.resize();
  player.pan_map_to_fit();

  return;

  // popup.

  var opts = {
      latlng: e.target._latlng
    , html: content
    , fn_add: player_type.fn_add
    , fn_rm: player_type.fn_rm
    , fn_close_popup: player.close
    , url: data.url
  };



  // u.directory

  player.layer_leaflet = new L.PlayerPopup(opts)
  player.player_type = player_type;
  // player.layer_leaflet = new soundcloud.leaflet_layer(opts)
  player.layer_id = data.id;

  map.leaflet.addLayer(player.layer_leaflet);

  player.pan_map_to_fit();


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



  // var options = {offset:anchor};





  // if (open_player._el)

  // 7window.FUCK = open_player._el


  // pan map to contain player


  // console.log(r.top, r.right, r.bottom, r.left);



  // console.log(open_player._el)
  // return

/*
  map.leaflet.openPopup(content, e.target._latlng, {

  // map.leaflet.openPopup(e.target.data.venue, e.target._latlng, {
    offset: anchor
  });
  
  $('a.sc-player, div.sc-player').scPlayer();


  open_popup = e.target.data;  
*/
};

player.resize = function(){

  // var p = map.leaflet.latLngToLayerPoint(player.pin._latlng);

  var p = map.leaflet.latLngToContainerPoint(player.pin._latlng)

  // console.log(player.el.offsetWidth, player.el.clientWidth)

  var r_pin = player.pin._icon.getBoundingClientRect()
  var top = p.y - player.el.offsetHeight - 50
  var left = p.x + r_pin.width/2 - player.el.offsetWidth/2
  player.el.style.top = top + 'px'
  player.el.style.left = left + 'px'

  // console.log(map.leaflet.latLngToLayerPoint(player.latlng));

  // this._offset = L.point([-(this._el.offsetWidth/2)|0, -this._el.offsetHeight - 45])
}

player.init = function(){
  audio.init();

  player.el = dom.el = domq('#ui-popup');
  dom.el_close = domq('#ui-popup .player-close')
  dom.el_venue = domq('#ui-popup .player-venue')
  dom.el_embed_container = domq('#ui-popup .player-embed-container')
  player.canvas = domq('#ui-popup canvas')
  player.ctx = player.canvas.getContext('2d')

  dom.el_close.addEventListener("click", function(){ /*console.log("blah");*/ player.close()})

  map.leaflet.on('viewreset move', function(){
    if (!player.is_open) return
      // console.log("fug")
    player.dirty = true;
    player.resize();
  })

  // init different engines
  for (var key in players){ var p = players[key]
    if ("init" in p) p.init(player);
  }

  loop.fns_render.push(player.anim)
}

module.exports = player;
},{"./anim_loop":3,"./audio":6,"./dom":14,"./map":22,"./player_leaflet":29,"./player_mixcloud":30,"./player_soundcloud":31,"./url":43}],29:[function(require,module,exports){
var empty = require('./fn').empty
var text2el = require('./dom').text2el;

// soundcloud.leaflet_layer = L.Class.extend({
L.PlayerPopup = L.Class.extend({

    options: {},

    initialize: function (opts) {
        // save position of the layer or any options from the constructor

        this._latlng = opts.latlng;
        this._html = opts.html;
        this._fn_add = opts.fn_add || empty;
        this._fn_rm = opts.fn_rm || empty;
        this._url = opts.url;
        this._fn_close_popup = opts.fn_close_popup || empty;

        // console.log(opts)

        // console.log(this.options);
        // this._fn_
        // this._offset = options.offset
        // L.setOptions(this, options);
    },

    onAdd: function (map) {

        var layer = this;

        this._map = map;

        // create a DOM element and put it into one of the map panes
        // this._el = L.DomUtil.create('div', 'my-custom-layer leaflet-zoom-hide');
        this._el = text2el(this._html);



        // map.getPanes().overlayPane.appendChild(this._el);
        map.getPanes().popupPane.appendChild(this._el);


        var close_button = this._el.querySelector(".player-close");
        close_button.addEventListener("click", this._fn_close_popup)

        this._fn_add(this);
        // $('a.sc-player, div.sc-player').scPlayer();

        // console.log(this._el.offsetWidth, this._el.offsetHeight)

        this._offset = L.point([-(this._el.offsetWidth/2)|0, -this._el.offsetHeight - 45])
        // this._offset = this._offset.add(L.Popup.prototype.options.offset);

        // add a viewreset event listener for updating layer's position, do the latter
        map.on('viewreset', this._reset, this);
        this._reset();
    },

    onRemove: function (map) {
        // remove layer's DOM elements and listeners
        this._fn_rm(this);
        
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
},{"./dom":14,"./fn":17}],30:[function(require,module,exports){
// http://www.mixcloud.com/developers/documentation/#embedding
// 

// var extend = require('./extend');
// var text2el = require('./dom').text2el;
// var url = require('./url');
// var xhr = require('./xhr');
// var jsonp = require('./jsonp');

var mixcloud = {};

//var req_embed_html = function(url){
//  var xhr = new XMLHttpRequest();
//  xhr.get(url, {
//            load: function(){ console.log(arguments, this) }
//          , error: function(){ console.log(arguments, this) }
//  })
//}

// var player_add_fetched_embed_json_to_layer = function(layer){
//   return function(json){
//     if (json.html)
//       layer._el_container.innerHTML = json.html
//   }
// }

mixcloud.fn_add = function(layer){ 
  // layer._el_container = layer._el.querySelector('.player-embed-container');
  // var u = url.parse(layer._url);

  // use initial_content to embed iframe instead...
  //var url_embedjson = "http://api.mixcloud.com" + u.directory + "embed-json/?color=000000&callback={{callback}}"
  //jsonp.get(url_embedjson, { load: player_add_fetched_embed_json_to_layer(layer) })

};

mixcloud.fn_rm = function(){ 
    // $('.sc-player.playing a.sc-pause').click();
};

mixcloud.html_content = function(data){
  // return ""
  return '<iframe width=400 height=300 ' +
    'src="//www.mixcloud.com/widget/iframe/?' + 
      'feed=' + encodeURIComponent(data.url) + //'http%3A%2F%2Fwww.mixcloud.com%2FSlipmatt%2Fslipmatt-world-of-rave-28%2F' + 
      '&amp;mini=true' +
      '&amp;stylecolor=000000' +
      '&amp;hide_artwork=true' +
      '&amp;embed_type=widget_standard' +
      // '&amp;embed_uuid=1b8d968a-a85e-404e-926e-7cbecdaf56d7' +
      '&amp;hide_tracklist=' +
      '&amp;hide_cover=' +
      '&amp;autoplay="' + 
  'frameborder=0></iframe>'
}

module.exports = mixcloud;


},{}],31:[function(require,module,exports){
var extend = require('./extend');
var text2el = require('./dom').text2el;
var domq = require('./dom').q;
var geom = require('./geom');

var touches = require('./touches')

var xhr = require('./xhr');
require('./player_soundcloud_leaflet_edit');
var waveform = require('./player_soundcloud_waveform');
var audio = require('./audio')

var dom = {};

var api_key= 'htuiRd1JP11Ww0X72T1C3g'; //todo, get actual key



var soundcloud = {};

var cache = soundcloud.cache = {};
cache.oembed = {};
cache.url2trackid = {};
cache.api_track = {};
cache.waveform_json = {};
cache.waveform_mask = {};

soundcloud.init = function(){
  // SC - soundcloud sdk
  SC.initialize({});
  dom.canvas_waveform_composite = document.createElement('canvas')
  dom.canvas_waveform_composite.width = waveform.w
  dom.canvas_waveform_composite.height = waveform.h
  dom.ctx_waveform_composite = dom.canvas_waveform_composite.getContext('2d')
}


// waveform
var waveform_hit_test_fn = function(x, y){
  // console.log("foo")
  return geom.bounds_hit_test(soundcloud['bounds_player_waveform'], x, y)
};

// var scale_mousemove = function(x,y,e, state){
//   if (scale_hit_test_fn(x,y)){
//     if (!model.mouseover){
//       model.mouseover = true
//     }
//     model.dirty = true;
//   } else {
//     if (model.mouseover){
//       model.mouseover = false
//       model.dirty = true;
//     }        
//   }
// };

var waveform_move_while_down = function(x, y, e, state){
  e.preventDefault();
  e.stopPropagation();

  // console.log("foo")
  waveform_set_value(x);
};

var waveform_set_value = function(x){

  var bounds = soundcloud['bounds_player_waveform'];

  var w = bounds.x2 - bounds.x1

  var x_in_px = x - bounds.x1;
  var x_in_percent = x_in_px / w
  if (x_in_percent < 0) x_in_percent = 0
  if (x_in_percent > 1) x_in_percent = 1

  if (audio.player && 'currentTime' in audio.player)
    audio.player.currentTime = x_in_percent * audio.player.duration;
  else if (audio.player && 'setPosition' in audio.player)
    audio.player.setPosition(x_in_percent * audio.player.duration);




    //model.step = model.waveform_scale(x);
    //model.dirty = true;
    // console.log(x)
};

var touches_waveform = {
  bounds_check_down: waveform_hit_test_fn,
  move_while_down: waveform_move_while_down,
  up: waveform_set_value,
  // mousemove: scale_mousemove
};









// have soundcloud url... then:
//    jsonp fetch oembed to get track id... then:
//        jsonp fetch track json using track id... then:
//            xhr fetch waveform data for track using track json
//            fetch stream using track json

soundcloud.fn_add = function(player){ 
    // player._closed = false

    var el = player.el;

    player.canvas.classList.remove('hidden')

    dom.el_sc_wrapper = el.querySelector('.soundcloud-player');
    dom.el_sc_play_pause = el.querySelector('.soundcloud-play-pause');
    // dom.el_waveform = el.querySelector('.soundcloud-waveform');
    dom.el_sc_title = el.querySelector('.soundcloud-track-title');

    player.canvas.width = waveform.w
    player.canvas.height = waveform.h

    // dom.waveform_ctx = dom.el_waveform.getContext('2d')

    player.ctx.webkitImageSmoothingEnabled = false;
    player.ctx.mozImageSmoothingEnabled = false;
    player.ctx.imageSmoothingEnabled = false;

    dom.el_sc_wrapper.style.height = (80 + waveform.h) + "px"

    dom.el_sc_play_pause.addEventListener('click', function(){
      var cl = dom.el_sc_play_pause.classList
      if (audio.player && audio.player.paused) {
        cl.add('playing')
        cl.remove('paused')
        audio.play()
      }
      else if (audio.player && !audio.player.paused) {
        cl.remove('playing')
        cl.add('paused')
        audio.pause();
      }
    });

    touches.down_and_up(touches_waveform);

    // get track info from soundcloud api... first, grab the oembed of a url
    var url = player.url;

    if (url in cache.oembed)
      soundcloud_oembed_fetched(player)();
    else
      SC.oEmbed(url, soundcloud_oembed_fetched(player));

    

    // $('a.sc-player-old, div.sc-player-old').scPlayer();

};

soundcloud.fn_rm = function(player){
  // player._closed = true
  audio.stop();
    // $('.sc-player.playing a.sc-pause').click();
};

var soundcloud_oembed_fetched = function(player){ return function(oembed_json, err){
  if (!player.is_open) return;

  var url = player.url;

  if (oembed_json) cache.oembed[url] = oembed_json;
  else oembed_json = oembed_json || cache.oembed[url];

  if (oembed_json === null || oembed_json === undefined || err){
    console.log("error", err, url)
    return;
  }
  // render title
  dom.el_sc_title.innerHTML = oembed_json.title

  // fetch track info
  if (url in cache.url2trackid)
    soundcloud_api_track_fetched(player)();
  //return
  else {
    var tracks_match = oembed_json.html.match(/%2Ftracks%2F([0-9]+)/) // brittle
    if (!tracks_match || tracks_match.length < 2) {
      console.log(oembed_json.html)
      return
    }
    var trackid = tracks_match[1]
    cache.url2trackid[url] = trackid
    var track_url = "/tracks/" + trackid + ".json"
    var opts = { consumer_key: api_key };
    SC.get(track_url, opts, soundcloud_api_track_fetched(player));
  }


  // %2Ftracks%2F

  // if (json.title)
// "<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F39100048&show_artwork=true"></iframe>"
  // console.log(json)

}};

var soundcloud_api_track_fetched = function(player){ return function(track_json, err){
  if (!player.is_open) return;

  var url = player.url;

  if (track_json) 
    cache.api_track[url] = track_json;
  else
    track_json = track_json || cache.api_track[url];

  if (track_json === null || track_json === undefined || err)
     { console.log("error", err, url); return }

  // render soundcloud player
  if (url in cache.waveform_mask)
    soundcloud_waveform_fetched(player)();  
  else {
    // change http://w1.sndcdn.com/_.png to
    // http://wis.sndcdn.com/_.png
    var url_waveform_data = track_json.waveform_url.split(".")
    url_waveform_data.shift()
    url_waveform_data.unshift("http://wis")
    url_waveform_data = url_waveform_data.join(".")
    xhr.get(url_waveform_data, {
        load: soundcloud_waveform_fetched(player)
    });

    // console.log(url_waveform_data)
  }

  if (track_json.streamable){
    // to figure out: why do i gotta switch this to https to get it to work?
    var url_stream = track_json.stream_url.replace(/^http:/, 'https:')
    url_stream = url_stream + (/\?/.test(url_stream) ? '&' : '?') + 'consumer_key=' + api_key;
    audio.load_and_play(url_stream);
    dom.el_sc_play_pause.classList.add('playing')
    dom.el_sc_play_pause.classList.remove('paused')
    // audio.play();
  }

  // console.log(json, err)
}};


var soundcloud_waveform_fetched = function(player){ return function(e){
  if (!player.is_open) return;

  var url = player.url;

  if (e && e.target && e.target.responseText) {
    var waveform_json = cache.waveform_json[url] = JSON.parse(e.target.responseText)
    var waveform_mask = cache.waveform_mask[url] = waveform.render(url, waveform_json)
  } else
    var waveform_mask = cache.waveform_mask[url]
  // else: no mask...



  // console.log(cache.api_track[layer._url])

  // document.body.appendChild(waveform_mask)
  // console.log(waveform)

  // render waaveform
  
}}

var canvas_draw = {
  x:0, y:0
, w:0, h:0
, dest_offset_x: 0
, dest_offset_y: 0
}

soundcloud.anim = function(player){
  // console.log(layer)
  if (!(player.url in cache.waveform_mask)) return;


  var waveform_mask = cache.waveform_mask[player.url]
  var ctx = player.ctx
    , c = player.canvas
    , c_cmp = dom.canvas_waveform_composite
    , ctx_cmp = dom.ctx_waveform_composite
    , c_w = c_cmp.width
    , c_h = c_cmp.height

  if (player.dirty){

    // console.log("foo")

    var r = c.getBoundingClientRect()

    var s_x = r.left
      , s_y = r.top
      , s_w = waveform.w
      , s_h = waveform.h
      , ww = canvas.width
      , wh = canvas.height
      , dest_offset_x = 0
      , dest_offset_y = 0

    if (s_x > ww || s_y > wh) return;

    // console.log("ok")

    cursor.bounds.player_waveform = soundcloud.bounds_player_waveform = {
        x1: s_x, x2: s_x + s_w,
        y1: s_y, y2: s_y + s_h,
        mouseover: 'pointer'
    };

    // cursor.bounds.player_waveform = soundcloud.bounds_player_waveform = {
    //     x1: s_x, x2: s_x + s_w,
    //     y1: s_y, y2: s_y + s_h,
    //     mouseover: 'pointer'
    // };

    if (s_x < 0) {
      s_w += s_x
      dest_offset_x = -s_x
      s_x = 0;
    }
    if (s_y < 0) {
      s_h += s_y
      dest_offset_y = -s_y
      s_y = 0;
    }

    if (s_x + s_w > ww){
      s_w = ww - s_x
    }

    if (s_y + s_h > wh){
      s_h = wh - s_y
    }

    canvas_draw.s_x = s_x
    canvas_draw.s_y = s_y
    canvas_draw.s_w = s_w
    canvas_draw.s_h = s_h
    canvas_draw.dest_offset_x = dest_offset_x
    canvas_draw.dest_offset_y = dest_offset_y


    player.dirty = false;
  }

  // composite and mask waveform data to main animation, and then put a cursor on it.
  ctx_cmp.clearRect(0,0,c_w,c_h);
  ctx_cmp.globalCompositeOperation = 'source-over';
  ctx_cmp.drawImage(window.canvas, 
                canvas_draw.s_x,canvas_draw.s_y,canvas_draw.s_w,canvas_draw.s_h,
                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h)  
  ctx_cmp.globalCompositeOperation = 'destination-in';
  ctx_cmp.drawImage(waveform_mask, 
                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h, 
                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h);

//  // console.log(s_x,s_y,s_w,s_h, dest_offset_x,dest_offset_y,s_w,s_h)
//  ctx.globalCompositeOperation = 'source-over';
//  // ctx.drawImage(canvas, s_x,s_y,s_w,s_h, dest_offset_x,dest_offset_y,s_w,s_h)
//  ctx.drawImage(canvas, 
//                canvas_draw.s_x,canvas_draw.s_y,canvas_draw.s_w,canvas_draw.s_h,
//                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h)
//  ctx.globalCompositeOperation = 'destination-in';
//  // ctx.drawImage(waveform_mask, dest_offset_x,dest_offset_y,s_w,s_h, dest_offset_x,dest_offset_y,s_w,s_h);
//  ctx.drawImage(waveform_mask, 
//                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h, 
//                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h);
//
  // console.log(audio.player)

  // playback cursor

  if (audio.player && audio.player.duration){
    var duration = audio.player.durationEstimate || audio.player.duration
    var pos = audio.player.currentTime || audio.player.position
    // console.log(audio.player.currentTime, audio.player.duration)
    var cursor_percent = parseInt(pos) / parseInt(duration)
    var cursor_position_px = Math.round(waveform.w * cursor_percent);

    if (!audio.player.paused){
      ctx_cmp.fillStyle = '#fff'
    } else {
      var color_value_hex = (((Math.sin(Date.now() / 100) * 128) + 128) |0).toString(16);
      if (color_value_hex.length === 1) color_value_hex = '0' + color_value_hex
      ctx_cmp.fillStyle = '#' + color_value_hex + color_value_hex + color_value_hex;    
    }


    // ctx.fillStyle = '#fff'
  //  ctx.globalCompositeOperation = 'source-over';
  //  ctx.fillRect(cursor_position_px,0, 1,waveform.h)
    ctx_cmp.globalCompositeOperation = 'source-over';
    ctx_cmp.fillRect(cursor_position_px,0, 1,waveform.h)

    // composite on to main canvas
    ctx.clearRect(0,0,c_w,c_h);
    ctx.drawImage(c_cmp, 0,0);


    // console.log(cursor_percent)
  }




}

soundcloud.html_content = function(data){
  var html = //"<a href='" + data.url + "' class='sc-player-old'>soundcloud set</a>" +
  // '<div class=soundcloud-player-wrapper>' +
    '<div class=soundcloud-player>' +
      '<div class=soundcloud-player-inner>' +
        '<div class=soundcloud-play-pause></div>' +
        '<h3 class=soundcloud-track-title></h3>' +
      '</div>' +
    '</div>'
    // '<canvas class=soundcloud-waveform></canvas>' +
  // '</div>'

  return html

}

module.exports = soundcloud;


// <iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F113559292"></iframe>
},{"./audio":6,"./dom":14,"./extend":16,"./geom":20,"./player_soundcloud_leaflet_edit":32,"./player_soundcloud_waveform":33,"./touches":42,"./xhr":44}],32:[function(require,module,exports){
// had to edit this to allow clicking on a canvas waveform inside soundcloud player popup!

L.Draggable.prototype._onDown = function (e) {
  this._moved = false;

  if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

  // timb edit
  // L.DomEvent.stopPropagation(e);

  if (L.Draggable._disabled) { return; }

  L.DomUtil.disableImageDrag();
  L.DomUtil.disableTextSelection();

  var first = e.touches ? e.touches[0] : e,
      el = first.target;

  // if touching a link, highlight it
  if (L.Browser.touch && el.tagName && el.tagName.toLowerCase() === 'a') {
    L.DomUtil.addClass(el, 'leaflet-active');
  }

  if (this._moving) { return; }

  this._startPoint = new L.Point(first.clientX, first.clientY);
  this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

  L.DomEvent
      .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
      .on(document, L.Draggable.END[e.type], this._onUp, this);
}
},{}],33:[function(require,module,exports){
var Benchmark = require('./benchmark');

var waveform = {};

var cache_ctx;

waveform.w = 400;
waveform.h = 35;
var fillStyle = "#000";

// soundcloud data looks like
// {width:1, height:1, samples:[]}
var render_unscaled_canvas = function(json){

  var w = json.width
    , h = json.height
    , h2 = h*2
    , cursor = w
    , s = json.samples

  if (cache_ctx && 
      cache_ctx.canvas.width === w &&
      cache_ctx.canvas.height === h2){
    var ctx = cache_ctx
      , c = cache_ctx.canvas;
    ctx.clearRect(0,0, w, h2)
  } else {
    var c = document.createElement('canvas')
      , ctx = c.getContext('2d');
    c.width = w
    c.height = h2
    cache_ctx = ctx;
  }

  ctx.fillStyle = fillStyle;

  while(cursor--){
    var val = s[cursor];
    ctx.fillRect(cursor, h-val, 1, val*2)
    // console.log(l)
  }

  return c
};

var render_scaled_canvas = function(canvas_original){
  var c = document.createElement('canvas');
  c.width = waveform.w;
  c.height = waveform.h;
  var ctx = c.getContext('2d');

  ctx.drawImage(canvas_original, 0,0, canvas_original.width, canvas_original.height,
                                 0,0, c.width, c.height);

  return c;
}

waveform.render = function(url, json){

  // var b = Benchmark();

  // b.start("draw")

  var canvas_scaled = render_scaled_canvas(render_unscaled_canvas(json))

  return canvas_scaled

  // b.stop("draw")
  // console.log(b)

  // document.body.appendChild(canvas_scaled)

};

module.exports = waveform;
},{"./benchmark":10}],34:[function(require,module,exports){
var popup = {};

popup.list = {};

popup.close = function(){
  for (var key in popup.list)
    popup.list[key].close();
};

popup.width = 400;

module.exports = popup;
},{}],35:[function(require,module,exports){
// https://twitter.com/about/resources/buttons#tweet

var domq = require('./dom').q;
var popup = require('./popup');
var pattern = require('./pattern');
var loop = require('./anim_loop');
var url = require('./url');

var share = {};

var open = false;

var dom = {};
var fillStyle = '#000';

share.init = function(){

  popup.list.share = share;

  var link = domq('#link-share');
  var el = dom.el = domq('#popup-share');
  var el_tail = dom.el_tail = domq('#popup-share canvas');
  el_tail.width = 400
  el_tail.height = 50

  fillStyle = (url.parsed.queryKey.bg === 'chris') ? '#fff' : '#000';
  link.style.color = fillStyle

  dom.tail_ctx = dom.el_tail.getContext('2d');

  link.addEventListener('click', function(){
    if (open) share.close()
    else share.open()
  });

  window.addEventListener('resize', function(){ share.resize() });

  share.resize();
  loop.fns_render.push(share.anim);
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
},{"./anim_loop":3,"./dom":14,"./pattern":26,"./popup":34,"./url":43}],36:[function(require,module,exports){
var text = {};


// ported from http://www.cse.yorku.ca/~oz/hash.html
// probably a bad idea to % unicode char values into a byte?
text.hash_djb2 = function(txt){
  var chars = txt.split("")
  var hash = 5381;
  var c

  while (c = chars.pop())
    hash = ((hash << 5) + hash) + (c.charCodeAt(0) % 256); /* hash * 33 + c */

  return hash
}

module.exports = text;
},{}],37:[function(require,module,exports){
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
},{}],38:[function(require,module,exports){
// tile non-existence data structure to tell us what tiles to not bother fetching
var url = require('./url')

var tiles = {};

tiles.uk_mask_data = {3:{3:[5],4:[5]},4:{7:[10,11],8:[10]},5:{14:[22],15:[21,22],16:[21]},6:{29:[44],30:[42,43,44],31:[42,43,44,45],32:[42,43]},7:{59:[89],60:[85,86,87,89],61:[84,85,86,87,88,89],62:[84,85,86,87,88,89,90],63:[84,85,86,87,88,89,90,91],64:[85,86]}};
tiles.world_data = {3:{0:[0,1,2,3,4,5,6],1:[0,1,3,4,5,6,7],2:[0,1,2,3,4,5,6,7],3:[0,1,2,3,4,5,6,7],4:[0,1,2,3,4,5,6,7],5:[0,1,2,3,4,5,6,7],6:[0,1,2,3,4,5,6,7],7:[0,1,2,3,4,5,6]},4:{0:[0,1,10,11,12,2,5,6,7,8,9],1:[0,1,10,11,12,2,6,7,8],2:[0,1,10,11,12,13,2,3,6,8,9],3:[0,1,10,11,12,13,14,2,3,6,7,8,9],4:[0,1,10,11,12,13,14,15,2,3,4,5,6,7,8,9],5:[0,1,10,11,12,13,14,15,2,3,4,5,6,7,8,9],6:[0,1,11,12,13,14,15,2,4,5,6,7,8,9],7:[0,1,10,11,12,13,14,15,2,3,6,7,8,9],8:[0,1,10,11,12,13,14,2,3,5,6,7,8,9],9:[0,1,10,11,12,13,14,2,3,5,6,7,8,9],10:[0,1,10,11,12,13,14,2,3,4,5,6,7,8,9],11:[0,1,10,11,12,13,14,2,3,5,6,7,8,9],12:[0,1,10,11,12,13,14,2,3,4,7,8,9],13:[0,1,10,11,12,13,2,3,4,6,7,8,9],14:[0,1,10,11,12,13,2,3,4,5,6,7,8,9],15:[0,1,10,11,12,2,3,5,6,7,8]},5:{0:[0,1,11,13,14,15,16,17,18,21,22,23,24,25],1:[0,1,14,15,16,17,18,2,21,22,23,24,25,3,4],2:[0,1,13,14,15,16,17,2,21,22,23,24,25,3,4,5],3:[0,1,13,14,15,2,22,23,24,3,4,5],4:[0,1,13,19,2,20,21,22,23,24,25,26,3,4,5,6],5:[0,1,17,18,19,2,20,21,22,23,24,25,26,27,3,4,5,6],6:[0,1,13,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6],7:[0,1,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7],8:[0,1,12,13,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6],9:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,7,9],10:[0,1,10,11,12,13,14,15,16,17,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,7,8,9],11:[0,1,12,13,14,15,16,2,20,21,22,23,24,25,26,27,28,29,3,30,4,8,9],12:[0,1,10,13,14,15,2,22,23,24,25,26,27,28,29,3,30,4,9],13:[0,1,14,15,16,17,19,2,23,24,25,26,27,28,29,3,30,4,5,9],14:[0,1,12,15,16,17,18,19,2,23,24,25,26,27,28,29,3,30,4,5,6],15:[0,1,12,14,16,17,18,19,2,20,21,22,23,25,3,4,5,6,7],16:[0,1,10,15,16,17,18,19,2,20,21,22,23,27,28,3,4,5,6,7],17:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7],18:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7],19:[0,1,11,13,14,15,16,17,18,19,2,20,21,22,23,24,28,3,4,5,6,7],20:[0,1,11,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,28,29,3,4,5,6,7,8],21:[0,1,14,15,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7,8],22:[0,1,10,11,12,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7],23:[0,1,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7],24:[0,1,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,6,7,8],25:[0,1,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,7,8],26:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,7,8],27:[0,1,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,7,8],28:[0,1,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,7,8],29:[0,1,11,12,13,14,15,16,18,2,20,21,22,23,24,25,26,27,3,4,5,6,7],30:[0,1,10,11,13,14,15,16,17,2,21,22,23,24,25,3,4,5,6,7],31:[0,1,10,11,12,14,15,16,17,21,22,23,24,25,4,6]},6:{0:[0,1,23,26,27,28,29,32,37,42,47,48,49,50],1:[0,1,2,28,29,3,30,31,35,36,42,43,44,45,46,47,48],2:[0,1,2,29,3,30,36,43,45,46,47,48,49,5,7,8],3:[0,1,2,28,3,30,31,32,33,35,36,43,44,45,46,47,48,49,5,50,7,8,9],4:[0,1,2,28,3,31,32,35,4,43,44,45,46,47,48,49,5,50,6,7,8,9],5:[0,1,10,2,27,28,29,3,4,44,45,46,47,48,49,5,6,7,8,9],6:[0,1,10,11,2,26,28,29,3,30,4,45,46,47,48,49,5,6,7,8,9],7:[0,1,10,11,2,27,28,29,3,30,4,44,45,46,47,48,49,5,6,7,8,9],8:[0,1,10,11,2,27,3,4,42,43,44,45,46,47,48,49,5,6,7,8,9],9:[0,1,10,11,12,2,27,3,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,6,7,8,9],10:[0,1,10,11,12,2,3,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,6,7,8,9],11:[0,1,10,11,12,2,3,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,6,7,8,9],12:[0,1,10,11,2,26,3,33,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,6,7,8,9],13:[0,1,10,11,12,13,2,27,3,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,6,7,8,9],14:[0,1,10,11,12,13,2,3,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,6,7,8,9],15:[0,1,10,11,12,13,14,2,3,31,32,34,35,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,7,8,9],16:[0,1,10,11,12,2,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,7,8,9],17:[0,1,10,11,12,2,25,27,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,7,8,9],18:[0,1,10,11,12,13,14,2,20,21,22,23,24,29,3,30,31,32,33,34,35,36,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,53,54,55,56,57,58,59,6,60,7,8,9],19:[0,1,10,11,12,13,14,15,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,33,34,35,36,39,4,40,41,42,43,44,45,46,47,48,49,5,50,53,54,55,56,57,58,59,6,60,7,8,9],20:[0,1,10,11,12,13,14,15,16,17,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,33,34,35,38,4,40,41,42,43,44,45,46,47,48,49,5,53,54,55,56,57,58,59,6,60,7,8],21:[0,1,11,12,13,14,16,17,2,21,24,25,26,27,28,29,3,30,31,32,33,34,35,4,40,41,42,43,44,47,48,51,52,53,54,55,56,57,58,59,6,7],22:[0,1,17,18,2,25,26,27,28,29,3,30,31,32,33,4,41,42,43,46,47,48,49,50,51,52,53,54,55,56,57,58,59,6,7],23:[0,1,18,2,26,27,28,29,3,30,31,32,4,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,7,8,9],24:[0,1,18,2,20,27,28,29,3,30,31,4,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],25:[0,1,2,20,28,29,3,30,31,4,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],26:[0,1,10,19,2,28,3,31,32,39,4,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],27:[0,1,10,18,19,2,3,34,35,39,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,7,8,9],28:[0,1,10,11,12,2,3,34,35,36,37,38,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,7,8,9],29:[0,1,10,11,12,13,2,24,3,30,33,34,35,36,37,38,4,46,47,48,5,57,58,6,7,8,9],30:[0,1,10,11,12,13,2,24,29,3,32,33,34,35,36,37,38,39,4,40,45,46,5,50,6,7,8,9],31:[0,1,10,11,12,13,14,2,3,32,33,34,35,36,37,38,39,4,40,41,42,5,6,7,8,9],32:[0,1,10,11,12,13,14,2,20,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,5,6,7,8,9],33:[0,1,10,11,12,13,14,2,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,5,55,56,6,7,8,9],34:[0,1,10,11,12,13,14,2,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,53,54,55,56,6,7,8,9],35:[0,1,10,11,12,13,14,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,52,53,54,55,56,57,6,7,8,9],36:[0,1,10,11,12,13,14,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,53,54,55,56,57,6,7,8,9],37:[0,1,10,11,12,13,14,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,55,56,57,6,7,8,9],38:[0,1,10,11,12,13,14,2,22,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,56,6,7,8,9],39:[0,1,10,11,12,13,14,15,2,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,57,6,7,8,9],40:[0,1,10,11,12,13,14,15,16,2,22,27,28,29,3,30,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,56,57,58,6,7,8,9],41:[0,1,10,11,12,13,14,15,16,2,22,28,29,3,30,31,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,56,57,58,6,7,8,9],42:[0,1,10,11,12,13,14,15,16,2,28,3,30,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,56,57,58,6,7,8,9],43:[0,1,10,11,12,13,14,15,2,28,3,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,52,53,54,57,58,6,7,8,9],44:[0,1,10,11,12,13,14,15,2,21,22,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,53,54,6,7,8,9],45:[0,1,10,11,12,13,14,15,2,20,24,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,56,6,7,8,9],46:[0,1,10,11,12,13,14,15,2,3,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,57,6,7,8,9],47:[0,1,10,11,12,13,14,15,2,3,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,58,6,7,8,9],48:[0,1,10,11,12,13,14,15,16,2,3,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,7,8,9],49:[0,1,10,11,12,13,14,15,16,2,29,3,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,7,8,9],50:[0,1,10,11,12,13,14,15,16,2,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,6,7,8,9],51:[0,1,10,11,12,13,14,15,16,2,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,6,7,8,9],52:[0,1,10,11,12,13,14,15,16,2,25,26,27,28,3,30,31,32,33,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,6,7,8,9],53:[0,1,10,11,12,13,14,15,2,25,26,27,28,29,3,30,31,32,33,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,6,7,8,9],54:[0,1,10,11,12,13,14,15,16,2,25,26,27,28,29,3,30,31,32,33,34,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,6,7,8,9],55:[0,1,10,11,12,13,14,15,16,2,25,26,27,28,29,3,30,31,32,33,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,6,7,8,9],56:[0,1,10,11,12,13,14,15,16,2,24,25,26,27,28,29,3,30,31,33,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,6,7,8,9],57:[0,1,10,11,12,13,14,15,2,23,24,25,26,27,28,29,3,30,31,34,35,36,37,38,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,6,7,8,9],58:[0,1,10,11,12,13,14,15,2,23,24,25,26,27,28,29,3,30,31,33,4,40,41,45,46,47,48,49,5,50,51,52,53,6,7,8,9],59:[0,1,10,11,12,13,14,15,2,25,26,27,28,29,3,30,31,32,33,36,4,41,42,43,44,45,46,47,48,49,5,50,53,54,6,7,8,9],60:[0,1,10,11,12,13,14,2,20,26,28,29,3,30,32,33,4,42,43,44,45,46,47,48,49,5,50,6,7,8,9],61:[0,1,11,12,13,14,2,21,22,23,26,27,28,29,3,30,31,32,33,34,35,4,43,44,45,46,47,48,49,8,9],62:[0,1,12,13,2,20,21,22,23,24,25,28,29,3,32,33,34,42,43,45,46,47,48,49,9],63:[0,1,2,21,23,24,25,28,29,30,31,42,46,47,48,49,50]},7:{0:[0,1,100,101,2,53,57,58,74,85,94,95,96,97,98],1:[0,1,100,2,46,55,56,57,58,59,64,85,94,95,96,97],2:[0,1,2,56,57,58,59,6,60,62,63,7,73,85,91,93,94,95,96],3:[0,1,2,5,57,58,59,6,60,7,70,85,86,88,93,95,96],4:[0,1,2,4,5,58,6,73,86,87,90,91,92,93,94,95,97,98],5:[0,1,11,15,16,2,3,4,5,6,60,7,72,86,87,90,91,92,93,94,95,96,97,98,99],6:[0,1,10,11,14,15,16,2,3,4,5,6,60,65,66,7,72,87,88,89,90,91,92,93,94,95,96,97,98,99],7:[0,1,100,14,15,17,18,19,2,3,4,5,56,57,6,60,63,64,65,71,72,87,88,89,90,91,92,93,94,95,96,97,98,99],8:[0,1,10,100,11,16,17,18,19,2,3,4,5,56,6,62,64,7,70,71,87,88,89,9,90,91,92,93,94,95,96,97,98,99],9:[0,1,10,100,11,12,15,16,17,18,19,2,3,4,5,6,7,8,88,89,9,90,91,92,93,94,95,96,97,98,99],10:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,3,4,5,55,57,58,59,6,7,8,89,9,90,91,92,93,94,95,96,97,98,99],11:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,3,4,5,55,58,6,7,8,9,90,91,92,93,94,95,96,97,98,99],12:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,3,4,5,53,57,58,6,7,8,9,90,91,92,93,94,95,96,97,98,99],13:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,3,4,5,56,57,58,6,61,7,8,9,90,91,92,93,94,95,96,97,98,99],14:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,3,4,5,56,57,58,6,60,7,8,89,9,90,91,92,93,94,95,96,97,98],15:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,55,56,57,6,7,8,88,89,9,90,91,92,93,94,95,96,97,98],16:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,55,6,7,8,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],17:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,54,55,6,7,8,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],18:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,55,6,7,8,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],19:[0,1,10,101,102,103,104,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,54,6,7,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],20:[0,1,10,100,101,102,103,104,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],21:[0,1,10,100,101,102,103,104,106,107,108,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,74,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],22:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,6,7,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],23:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,12,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,70,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],24:[0,1,10,100,101,102,104,105,106,107,108,109,11,110,111,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],25:[0,1,10,100,101,102,103,105,106,107,108,109,11,110,12,13,14,15,16,17,18,19,2,20,21,22,3,4,5,53,6,67,7,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],26:[0,1,10,100,101,102,103,105,106,107,108,109,11,110,111,112,12,13,14,15,16,17,18,19,2,20,21,22,25,3,4,5,54,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],27:[0,1,10,100,101,102,103,105,106,107,109,11,110,111,112,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],28:[0,1,10,100,101,102,103,104,105,106,107,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],29:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],30:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,3,4,5,6,69,7,70,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],31:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,29,3,4,5,6,63,64,68,69,7,70,71,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,92,93,94,95,96,97,98,99],32:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,63,68,69,7,70,71,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,9,93,94,95,96,97,98,99],33:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,65,67,68,69,7,71,72,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,9,93,94,95,96,97,98,99],34:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,9,92,93,94,95,96,97,98,99],35:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,51,54,6,60,61,62,63,64,66,67,68,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,96,97,98,99],36:[0,1,10,100,101,102,103,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,14,15,16,17,18,19,2,20,21,22,23,24,25,27,3,4,5,58,59,6,60,61,62,63,64,65,66,67,7,70,71,72,73,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],37:[0,1,10,100,101,102,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,15,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,41,42,43,44,45,46,47,48,49,5,58,59,6,60,61,62,63,64,65,66,67,68,7,70,71,72,73,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],38:[0,1,10,100,101,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,14,15,16,18,2,20,21,22,23,24,25,26,27,28,29,3,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,71,72,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],39:[0,1,10,100,106,107,108,109,11,110,111,114,115,116,117,118,119,12,120,121,14,15,16,17,2,20,21,22,23,24,25,26,27,28,29,3,30,31,39,4,40,41,42,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,71,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],40:[0,1,10,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,2,21,22,23,24,25,26,27,28,29,3,30,31,32,39,4,40,41,43,44,45,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,76,8,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],41:[0,1,10,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,2,21,22,23,24,25,26,27,28,29,3,30,31,32,33,34,4,40,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,7,70,76,8,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],42:[0,1,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,13,14,15,2,22,23,24,25,26,27,28,29,3,32,33,34,35,4,42,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,8,81,82,83,84,85,86,87,88,89,9,95,96],43:[0,1,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,2,3,33,34,35,4,42,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,8,82,83,84,85,86,87],44:[0,1,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,13,14,2,3,34,36,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,8,82,83,84,85,86,9,95,96,97,98,99],45:[0,1,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,13,14,15,2,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,7,8,82,83,9,93,94,95,96,97,98,99],46:[0,1,10,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,2,3,4,5,52,53,54,55,56,57,58,59,6,60,61,62,63,64,7,8,9,91,92,93,94,95,96,97,98,99],47:[0,1,10,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,13,14,15,16,17,18,2,3,36,4,5,54,55,56,57,58,59,6,60,61,62,63,7,8,9,90,91,92,93,94,95,96,97,98,99],48:[0,1,10,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,13,14,15,16,17,18,2,3,36,4,5,55,56,57,58,59,6,60,61,62,63,7,8,9,90,91,92,93,94,95,96,97,98,99],49:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,2,3,4,41,5,55,56,57,58,59,6,60,61,62,63,7,8,9,92,93,94,95,96,97,98,99],50:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,15,2,3,4,40,41,5,57,58,59,6,60,61,62,7,8,9,95,96,97,98,99],51:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,15,16,17,18,19,2,3,4,40,41,5,6,60,61,62,7,8,9,95,96,97,98,99],52:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,14,15,16,17,18,19,2,3,4,5,6,62,7,79,8,9,96,97,98,99],53:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,14,15,16,17,18,19,2,20,3,39,4,5,56,6,64,7,78,8,9,97,98,99],54:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,13,14,15,16,17,18,19,2,20,21,3,37,38,39,4,5,6,7,70,78,79,8,9,97,98,99],55:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,13,14,15,16,17,18,19,2,20,21,3,4,5,6,69,7,70,78,8,9,93,94,95,98,99],56:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,13,14,15,16,17,18,19,2,20,21,22,23,24,3,4,5,6,7,8,9,93,94,95,99],57:[0,1,10,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,12,13,14,15,16,17,18,19,2,20,21,22,23,3,4,5,6,69,7,71,72,74,76,8,9,93,94,95,96],58:[0,1,10,11,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,3,4,5,6,61,67,68,69,7,70,71,72,73,74,75,76,8,9,93,94,95,96],59:[0,1,10,11,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,49,5,6,66,67,68,69,7,70,71,72,73,74,8,9,94,95],60:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,48,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,78,79,8,80,81,9],61:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,5,58,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,9,91,92],62:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,83,9],63:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,9],64:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,9],65:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,3,4,40,5,6,63,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,89,9,90,91,92],66:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93],67:[0,1,10,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,6,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94],68:[0,1,10,108,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],69:[0,1,10,107,108,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],70:[0,1,10,104,107,108,109,11,110,111,112,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],71:[0,1,10,100,108,109,11,110,111,112,113,114,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],72:[0,1,10,100,107,108,109,11,110,112,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],73:[0,1,10,100,107,11,110,111,112,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],74:[0,1,10,100,11,111,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],75:[0,1,10,11,113,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],76:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,5,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],77:[0,1,10,11,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,45,5,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],78:[0,1,10,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],79:[0,1,10,11,114,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,54,55,56,57,58,59,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],80:[0,1,10,11,113,114,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,54,55,56,57,58,59,6,60,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97],81:[0,1,10,11,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,45,5,55,56,57,58,59,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],82:[0,1,10,100,101,102,103,11,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,45,5,6,61,62,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98],83:[0,1,10,100,101,102,103,104,105,11,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,56,58,6,61,62,68,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],84:[0,1,10,100,102,103,104,105,106,11,113,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,56,6,60,61,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],85:[0,1,10,104,105,106,107,11,113,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],86:[0,1,10,105,106,107,11,114,115,116,117,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,56,6,7,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],87:[0,1,10,100,106,107,108,11,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,7,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],88:[0,1,10,100,101,102,103,107,108,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,43,44,5,6,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],89:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,43,5,6,61,62,63,64,65,66,67,68,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],90:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,41,5,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],91:[0,1,10,100,101,102,103,11,112,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,49,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],92:[0,1,10,100,101,102,103,104,105,106,11,115,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,6,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],93:[0,1,10,100,101,102,103,104,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,66,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],94:[0,1,10,100,101,102,103,104,105,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],95:[0,1,10,100,101,102,103,104,105,106,108,11,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,6,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],96:[0,1,10,100,101,102,103,104,105,106,109,11,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,67,68,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],97:[0,1,10,100,101,102,103,104,105,106,107,108,11,110,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],98:[0,1,10,100,101,102,103,104,105,106,107,108,11,111,112,113,114,115,116,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,59,6,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],99:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],100:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,112,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],101:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,111,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,60,61,62,63,64,65,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],102:[0,1,10,100,101,102,103,104,105,106,107,108,109,11,110,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,61,62,63,64,65,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],103:[0,1,10,100,101,102,103,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,6,61,62,63,64,65,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],104:[0,1,10,100,101,102,103,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,50,51,52,53,54,55,56,6,60,61,62,63,64,65,7,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],105:[0,1,10,100,101,102,103,104,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,50,51,52,53,54,55,56,6,60,61,62,63,64,65,66,67,7,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],106:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,50,51,52,53,54,55,56,6,60,61,62,63,64,65,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],107:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,66,67,68,69,7,70,71,72,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],108:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,67,68,69,7,72,73,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],109:[0,1,10,100,101,102,103,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,73,74,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],110:[0,1,10,100,101,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,7,73,74,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],111:[0,1,10,100,101,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,51,52,53,54,55,56,57,58,59,6,60,61,62,63,64,65,66,7,76,77,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],112:[0,1,10,100,101,103,104,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,7,76,77,78,8,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],113:[0,1,10,100,101,102,103,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,32,4,49,5,50,51,52,53,54,55,56,57,58,6,60,61,62,63,67,7,75,76,77,78,79,8,80,81,82,83,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],114:[0,1,10,100,101,102,103,104,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,63,7,72,73,74,77,78,79,8,80,81,82,83,84,85,86,87,89,9,90,91,92,93,94,95,96,97,98,99],115:[0,1,10,100,101,102,103,105,106,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,31,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,59,6,60,61,62,68,69,7,70,71,8,80,81,82,83,84,85,9,90,91,92,93,94,95,96,97,98,99],116:[0,1,10,100,101,102,104,105,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,46,47,48,49,5,50,51,52,53,54,55,56,57,58,6,60,61,62,63,7,8,81,82,9,90,91,92,93,94,95,96,97,98,99],117:[0,1,10,100,101,104,105,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,49,5,50,51,52,53,54,55,56,57,58,6,60,61,62,63,66,67,7,8,82,9,90,91,92,93,94,95,96,97,98,99],118:[0,1,10,100,106,107,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,51,52,53,54,55,56,59,6,60,62,63,65,66,7,72,8,82,83,84,9,90,91,92,93,94,95,96,97,98,99],119:[0,1,10,100,108,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,30,4,5,55,56,6,60,61,62,66,7,8,84,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],120:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,29,3,4,40,5,52,56,57,59,6,60,61,66,7,8,85,86,87,88,89,9,90,91,92,93,94,95,96,97,98,99],121:[0,1,10,100,11,12,13,14,15,16,17,18,19,2,20,21,22,23,24,25,26,27,28,3,4,5,59,6,60,61,65,7,8,87,88,89,9,90,91,92,93,94,95,96,97,98,99],122:[0,1,16,17,18,19,2,23,24,25,26,27,28,3,4,42,5,56,6,60,68,7,8,87,88,89,9,90,91,92,93,94,95,96,97,98,99],123:[0,1,16,17,18,19,2,24,25,26,27,28,3,4,42,43,44,45,46,5,53,55,56,57,58,59,6,60,63,65,66,67,7,70,8,87,90,91,92,93,94,95,96,97,98,99],124:[0,1,18,19,2,24,25,26,27,3,4,41,42,45,46,47,5,56,57,59,6,65,66,67,69,90,91,92,93,94,95,96,97,98,99],125:[0,1,2,3,4,46,47,48,49,5,50,64,65,66,85,86,91,92,93,94,95,96,97,98,99],126:[0,1,2,3,4,47,48,49,50,56,57,59,61,63,85,92,93,94,95,96,97,98,99],127:[0,1,100,101,2,3,43,48,49,57,58,60,61,85,92,93,94,95,96,97,98]}};

tiles.uk_mask_regex = /uk_mask\/([0-9]+)\/([0-9]+)\/([0-9]+)\.png$/;
tiles.world_light_regex = /world_light\/([0-9]+)\/([0-9]+)\/([0-9]+)\.png$/;
tiles.world_dark_regex = /world_dark\/([0-9]+)\/([0-9]+)\/([0-9]+)\.png$/;

tiles.init = function(){
  if (url.parsed.queryKey.bg === 'chris') {
    tiles.world_regex = tiles.world_dark_regex
  } else {
    tiles.world_regex = tiles.world_light_regex
  }

}

module.exports = tiles;
},{"./url":43}],39:[function(require,module,exports){
// the timeline ui

var m = require('./mouse');
var data = require('./data');
var cursor = require('./cursor');
var geom = require('./geom');
var domq = require('./dom').q;
var loop = require('./anim_loop');
var map = require('./map');
var pin = require('./pin');
var url = require('./url');

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
var fillStyle = '#000';

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

  fillStyle = (url.parsed.queryKey.bg === 'chris') ? '#fff' : '#000';
  dom.ctx.fillStyle = fillStyle
  dom.el_date.style.color = fillStyle

  window.addEventListener('resize', function(){
    model.resize = true;
    model.dirty = true; 
  }); 

  loop.fns_render.push(timeline.render);
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
      pad_date = 4

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
    dom.ctx.fillStyle = fillStyle

    var style = dom.el.style;
    style.width = wpx;
    style.height = hpx;
    style.top = tpx;
    style.left = lpx;

    var date_height = h + pad_date + 0
    dom.el_date.style.top = date_height +'px';
    // timeline.date_left = l

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
      //var icon = marker_matches_year ? pin.icon_pink : pin.icon_html;

      for (var i=0, item; item=events[year][i]; i++){
      //  item.pin.setIcon(icon)
        // item.marker.setOpacity(opacity);
        // if (marker_matches_year) item.marker.openPopup();
        // else item.marker.closePopup();
      }
    }
};

timeline.proto = {};

module.exports = timeline;


},{"./anim_loop":3,"./cursor":12,"./data":13,"./dom":14,"./draw":15,"./geom":20,"./map":22,"./mouse":25,"./pin":27,"./timeline_model":40,"./url":43}],40:[function(require,module,exports){
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
},{}],41:[function(require,module,exports){
var domq = require('./dom').q;
var url = require('./url');

var metrics = require('./text_metrics');

var tau = Math.PI*2;

var title = 'We Raved Here';
var css_props = {font: '16px MaisonNeue', letterSpacing: '5px'};
var window_edge_pad = 10;
var fillStyle = '#000';

var dom = {};

var text_title = {};

text_title.init = function(){


  dom.canvas = domq('#text-title');
  dom.ctx = dom.canvas.getContext('2d');
  fillStyle = (url.parsed.queryKey.bg === 'chris') ? '#fff' : '#000';

  // console.log(url.parsed.queryKey)

  var text_wh = metrics.text_wh_dom(title, css_props);
  var xs = metrics.char_xs(title, css_props, parseInt(css_props.letterSpacing));

  var underline_w = 1;
  var underline_pad = 1;

  var w = dom.canvas.width = text_wh.h + 4;
  var h = dom.canvas.height = text_wh.w + 2;

  // console.log({w: xs[xs.length-1], h: wh.h});

  dom.ctx.fillStyle = fillStyle;

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
},{"./dom":14,"./text_metrics":37,"./url":43}],42:[function(require,module,exports){
// trying to integrate mouse and touch interaction
// 
//
// the reason to not use pure dom event listeners is that 
// often we are dealing with areas where touch interaction happens
// that aren't dom elements (eg a part of a canvas)
//
// warning... this code is really ugly, it needs a clean up, but has a bunch of subtle behaviour

// var m = require('./mouse');

var loop = require('./anim_loop');

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
  // console.log("down")
  var time = Date.now();
  for (var i=0, t; t=ts[i]; i++){
    var state = 
        touches.state[t.identifier] = 
        {down: true, 
         down_timestamp: time,
         x_down: t.clientX,
         y_down: t.clientY};

    for (var j=0, fns; fns=down_and_up_fns[j]; j++){
      // console.log(down_and_up_fns)
      if (fns.bounds_check_down && 
          fns.bounds_check_down(t.clientX, t.clientY, original_event, state)){
            // console.log("over", fns)
            state.fns = fns;
          }
    }

  }  
};

var touchstart = function(e){
  if (!('changedTouches' in e)) return;
  handle_touches_down(e.changedTouches, e)
};

var mousedown = function(e){
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
      delete touches.state.mouse.fns
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











var anim_loop = function(){

  for (var key in touches.state){
    var state = touches.state[key];
    if (state.down && state.fns && state.fns.anim_while_down) state.fns.anim_while_down(-1,-1, null, state)
  }

  // requestAnimationFrame(loop);

};








touches.init = function(){

  document.addEventListener('mousedown', mousedown);
  document.addEventListener('mouseup', mouseup);
  document.addEventListener('mousemove', mousemove);
  
  document.addEventListener("touchstart", touchstart);
  document.addEventListener("touchend", touchend);
  document.addEventListener("touchmove", touchmove);

  loop.fns_render.push(anim_loop)
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
},{"./anim_loop":3}],43:[function(require,module,exports){
var url = {};

url.init = function(){
  var u = url.parsed = url.parse(document.location);
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
},{}],44:[function(require,module,exports){


var xhr = {};

xhr.get = function(url, events){
  var xhr = new XMLHttpRequest();
  xhr.open("get", url);
  // if ('responseType' in events){
  //   xhr.responseType = events.responseType
  //   delete events.responseType
  // }
  for (var name in events) xhr.addEventListener(name, events[name])
  xhr.send();
};

module.exports = xhr;
},{}],45:[function(require,module,exports){
// the zoom ui

var m = require('./mouse');
var cursor = require('./cursor');
var touches = require('./touches');

var geom = require('./geom');
var domq = require('./dom').q;
var url = require('./url');

var map = require('./map');
var loop = require('./anim_loop');
var draw = require('./draw');

var model = require('./zoom_model');

var zoom = {};

var dom = {};

var fillStyle = '#000';

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

  fillStyle = (url.parsed.queryKey.bg === 'chris') ? '#fff' : '#000';
  dom.ctx.fillStyle = fillStyle

  touches.down_and_up(touches_button_zoomin);
  touches.down_and_up(touches_button_zoomout);
  touches.down_and_up(touches_scale);

  window.addEventListener('resize', function(){
    model.resize = true;
    model.dirty = true; 
  });

  map.leaflet.on('zoomend', function(e){
    // var zoom = map.leaflet.getZoom();
    model.dirty = true;
  });

  loop.fns_render.push(zoom.render);

};

zoom.render = function(){

  // console.log(model.step, map.leaflet.getZoom())

  if (!model.dirty) return;
  model.dirty = false

  model.step = map.leaflet.getZoom();

  var w = 25, h = 200
    , wpx = w + 'px', hpx = h + 'px'
    , l = 10, t = ((window.innerHeight / 2 - h / 2)|0)
    , lpx = l + 'px', tpx = t + 'px'
    , button_w = w
    , scale_h = h - button_w*2
    , pad = (w * 0.3)|0
    , mid = (w/2)|0

  // only recalc bounds and position if necessary
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
    dom.ctx.fillStyle = fillStyle
    
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

  // "unit" height where each unit is one chunk of a slider
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
},{"./anim_loop":3,"./cursor":12,"./dom":14,"./draw":15,"./geom":20,"./map":22,"./mouse":25,"./touches":42,"./url":43,"./zoom_model":46}],46:[function(require,module,exports){
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
},{"./map":22}]},{},[21])
;