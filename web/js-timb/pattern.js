// the pattern inside popup tails

var patterns = [];

var popup_tail_fill_pattern_create = function(){
  // var patterns = [];
  if (patterns.length) return patterns;

  var size = 8
    , s2 = size*2
    , speed = 1
    , color_1 = '#000'
    , color_2 = '#222'

  var src_canvas = document.createElement('canvas')
    , src_ctx = src_canvas.getContext('2d')

  src_canvas.width = src_canvas.height = s2;

  src_ctx.fillStyle = color_1;
  src_ctx.fillRect(0,0, size,size)
  src_ctx.fillRect(size,size, size,size)
  src_ctx.fillStyle = color_2;
  src_ctx.fillRect(size,0, size,size)
  src_ctx.fillRect(0,size, size,size)

  for (var i=0, l=size/speed; i<l; i++){
    // tmp_ctx.clearRect(0,0,size,size)
    var tmp_canvas = document.createElement('canvas')
    tmp_canvas.width = tmp_canvas.height = s2;
    var tmp_ctx = tmp_canvas.getContext('2d')

    tmp_ctx.drawImage(src_canvas, i,i,s2-i,s2-i, 0,0,s2-i,s2-i)
    if (i > 0){
      tmp_ctx.drawImage(src_canvas, i,0,s2-i,i, 0,s2-i,s2-i,i)
      tmp_ctx.drawImage(src_canvas, 0,i,i,s2-i, s2-i,0,i,s2-i)
      tmp_ctx.drawImage(src_canvas, 0,0,i,i, s2-i,s2-i,i,i)
    }

    //tmp_c
    var p = tmp_ctx.createPattern(tmp_canvas, "repeat");
    patterns.push(p)
  }

  return patterns;
}

module.exports = popup_tail_fill_pattern_create