// functions for setting mouse cursor state, because the css:hover method is pretty bad

var m = require('./mouse');
var geom = require('./geom');

var cursor = {};

cursor.state = 'default';

cursor.set = function(c){
  var css_class = 'cursor-' + c
  // var css_class_old = 'cursor-' + cursor.state
  document.body.classList.remove(cursor.state)
  document.body.classList.add(css_class)

  // console.log(c)
  cursor.state = css_class;
  // document.body.style.cursor = c;
};

cursor.init = function(){
  window.addEventListener('mousemove', function(e){
    cursor.check_cursor_bounds();
  });
};

cursor.bounds = {};
cursor.check_cursor_bounds = function(){
  var x =m.x, y =m.y;

  for (var key in cursor.bounds){ var cb = cursor.bounds[key];
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