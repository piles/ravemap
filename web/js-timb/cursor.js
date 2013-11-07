var m = require('./mouse');
var geom = require('./geom');

var cursor = {};

cursor.state = 'default';

cursor.set = function(c){
  cursor.state = c;
  document.body.style.cursor = c;
};

cursor.init = function(){
  window.addEventListener('mousemove', function(e){
    cursor.check_cursor_bounds();
  });
};

cursor.bounds = {};
cursor.check_cursor_bounds = function(){
  var x =m.x, y =m.y;

  for (key in cursor.bounds){ var cb = cursor.bounds[key];
    if (geom.bounds_hit_test(cb, x, y)) {
      if (m.down && 'mousedown' in cb){
        cursor.set(cb.mousedown)
        return;
      }
      if ('mouseover' in cb){
        cursor.set(cb.mouseover)
        return;
      }
    }
  }

  cursor.set('default');

};

module.exports = cursor;