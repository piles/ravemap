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