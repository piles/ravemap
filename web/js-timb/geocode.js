var geocode = {};

var gmap_geo = new google.maps.Geocoder();

geocode.from_address = function(txt) {
  var opts = {
    region: 'uk',
    address: txt
  };
  gmap_geo.geocode( opts, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      console.log(results)
    } else {
      console.log("Geocode was not successful for the following reason: " + status);
    }
  });
}

module.exports = geocode;