var data = require('./data');
var url = require('./url');
var map = require('./map');
var player = require('./player');
var hash_djb2 = require('./text').hash_djb2;

var pin = {};

var path_pin = './img/map/'
var path_pin_anim = './img/pins/';


var pin_anim_make = function(url){
  return new L.DivIcon({
    html: '<img src="./img/pins/strokeoverlay.png" class=pin-anim-overlay>' +
          '<img src="' + url + '" class=pin-anim-bg>',
    className: 'pin-anim',
    iconAnchor: [15, 50]
  });
};

var pin_url_from_id = function(id){
  var hash = hash_djb2(id);
  // console.log(hash, hash % pin.icons_anim.length)
  return pin.icons_anim[hash % pin.icons_anim.length]
}

pin.init = function(){


  pin.icon_blue = L.icon({
      iconUrl: path_pin+'marker-icon.png',
      iconRetinaUrl: path_pin+'marker-icon-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  pin.icon_blue_small = L.icon({
      iconUrl: path_pin+'marker-icon.png',
      iconRetinaUrl: path_pin+'marker-icon-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      iconSize: [25*0.6, 41*0.6],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41*0.6, 41*0.6]
  });

  pin.icon_pink = L.icon({
      iconUrl: path_pin+'marker-icon-pink.png',
      iconRetinaUrl: path_pin+'marker-icon-pink-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  pin.icon_geocode = L.icon({
      iconUrl: path_pin+'marker-icon-pink-2x.png',
      // iconRetinaUrl: path_pin+'marker-icon-pink-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      // iconSize: [50, 82],
      // iconAnchor: [25, 82],
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });

  pin.icon_geocode2 = new L.IconAnim({
      animUrl: './img/pins/blue_1.gif',
      // iconUrl: path_pin+'marker-icon-pink-2x.png',
      iconUrl: './img/pins/strokeoverlay.png',
      // iconRetinaUrl: path_pin+'marker-icon-pink-2x.png',
      shadowUrl: path_pin+'marker-shadow.png',
      // iconSize: [50, 82],
      // iconAnchor: [25, 82],
      iconSize: [30, 50],
      iconAnchor: [15, 50],
      popupAnchor: [1, -34],
      shadowAnchor: [12, 41],
      shadowSize: [41, 41]
  });

  pin.icons_anim = [];
  for (var i=1; i<17; i++){
    pin.icons_anim.push(pin_anim_make(path_pin_anim + 'red_' + i + '.gif'));
    pin.icons_anim.push(pin_anim_make(path_pin_anim + 'green_' + i + '.gif'));
    pin.icons_anim.push(pin_anim_make(path_pin_anim + 'blue_' + i + '.gif'));
  }

  pin.data_onto_map();

  pin.geocode = L.marker([0,0], {
      icon: pin.icon_geocode,
      draggable: true
  });

  pin.geocode.on('dragend', function(e){
    geocode.from_latlng(e.target._latlng.lat, e.target._latlng.lng, pin.geocode_fn)
  });

  pin.geocode_fn = function(results){ console.log(results) };

};

pin.data_onto_map = function(){

/*
  var marker_cluster = L.markerClusterGroup({
    // disableClusteringAtZoom: 7,
    // animateAddingMarkers: true,
    maxClusterRadius: 35
    // zoomToBoundsOnClick: false
  });
*/
    
  /*
    for (var i = 0; i < addressPoints.length; i++) {
      var a = addressPoints[i];
      var title = a[2];
      var marker = L.marker(new L.LatLng(a[0], a[1]), { title: title });
      marker_cluster.bindPopup(title);
      marker_cluster.addLayer(marker);
    }
  */
    

  for (var iy=0, item_year; item_year=data[iy]; iy++){
    var year = item_year.year;
    var events = item_year.data.events;
    if (!(year in events)) continue;
    for (var i=0, item; item=events[year][i]; i++){
      // var latlng = L.LatLng(parseFloat(item.latitude), parseFloat(item.longitude));
      // var p = L.marker([parseFloat(item.latitude), parseFloat(item.longitude)], {

      // cluster
/*

      var p = new L.MarkerAnim([parseFloat(item.latitude), parseFloat(item.longitude)], {
        riseOnHover: true,
        //icon: pin.icon_html //pin.icon_geocode2
        icon: pin_url_from_id(item.id)
      });
      p.on('click', player.popup);
      p.data = item;
      item.pin = p;
      marker_cluster.addLayer(p);
      map.pins.push(p);
*/
      // no-cluster

      var p = new L.MarkerAnim([parseFloat(item.latitude), parseFloat(item.longitude)], {
        riseOnHover: true,
        //icon: pin.icon_html //pin.icon_geocode2
        icon: pin_url_from_id(item.id)
      });
      p.on('click', player.open);
      p.data = item;
      item.pin = p;
      // marker.bindPopup(item.venue);
      p.addTo(map.leaflet);
      map.pins.push(p);
      
    
      

    }
  }

  //   marker_cluster.on('clusterclick', function (a) {
  //     a.layer.spiderfy();
  //   });
  // map.leaflet.addLayer(marker_cluster);


}

// map.removeLayer(marker)

pin.geocode_place = function(lat, lng){

  if (!pin.geocode._map) pin.geocode.addTo(map.leaflet)

  pin.geocode.setLatLng([lat, lng])

};

pin.geocode_remove = function(){
  map.leaflet.removeLayer(pin.geocode);
}

//pin.geocode

module.exports = pin;