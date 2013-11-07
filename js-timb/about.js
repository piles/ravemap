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