// Generated by CoffeeScript 1.4.0

/*
  Author: Chris Shier
  Website: http://csh.bz
  Date: October 1st 2013
*/


(function() {
  var FRAME, NOW, PI, TIME, abs, between, centerContextOrigin, clear, clearBlack, clearWhite, cos, decay, degToRad, hsla, hyp, imageSmoothing, initCanvas, interpolate, paintEdges, radToDeg, rainbow, resetContextOrigin, rgba, sin, sizeCanvas, sizeCanvasesToWindow, tan;

  (function() {
    var i, lastTime, vendors, w, _i, _ref;
    w = window;
    lastTime = 0;
    vendors = ['webkit', 'moz'];
    if (!w.requestAnimationFrame) {
      for (i = _i = 0, _ref = vendors.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        w.requestAnimationFrame = w["" + vendors[i] + "RequestAnimationFrame"];
        w.cancelAnimationFrame = w["" + vendors[i] + "CancelAnimationFrame"] || w["" + vendors[i] + "CancelRequestAnimationFrame"];
      }
    }
    if (!w.requestAnimationFrame) {
      w.requestAnimationFrame = function(callback, element) {
        var currTime, id, timeToCall;
        currTime = new Date().getTime();
        timeToCall = Math.max(0, 16 - (currTime - lastTime));
        id = w.setTimeout(function() {
          return callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!w.cancelAnimationFrame) {
      return w.cancelAnimationFrame = function(id) {
        return clearTimeout(id);
      };
    }
  })();

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
    clicks: 1,
    events: {
      up: function(e) {
        Mouse.up = true;
        Mouse.down = !Mouse.up;
        return Mouse.clicks++;
      },
      down: function(e) {
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

  hyp = function(a, b) {
    return Math.sqrt(a * a + b * b);
  };

  initCanvas = function() {
    window.canvas_bg = document.createElement('canvas');
    window.ctx_bg = canvas_bg.getContext('2d');
    window.canvas = document.createElement('canvas');
    window.ctx = canvas.getContext('2d');
    window.b_canvas = document.createElement('canvas');
    window.b_ctx = b_canvas.getContext('2d');
    sizeCanvas(b_canvas, 512, 512);
    centerContextOrigin(b_ctx);
    sizeCanvasesToWindow();
    return window.addEventListener('resize', sizeCanvasesToWindow, false);
  };

  sizeCanvasesToWindow = function() {
    var canvasCopy, contextCopy, d, e, g, height, oh, ow, w, width;
    resetContextOrigin(ctx);
    resetContextOrigin(b_ctx);
    w = window;
    d = document;
    e = d.documentElement;
    g = d.getElementsByTagName('body')[0];
    width = w.innerWidth || e.clientWidth || g.clientWidth;
    height = w.innerHeight || e.clientHeight || g.clientHeight;
    ow = canvas.width;
    oh = canvas.height;
    canvasCopy = document.createElement('canvas');
    contextCopy = canvasCopy.getContext('2d');
    canvasCopy.width = ow;
    canvasCopy.height = oh;
    sizeCanvas(canvas, width, height);
    sizeCanvas(canvas_bg, width, height);
    centerContextOrigin(ctx);
    return centerContextOrigin(b_ctx);
  };

  sizeCanvas = function(canvas, width, height) {
    canvas.w_FLOAT = width;
    canvas.h_FLOAT = height;
    canvas.width = width;
    canvas.height = height;
    canvas.top = -height / 2;
    canvas.right = width / 2;
    canvas.bottom = height / 2;
    return canvas.left = -width / 2;
  };

  centerContextOrigin = function(context) {
    context.restore();
    context.translate(context.canvas.w_FLOAT / 2, context.canvas.h_FLOAT / 2);
    return context.save();
  };

  resetContextOrigin = function(context) {
    context.restore();
    context.translate(context.canvas.left, context.canvas.top);
    return context.save();
  };

  initCanvas();

  TIME = 0;

  NOW = Date.now();

  FRAME = 0;

  PI = Math.PI;

  sin = function(a) {
    return Math.sin(a);
  };

  cos = function(a) {
    return Math.cos(a);
  };

  tan = function(a) {
    return Math.tan(a);
  };

  abs = function(a) {
    return Math.abs(a);
  };

  hyp = function(a, b) {
    return Math.sqrt(a * a + b * b);
  };

  radToDeg = function(rad) {
    return rad / (Math.PI / 180);
  };

  degToRad = function(deg) {
    return deg * (Math.PI / 180);
  };

  between = function(min, x, max) {
    return Math.min(Math.max(x, min), max);
  };

  interpolate = function(a, b, t) {
    return a * (1 - t) + b * t;
  };

  rgba = function(r, g, b, a) {
    if (r == null) {
      r = 255;
    }
    if (g == null) {
      g = 0;
    }
    if (b == null) {
      b = 255;
    }
    if (a == null) {
      a = 1;
    }
    r = between(0, r | 0, 255);
    g = between(0, g | 0, 255);
    b = between(0, b | 0, 255);
    a = between(0, a, 1);
    return "rgba( " + r + ", " + g + ", " + b + ", " + a + ")";
  };

  hsla = function(h, s, l, a) {
    if (h == null) {
      h = 0;
    }
    if (s == null) {
      s = 100;
    }
    if (l == null) {
      l = 50;
    }
    if (a == null) {
      a = 1;
    }
    h = (h | 0) % 360;
    s = between(0, s, 100);
    l = between(0, l, 100);
    a = between(0, a, 1);
    return "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")";
  };

  clear = function(context) {
    return context.clearRect(context.canvas.left, context.canvas.top, context.canvas.width, context.canvas.height);
  };

  clearWhite = function(context) {
    context.fillStyle = 'white';
    return context.fillRect(context.canvas.left, context.canvas.top, context.canvas.width, context.canvas.height);
  };

  clearBlack = function(context) {
    context.fillStyle = 'black';
    return context.fillRect(context.canvas.left, context.canvas.top, context.canvas.width, context.canvas.height);
  };

  rainbow = function(a, offset) {
    var b, g, r;
    if (offset == null) {
      offset = 1;
    }
    r = sin(a + 0 * PI / 3 * offset) * 127 + 128;
    g = sin(a + 2 * PI / 3 * offset) * 127 + 128;
    b = sin(a + 4 * PI / 3 * offset) * 127 + 128;
    return rgba(r, g, b, 1);
  };

  decay = function(context, h, v, s, r) {
    var dh, dw, dx, dy;
    context.save();
    context.translate(h, v);
    if (r !== 0) {
      context.rotate(r);
    }
    dx = -(context.canvas.width + s) / 2;
    dy = -(context.canvas.height + s) / 2;
    dw = context.canvas.width + s;
    dh = context.canvas.height + s;
    context.drawImage(context.canvas, dx, dy, dw, dh);
    return context.restore();
  };

  imageSmoothing = function(context, a) {
    if (context == null) {
      context = ctx;
    }
    if (a == null) {
      a = false;
    }
    context.webkitImageSmoothingEnabled = a;
    context.mozImageSmoothingEnabled = a;
    return context.imageSmoothingEnabled = a;
  };

  paintEdges = function(context, fillStyle, size) {
    var canvas;
    if (size == null) {
      size = 1;
    }
    canvas = context.canvas;
    context.fillStyle = fillStyle;
    context.fillRect(canvas.left, canvas.top, canvas.width - size, size);
    context.fillRect(canvas.right - size, canvas.top, size, canvas.height - size);
    context.fillRect(canvas.left + size, canvas.bottom - size, canvas.width - size, size);
    return context.fillRect(canvas.left, canvas.top + size, size, canvas.height - size);
  };

  window.loop_chris = function() {
    var r3, s, size, x, y;
    FRAME++;
    imageSmoothing(ctx, false);
    imageSmoothing(b_ctx, false);
    paintEdges(b_ctx, rainbow(FRAME / 60 + PI / 2, sin(FRAME / 300) * 0.25 + 1), 1);
    s = 5.6 / 7;
    x = Mouse.x / window.innerWidth;
    y = Mouse.y / window.innerHeight;
    r3 = Mouse.clicks + FRAME / 999999;
    decay(b_ctx, -cos(FRAME / 940) * s - x, sin(FRAME / 941) * s - y, -12, -PI - 0.0105 - r3);
    decay(b_ctx, sin(FRAME / 942) * s + x, -cos(FRAME / 943) * s + y, 10, PI + 0.0064 + r3);
    ctx.clearRect(canvas.left, canvas.top, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-out';
    resetContextOrigin(b_ctx);
    size = b_canvas.width / (PI * 2);
    ctx.drawImage(b_canvas, size, size, b_canvas.width - size * 2, b_canvas.height - size * 2, canvas.left, canvas.top, canvas.width, canvas.height);
    centerContextOrigin(b_ctx);
    return ctx.globalCompositeOperation = 'destination-over';
  };

  window.loop_chris_bg = function() {
    var i, _i, _j, _ref, _ref1, _results;
    ctx_bg.clearRect(0, 0, canvas_bg.width, canvas_bg.height);
    ctx.globalCompositeOperation = 'destination-over';
    for (i = _i = 0, _ref = canvas_bg.width; _i <= _ref; i = _i += 30) {
      ctx_bg.fillStyle = "hsla(" + (i - FRAME / 4 % 30) + ", 100%, 50%, 1)";
      ctx_bg.fillRect((i - FRAME / 4 % 30) + 30, 0, 3, canvas_bg.height);
    }
    _results = [];
    for (i = _j = 0, _ref1 = canvas_bg.height; _j <= _ref1; i = _j += 30) {
      ctx_bg.fillStyle = "hsla(" + (i + FRAME / 4 % 30) + ", 100%, 50%, 1)";
      _results.push(ctx_bg.fillRect(0, i + FRAME / 4 % 30, canvas_bg.width, 3));
    }
    return _results;
  };

}).call(this);