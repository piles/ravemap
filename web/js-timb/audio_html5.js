
var audio_html5 = {};
var p;









audio_html5.test = function(){
  var state = false;
  try{
    var a = new Audio();
    state = a.canPlayType && (/maybe|probably/).test(a.canPlayType('audio/mpeg'));
    // uncomment the following line, if you want to enable the html5 audio only on mobile devices
    // state = state && (/iPad|iphone|mobile|pre\//i).test(navigator.userAgent);
  }catch(e){
    // there's no audio support here sadly
  }
  // AA = a
  // console.log(a, a.canPlayType('audio/mpeg'))
  return state;  
  // return true;
}

var play = function(){ p.play() };

var pause = function(){ p.pause() };

var stop = function(){
  if (p.currentTime) {
    p.currentTime = 0;
  }
  p.pause()
};

var load_and_play = function(url){
  console.log("load", url)
  p.pause();
  // player.src = track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
  p.src = url;
  p.load();
  p.play();  
};

var load = function(url){
  console.log("load", url)
  p.pause();
  // player.src = track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
  p.src = url;
  p.load();
  // player.play();  
};

var seek = function(relative){
  p.currentTime = p.duration * relative;
  p.play()
};

var interface = {
  play: play,
  pause: pause,
  stop: stop,
  load: load,
  load_and_play: load_and_play,
  seek: seek
}

audio_html5.init = function(opts){
  opts = opts || {};
  var audio = opts.attach_fns_to || {}

  p = audio.player = new Audio()
  document.body.appendChild(p)

  for (var name in interface){
    audio[name] = interface[name];
  }

  return audio;
};


// audio.play = function(){

// }

// audio.pause = function(){

// }

// audio.stop = function(){
  
// }

// audio.seek = function(){
  
// }


module.exports = audio_html5;