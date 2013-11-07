// Generated by CoffeeScript 1.6.3
(function() {
  window.Mouse = {
    x: -1,
    y: -1,
    xs: -1,
    ys: -1,
    xa: -1,
    xb: -1,
    ya: -1,
    yb: -1,
    up: true,
    down: false,
    clicks: 0,
    events: {
      up: function(e) {
        Mouse.up = true;
        Mouse.down = !Mouse.up;
        return Mouse.clicks++;
      },
      down: function(e) {
        e.preventDefault();
        Mouse.down = true;
        return Mouse.up = !Mouse.down;
      },
      move: function(e) {
        if ('touches' in e) {
          e.preventDefault();
          e = e.touches[0];
        }
        if (e.pageX === Mouse.x || e.pageY === Mouse.y) {
          return;
        }
        Mouse.x = Math.round(e.pageX - window.innerWidth / 2);
        Mouse.y = Math.round(e.pageY - window.innerHeight / 2);
        Mouse.xs = (Mouse.x + Mouse.xb) * 0.5;
        Mouse.ys = (Mouse.y + Mouse.yb) * 0.5;
        Mouse.xb = Mouse.x;
        return Mouse.yb = Mouse.y;
      }
    }
  };

  window.addEventListener('mousedown', Mouse.events.down, false);

  window.addEventListener('mouseup', Mouse.events.up, false);

  window.addEventListener('mousemove', Mouse.events.move, false);

  window.addEventListener('touchstart', Mouse.events.down, false);

  window.addEventListener('touchend', Mouse.events.up, false);

  window.addEventListener('touchmove', Mouse.events.move, false);

}).call(this);

/*
//@ sourceMappingURL=mouse.map
*/
