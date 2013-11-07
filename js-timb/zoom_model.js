var map = require('./map');

var model = {};

model.init = function(){
  model.min = map.leaflet.getMinZoom()
  model.max = map.leaflet.getMaxZoom()
  model.step = map.leaflet.getZoom()

  model.mouseover = false;
  model.dirty = true;
  model.resize = true;

  model.range = d3.range(model.max, model.min-1, -1);
  model.scale = d3.scale.quantize().range(model.range) 

};

module.exports = model;