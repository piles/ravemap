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