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