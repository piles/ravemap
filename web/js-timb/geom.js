var geom = {};

geom.init

geom.bounds_hit_test = function(b, x, y){
  if (typeof b === 'undefined') return false;
  // console.log(x, y, b.x1, b.y1, b.x2, b.y2);
  if (x > b.x1 && 
      x < b.x2 && 
      y > b.y1 && 
      y < b.y2   ) return true;
      return false;
};


local_xy_to_canvas_xy = function(model, x, y){
  
}

local_xy_to_window_xy = function(model, x, y){
  x = model.l + x;
  y = model.t + y;
  return {x:x, y:y};
}

window_xy_to_local_xy = function(model, x, y){
  
}

module.exports = geom;