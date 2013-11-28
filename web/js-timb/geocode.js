var geocode = {};

var gmap_geo = new google.maps.Geocoder();

geocode.from_address = function(txt, fn) {
  var opts = {
    region: 'uk',
    address: txt
  };
  gmap_geo.geocode( opts, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) 
      fn(results);
    // else
    //   console.log("Geocode was not successful for the following reason: " + status);
  });
};

geocode.from_latlng = function(lat, lng, fn){
  var latlng = new google.maps.LatLng(lat, lng);
  var opts = {
    region: 'uk',
    latLng: latlng
  };
  gmap_geo.geocode( opts, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) 
      fn(results);
    // else
    //   console.log("Geocode was not successful for the following reason: " + status);
  });  
}

module.exports = geocode;