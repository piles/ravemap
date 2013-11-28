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