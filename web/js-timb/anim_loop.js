// the main loop that handles every other animation loop
// the reason for doing it that way is that all of the 
// animation loops can be timed and turned off etc without instrumenting each one individually

require('./anim_shim');
var url = require('./url');

var anim = {};

var anim_id = -1
  , frame_num = 0
  , fns_render = anim.fns_render = []
  , fns_update = anim.fns_update = []

anim.frame_skip = 0;

anim.init = function(){
  if ('stats' in url.parsed.queryKey){
    var s = anim.stats = new Stats();
    s.domElement.style.position = 'absolute';
    s.domElement.style.left = '0px';
    s.domElement.style.top = '0px';
    document.body.appendChild( s.domElement );
    loop = loop_with_stats;
  }
  anim.start();
}

anim.start = function(){
  if (anim_id === -1)
    anim_id = requestAnimationFrame(loop);
}

anim.stop = function(){
  cancelAnimationFrame(anim_id)
  anim_id = -1;
};

var loop_without_stats = function(){
  anim_id = requestAnimationFrame(loop_without_stats);

  for (var i=0, fn; fn=fns_update[i]; i++)
    fn();
  for (var i=0, fn; fn=fns_render[i]; i++)
    fn();

  // for (var i=0, fn; fn=fns[i]; i++)
  //   fn();

};

var loop_with_stats = function(){
  anim_id = requestAnimationFrame(loop_with_stats);

  anim.stats.begin();

  //if (anim.frame_skip > 0){
  //  frame_num += 1;
  //  if (frame_num < anim.frame_skip)
  //    return
  //  else
  //    frame_num = 0;
  //}

  for (var i=0, fn; fn=fns_update[i]; i++)
    fn();
  for (var i=0, fn; fn=fns_render[i]; i++)
    fn();

  // for (var i=0, fn; fn=fns[i]; i++)
  //   fn();

  anim.stats.end();
};

var loop = loop_without_stats;

module.exports = anim;