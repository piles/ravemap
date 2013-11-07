var url = require('./url');
var data = require('./data');
var text2el = require('./dom').text2el;
var soundcloud = require('./soundcloud');

var map = {};
map.tile_size = 256;
map.markers = [];

map.init = function(){

  map.leaflet = L.map('map', {
      minZoom: 3,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: false,
      zoomAnimation: false,
      inertia: false
  });

  map.ui_map_pane = document.querySelector('.leaflet-map-pane');

  // var southWest = new L.LatLng(49.95121990866206, -10.634765625),
  //     northEast = new L.LatLng(60.6301017662667, 2.4609375),
  var southWest = new L.LatLng(50.680797145321655, -9.20654296875),
      northEast = new L.LatLng(57.645400667406605, 0.98876953125),
      bounds = new L.LatLngBounds(southWest, northEast);

  map.leaflet.fitBounds(bounds);

  // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
 map.layer_uk_mask = L.tileLayer(url.tile_server + 'uk_mask/{z}/{x}/{y}.png', {tms: true, opacity: 0.0}).addTo(map.leaflet);
 map.layer_world = L.tileLayer(url.tile_server + 'world/{z}/{x}/{y}.png', {tms: true}).addTo(map.leaflet);
  marker_init();

};



var open_player = null;
var open_player_data = null;

var marker_popup = function(e){
  // console.log(e, e.target)

/*
  map.leaflet.closePopup();

  if (open_popup === e.target.data){
    open_popup = null;
    return;    
  }
*/
  // if (map.leaflet._popup){
    // open_popup = null;
    // return;
  // }

  // console.log(e.target)

  // var anchor = L.point(e.target.options.icon.options.popupAnchor || [0, 0]);
  // anchor = anchor.add(L.Popup.prototype.options.offset);

  // var anchor = L.point([]);

  var content = "<div class='soundcloud-popup'>" + 
  "<h2>We Raved Here:</h2>" +
  "<h3>" + e.target.data.venue + "</h3>" +
  "<a href='" + e.target.data.url + "' class='sc-player'>soundcloud set</a>" +
  "</div>"

  // var options = {offset:anchor};

  if (open_player) map.leaflet.removeLayer(open_player);
  if (open_player_data === e.target.data){
    open_player_data = null;
    return
  }

  open_player = new soundcloud.leaflet_layer(e.target._latlng, content)
  open_player_data = e.target.data;

  map.leaflet.addLayer(open_player);
  return

/*
  map.leaflet.openPopup(content, e.target._latlng, {

  // map.leaflet.openPopup(e.target.data.venue, e.target._latlng, {
    offset: anchor
  });
  
  $('a.sc-player, div.sc-player').scPlayer();


  open_popup = e.target.data;  
*/
}

var marker_init = function(){

  var icon_path = './img/map/'
  map.icon_blue = L.icon({
      iconUrl: icon_path+'marker-icon.png',
      iconRetinaUrl: icon_path+'marker-icon-2x.png',
      shadowUrl: icon_path+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  map.icon_blue_small = L.icon({
      iconUrl: icon_path+'marker-icon.png',
      iconRetinaUrl: icon_path+'marker-icon-2x.png',
      shadowUrl: icon_path+'marker-shadow.png',
      iconSize: [25*0.6, 41*0.6],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41*0.6, 41*0.6]
  });

  map.icon_pink = L.icon({
      iconUrl: icon_path+'marker-icon-pink.png',
      iconRetinaUrl: icon_path+'marker-icon-pink-2x.png',
      shadowUrl: icon_path+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  for (var iy=0, item_year; item_year=data[iy]; iy++){
    var year = item_year.year;
    var events = item_year.data.events;
    if (!(year in events)) continue;
    for (var i=0, item; item=events[year][i]; i++){
      // var latlng = L.LatLng(parseFloat(item.latitude), parseFloat(item.longitude));
      var marker = L.marker([parseFloat(item.latitude), parseFloat(item.longitude)], {
        riseOnHover: true,
        icon: map.icon_blue_small
      });
      marker.on('click', marker_popup);
      marker.data = item;
      // marker.bindPopup(item.venue);
      marker.addTo(map.leaflet);
      map.markers.push(marker);
      item.marker = marker;
    }
  }
}

module.exports = map;
