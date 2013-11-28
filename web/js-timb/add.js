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