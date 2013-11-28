// trying to integrate mouse and touch interaction
// 
//
// the reason to not use pure dom event listeners is that 
// often we are dealing with areas where touch interaction happens
// that aren't dom elements (eg a part of a canvas)
//
// warning... this code is really ugly, it needs a clean up, but has a bunch of subtle behaviour

// var m = require('./mouse');

var loop = require('./anim_loop');

var touches = {};

                // the mouse state always exists 
touches.state = {mouse: {down: false}};

var down_and_up_fns = [];

var mousemove_fns = [];

touches.down_and_up = function(opts){
  down_and_up_fns.push(opts);
  if ('mousemove' in opts)
    mousemove_fns.push(opts)
};




var handle_touches_down = function(ts, original_event){
  // console.log("down")
  var time = Date.now();
  for (var i=0, t; t=ts[i]; i++){
    var state = 
        touches.state[t.identifier] = 
        {down: true, 
         down_timestamp: time,
         x_down: t.clientX,
         y_down: t.clientY};

    for (var j=0, fns; fns=down_and_up_fns[j]; j++){
      // console.log(down_and_up_fns)
      if (fns.bounds_check_down && 
          fns.bounds_check_down(t.clientX, t.clientY, original_event, state)){
            // console.log("over", fns)
            state.fns = fns;
          }
    }

  }  
};

var touchstart = function(e){
  if (!('changedTouches' in e)) return;
  handle_touches_down(e.changedTouches, e)
};

var mousedown = function(e){
  // console.log(e.clientX, e.clientY)
  e.identifier = 'mouse'
  handle_touches_down([e], e)
};




var handle_touches_up = function(ts, original_event){
  for (var i=0, t; t=ts[i]; i++){
    if (t.identifier in touches.state && touches.state[t.identifier].fns){
      var state = touches.state[t.identifier]
        , fns = state.fns;

      if (fns.up){
        if (fns.bounds_check_up){
          if (fns.bounds_check_up(t.clientX, t.clientY, original_event, state))
              fns.up(t.clientX, t.clientY, original_event, state)
        } else fns.up(t.clientX, t.clientY, original_event, state)
      }

    }

    if (t.identifier === 'mouse'){
      touches.state.mouse.down = false;
      touches.state.mouse.x_down = -1;
      touches.state.mouse.y_down = -1;
      touches.state.mouse.down_timestamp = 0;
      delete touches.state.mouse.fns
    } else delete touches.state[t.identifier];

  }  
};

var touchend = function(e){
  if (!('changedTouches' in e)) return;
  handle_touches_up(e.changedTouches, e)
};

var mouseup = function(e){
  // console.log(e.clientX, e.clientY)
  e.identifier = 'mouse'
  handle_touches_up([e], e)
};

// down_and_up_fns

var handle_touches_move = function(ts, original_event){

  for (var i=0, t; t=ts[i]; i++){

    if (t.identifier in touches.state){

      var state = touches.state[t.identifier];

      if (state.down && state.fns && state.fns.move_while_down)
          state.fns.move_while_down(t.clientX, t.clientY, original_event, state);

      // } else if (state.fns && state.fns.bounds_check_move && state.fns.move_while_over &&
      //            state.fns.bounds_check_move(t.clientX, t.clientY, original_event, state)){
      //   console.log('foo')

      //   state.fns.move_while_over(t.clientX, t.clientY, original_event, state)
      // } else { console.log("stuff") }

    }

  }

};


var touchmove = function(e){
  if (!('changedTouches' in e)) return;
  handle_touches_move(e.changedTouches, e)
};

var mousemove = function(e){
  // console.log('foo')
  // console.log(e.clientX, e.clientY)

  if (!touches.state.mouse.down)
    for (var i=0, fns; fns=mousemove_fns[i]; i++)
      fns.mousemove(e.clientX, e.clientY, e, touches.state.mouse);

  e.identifier = 'mouse'
  handle_touches_move([e], e)
};











var anim_loop = function(){

  for (var key in touches.state){
    var state = touches.state[key];
    if (state.down && state.fns && state.fns.anim_while_down) state.fns.anim_while_down(-1,-1, null, state)
  }

  // requestAnimationFrame(loop);

};








touches.init = function(){

  document.addEventListener('mousedown', mousedown);
  document.addEventListener('mouseup', mouseup);
  document.addEventListener('mousemove', mousemove);
  
  document.addEventListener("touchstart", touchstart);
  document.addEventListener("touchend", touchend);
  document.addEventListener("touchmove", touchmove);

  loop.fns_render.push(anim_loop)
}





/*

var onscroll = function(e){
  
  lastScroll = window.scrollY


  if (scheduleAnim) return;

  scheduleAnim = true;
  requestAnimFrame(updatePage)

}

window.addEVentListener('scroll', onscroll, false)

*/

module.exports = touches;