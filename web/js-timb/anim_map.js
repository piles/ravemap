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