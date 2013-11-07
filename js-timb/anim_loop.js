
require('./anim_shim');

var anim = {};

anim.stats = new Stats();


var fns = anim.fns = [];
var anim_id = -1;
anim.frame_skip = 0;
var frame_num = 0;

anim.start = function(){
  if (anim_id === -1)
    anim_id = requestAnimationFrame(loop);
}

anim.stop = function(){
  cancelAnimationFrame(anim_id)
  anim_id = -1;
};

anim.add = function(fn){
  fns.push(fn);
};

var loop = function(){
  anim_id = requestAnimationFrame(loop);

  anim.stats.begin();

  if (anim.frame_skip > 0){
    frame_num += 1;
    if (frame_num < anim.frame_skip)
      return
    else
      frame_num = 0;
  }

  for (var i=0, fn; fn=fns[i]; i++)
    fn();

  anim.stats.end();
}

module.exports = anim;