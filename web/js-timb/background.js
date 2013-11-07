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
  dom.el.style.backgroundImage = "url(img/bg/checkers-light.gif)";
}




module.exports = background;