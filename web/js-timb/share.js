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