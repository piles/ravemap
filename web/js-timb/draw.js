var draw = {};

draw.line_h = function(ctx, x,y, w,h, pad){
  pad = pad||0;
  var mid = (h/2)|0;
  // ctx.fillStyle = '#000';
  ctx.fillRect(x+pad,y+mid, w-pad*2, 1);
};

draw.line_v = function(ctx, x,y, w,h, pad){
  pad = pad||0;
  var mid = (w/2)|0;
  // ctx.fillStyle = '#000';
  ctx.fillRect(x+mid,y+pad, 1,h-pad*2)
};

draw.plus = function(ctx, x,y, w,h, pad){
  draw.line_v(ctx, x,y, w,h, pad);
  draw.line_h(ctx, x,y, w,h, pad);
};

draw.rect = function(ctx, x,y, w,h, pad){
  pad = pad||0;
  draw.edge.t(ctx, x,y, w,h, pad);
  draw.edge.b(ctx, x,y, w,h, pad);
  draw.edge.l(ctx, x,y, w,h, pad);
  draw.edge.r(ctx, x,y, w,h, pad);
};

draw.edge = {};
draw.edge.t = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(0,0, w,1);
};
draw.edge.b = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(0,h-1, w,1);
};
draw.edge.l = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(0,0, 1,h);
};
draw.edge.r = function(ctx, x,y, w,h, pad){
  // ctx.fillStyle = '#000';
  ctx.fillRect(w-1,0, 1,h);
};


module.exports = draw;