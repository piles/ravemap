// this is pretty tied into the soundmanager2 player that the soundcloud sdk automatically loads, unfortuneately

var text2el = require('./dom').text2el;
var p, audio;
// a = SC.stream("https://api.soundcloud.com/tracks/89408819?consumer_key=htuiRd1JP11Ww0X72T1C3g")
// a.play()

var audio_flash = {};

var secureDocument = false;

var play = function(){
  p.play()
};
var pause = function(){
  p.pause()
};
var stop = function(){
  p.stop()
  p.unload()
};
var load_and_play = function(url){
  console.log(url)
  SC.stream(url, function(sound_manager_obj){ 
    // console.log("foo")
    audio.player = p = sound_manager_obj
    p.play();
  })
};
var load = function(url){
  console.log(url)
  SC.stream(url, function(sound_manager_obj){ audio.player = p = sound_manager_obj })
};
var seek = function(){
  // p.setPosition()
};



var interface = {
  play: play,
  pause: pause,
  stop: stop,
  load: load,
  load_and_play: load_and_play,
  seek: seek
}


audio_flash.test = function(){
  return true;
}

audio_flash.init = function(opts){
  opts = opts || {};
  audio = opts.attach_fns_to || {}


  for (var name in interface){
    audio[name] = interface[name];
  }

  // var id = 'soundcloud-flash-player'
  // var domain = 'soundcloud.com'
  // var url = ''
  // var url_swf = (secureDocument ? 'https' : 'http') + '://player.' + domain +'/player.swf?url=' + url +'&amp;enable_api=true&amp;player_type=engine&amp;object_id=' + id;

  // if (false /*$.browser && $.browser.msie*/) { // timb edit
  //   var html = '<object zheight="100%" zwidth="100%" id="' + id + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" data="' + swf + '">'+
  //     '<param name="movie" value="' + url_swf + '" />'+
  //     '<param name="allowscriptaccess" value="always" />'+
  //     '</object>';
  // } else {
  //   var html = '<object zheight="100%" zwidth="100%" id="' + id + '">'+
  //     '<embed allowscriptaccess="always" height="100%" width="100%" src="' + url_swf + '" type="application/x-shockwave-flash" name="' + id + '" />'+
  //     '</object>';
  // }

  // p = audio.player = text2el(html)

  // document.body.appendChild(p)

  //p = audio.player = 

  return audio;
}

module.exports = audio_flash;