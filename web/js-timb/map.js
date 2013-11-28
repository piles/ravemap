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
