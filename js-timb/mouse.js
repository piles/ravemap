var m = {};

m.x = 0;
m.y = 0;
m.down = false;

m.init = function(){

  window.addEventListener('mousemove', function(e){
    m.x = e.clientX;
    m.y = e.clientY;
  });

  window.addEventListener('mousedown', function(e){ m.down = true });
  window.addEventListener('mouseup',   function(e){ m.down = false });
  document.addEventListener('mouseout', function(e){ m.down = false });

// setInterval(function(){console.log(mouse.down)}, 1000)

};



module.exports = m;