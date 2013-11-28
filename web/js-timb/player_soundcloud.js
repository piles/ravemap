var extend = require('./extend');
var text2el = require('./dom').text2el;
var domq = require('./dom').q;
var geom = require('./geom');

var touches = require('./touches')

var xhr = require('./xhr');
require('./player_soundcloud_leaflet_edit');
var waveform = require('./player_soundcloud_waveform');
var audio = require('./audio')

var dom = {};

var api_key= 'htuiRd1JP11Ww0X72T1C3g'; //todo, get actual key



var soundcloud = {};

var cache = soundcloud.cache = {};
cache.oembed = {};
cache.url2trackid = {};
cache.api_track = {};
cache.waveform_json = {};
cache.waveform_mask = {};

soundcloud.init = function(){
  // SC - soundcloud sdk
  SC.initialize({});
  dom.canvas_waveform_composite = document.createElement('canvas')
  dom.canvas_waveform_composite.width = waveform.w
  dom.canvas_waveform_composite.height = waveform.h
  dom.ctx_waveform_composite = dom.canvas_waveform_composite.getContext('2d')
}


// waveform
var waveform_hit_test_fn = function(x, y){
  // console.log("foo")
  return geom.bounds_hit_test(soundcloud['bounds_player_waveform'], x, y)
};

// var scale_mousemove = function(x,y,e, state){
//   if (scale_hit_test_fn(x,y)){
//     if (!model.mouseover){
//       model.mouseover = true
//     }
//     model.dirty = true;
//   } else {
//     if (model.mouseover){
//       model.mouseover = false
//       model.dirty = true;
//     }        
//   }
// };

var waveform_move_while_down = function(x, y, e, state){
  e.preventDefault();
  e.stopPropagation();

  // console.log("foo")
  waveform_set_value(x);
};

var waveform_set_value = function(x){

  var bounds = soundcloud['bounds_player_waveform'];

  var w = bounds.x2 - bounds.x1

  var x_in_px = x - bounds.x1;
  var x_in_percent = x_in_px / w
  if (x_in_percent < 0) x_in_percent = 0
  if (x_in_percent > 1) x_in_percent = 1

  if (audio.player && 'currentTime' in audio.player)
    audio.player.currentTime = x_in_percent * audio.player.duration;
  else if (audio.player && 'setPosition' in audio.player)
    audio.player.setPosition(x_in_percent * audio.player.duration);




    //model.step = model.waveform_scale(x);
    //model.dirty = true;
    // console.log(x)
};

var touches_waveform = {
  bounds_check_down: waveform_hit_test_fn,
  move_while_down: waveform_move_while_down,
  up: waveform_set_value,
  // mousemove: scale_mousemove
};









// have soundcloud url... then:
//    jsonp fetch oembed to get track id... then:
//        jsonp fetch track json using track id... then:
//            xhr fetch waveform data for track using track json
//            fetch stream using track json

soundcloud.fn_add = function(player){ 
    // player._closed = false

    var el = player.el;

    player.canvas.classList.remove('hidden')

    dom.el_sc_wrapper = el.querySelector('.soundcloud-player');
    dom.el_sc_play_pause = el.querySelector('.soundcloud-play-pause');
    // dom.el_waveform = el.querySelector('.soundcloud-waveform');
    dom.el_sc_title = el.querySelector('.soundcloud-track-title');

    player.canvas.width = waveform.w
    player.canvas.height = waveform.h

    // dom.waveform_ctx = dom.el_waveform.getContext('2d')

    player.ctx.webkitImageSmoothingEnabled = false;
    player.ctx.mozImageSmoothingEnabled = false;
    player.ctx.imageSmoothingEnabled = false;

    dom.el_sc_wrapper.style.height = (80 + waveform.h) + "px"

    dom.el_sc_play_pause.addEventListener('click', function(){
      var cl = dom.el_sc_play_pause.classList
      if (audio.player && audio.player.paused) {
        cl.add('playing')
        cl.remove('paused')
        audio.play()
      }
      else if (audio.player && !audio.player.paused) {
        cl.remove('playing')
        cl.add('paused')
        audio.pause();
      }
    });

    touches.down_and_up(touches_waveform);

    // get track info from soundcloud api... first, grab the oembed of a url
    var url = player.url;

    if (url in cache.oembed)
      soundcloud_oembed_fetched(player)();
    else
      SC.oEmbed(url, soundcloud_oembed_fetched(player));

    

    // $('a.sc-player-old, div.sc-player-old').scPlayer();

};

soundcloud.fn_rm = function(player){
  // player._closed = true
  audio.stop();
    // $('.sc-player.playing a.sc-pause').click();
};

var soundcloud_oembed_fetched = function(player){ return function(oembed_json, err){
  if (!player.is_open) return;

  var url = player.url;

  if (oembed_json) cache.oembed[url] = oembed_json;
  else oembed_json = oembed_json || cache.oembed[url];

  if (oembed_json === null || oembed_json === undefined || err){
    console.log("error", err, url)
    return;
  }
  // render title
  dom.el_sc_title.innerHTML = oembed_json.title

  // fetch track info
  if (url in cache.url2trackid)
    soundcloud_api_track_fetched(player)();
  //return
  else {
    var tracks_match = oembed_json.html.match(/%2Ftracks%2F([0-9]+)/) // brittle
    if (!tracks_match || tracks_match.length < 2) {
      console.log(oembed_json.html)
      return
    }
    var trackid = tracks_match[1]
    cache.url2trackid[url] = trackid
    var track_url = "/tracks/" + trackid + ".json"
    var opts = { consumer_key: api_key };
    SC.get(track_url, opts, soundcloud_api_track_fetched(player));
  }


  // %2Ftracks%2F

  // if (json.title)
// "<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F39100048&show_artwork=true"></iframe>"
  // console.log(json)

}};

var soundcloud_api_track_fetched = function(player){ return function(track_json, err){
  if (!player.is_open) return;

  var url = player.url;

  if (track_json) 
    cache.api_track[url] = track_json;
  else
    track_json = track_json || cache.api_track[url];

  if (track_json === null || track_json === undefined || err)
     { console.log("error", err, url); return }

  // render soundcloud player
  if (url in cache.waveform_mask)
    soundcloud_waveform_fetched(player)();  
  else {
    // change http://w1.sndcdn.com/_.png to
    // http://wis.sndcdn.com/_.png
    var url_waveform_data = track_json.waveform_url.split(".")
    url_waveform_data.shift()
    url_waveform_data.unshift("http://wis")
    url_waveform_data = url_waveform_data.join(".")
    xhr.get(url_waveform_data, {
        load: soundcloud_waveform_fetched(player)
    });

    // console.log(url_waveform_data)
  }

  if (track_json.streamable){
    // to figure out: why do i gotta switch this to https to get it to work?
    var url_stream = track_json.stream_url.replace(/^http:/, 'https:')
    url_stream = url_stream + (/\?/.test(url_stream) ? '&' : '?') + 'consumer_key=' + api_key;
    audio.load_and_play(url_stream);
    dom.el_sc_play_pause.classList.add('playing')
    dom.el_sc_play_pause.classList.remove('paused')
    // audio.play();
  }

  // console.log(json, err)
}};


var soundcloud_waveform_fetched = function(player){ return function(e){
  if (!player.is_open) return;

  var url = player.url;

  if (e && e.target && e.target.responseText) {
    var waveform_json = cache.waveform_json[url] = JSON.parse(e.target.responseText)
    var waveform_mask = cache.waveform_mask[url] = waveform.render(url, waveform_json)
  } else
    var waveform_mask = cache.waveform_mask[url]
  // else: no mask...



  // console.log(cache.api_track[layer._url])

  // document.body.appendChild(waveform_mask)
  // console.log(waveform)

  // render waaveform
  
}}

var canvas_draw = {
  x:0, y:0
, w:0, h:0
, dest_offset_x: 0
, dest_offset_y: 0
}

soundcloud.anim = function(player){
  // console.log(layer)
  if (!(player.url in cache.waveform_mask)) return;


  var waveform_mask = cache.waveform_mask[player.url]
  var ctx = player.ctx
    , c = player.canvas
    , c_cmp = dom.canvas_waveform_composite
    , ctx_cmp = dom.ctx_waveform_composite
    , c_w = c_cmp.width
    , c_h = c_cmp.height

  if (player.dirty){

    // console.log("foo")

    var r = c.getBoundingClientRect()

    var s_x = r.left
      , s_y = r.top
      , s_w = waveform.w
      , s_h = waveform.h
      , ww = canvas.width
      , wh = canvas.height
      , dest_offset_x = 0
      , dest_offset_y = 0

    if (s_x > ww || s_y > wh) return;

    // console.log("ok")

    cursor.bounds.player_waveform = soundcloud.bounds_player_waveform = {
        x1: s_x, x2: s_x + s_w,
        y1: s_y, y2: s_y + s_h,
        mouseover: 'pointer'
    };

    // cursor.bounds.player_waveform = soundcloud.bounds_player_waveform = {
    //     x1: s_x, x2: s_x + s_w,
    //     y1: s_y, y2: s_y + s_h,
    //     mouseover: 'pointer'
    // };

    if (s_x < 0) {
      s_w += s_x
      dest_offset_x = -s_x
      s_x = 0;
    }
    if (s_y < 0) {
      s_h += s_y
      dest_offset_y = -s_y
      s_y = 0;
    }

    if (s_x + s_w > ww){
      s_w = ww - s_x
    }

    if (s_y + s_h > wh){
      s_h = wh - s_y
    }

    canvas_draw.s_x = s_x
    canvas_draw.s_y = s_y
    canvas_draw.s_w = s_w
    canvas_draw.s_h = s_h
    canvas_draw.dest_offset_x = dest_offset_x
    canvas_draw.dest_offset_y = dest_offset_y


    player.dirty = false;
  }

  // composite and mask waveform data to main animation, and then put a cursor on it.
  ctx_cmp.clearRect(0,0,c_w,c_h);
  ctx_cmp.globalCompositeOperation = 'source-over';
  ctx_cmp.drawImage(window.canvas, 
                canvas_draw.s_x,canvas_draw.s_y,canvas_draw.s_w,canvas_draw.s_h,
                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h)  
  ctx_cmp.globalCompositeOperation = 'destination-in';
  ctx_cmp.drawImage(waveform_mask, 
                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h, 
                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h);

//  // console.log(s_x,s_y,s_w,s_h, dest_offset_x,dest_offset_y,s_w,s_h)
//  ctx.globalCompositeOperation = 'source-over';
//  // ctx.drawImage(canvas, s_x,s_y,s_w,s_h, dest_offset_x,dest_offset_y,s_w,s_h)
//  ctx.drawImage(canvas, 
//                canvas_draw.s_x,canvas_draw.s_y,canvas_draw.s_w,canvas_draw.s_h,
//                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h)
//  ctx.globalCompositeOperation = 'destination-in';
//  // ctx.drawImage(waveform_mask, dest_offset_x,dest_offset_y,s_w,s_h, dest_offset_x,dest_offset_y,s_w,s_h);
//  ctx.drawImage(waveform_mask, 
//                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h, 
//                canvas_draw.dest_offset_x,canvas_draw.dest_offset_y,canvas_draw.s_w,canvas_draw.s_h);
//
  // console.log(audio.player)

  // playback cursor

  if (audio.player && audio.player.duration){
    var duration = audio.player.durationEstimate || audio.player.duration
    var pos = audio.player.currentTime || audio.player.position
    // console.log(audio.player.currentTime, audio.player.duration)
    var cursor_percent = parseInt(pos) / parseInt(duration)
    var cursor_position_px = Math.round(waveform.w * cursor_percent);

    if (!audio.player.paused){
      ctx_cmp.fillStyle = '#fff'
    } else {
      var color_value_hex = (((Math.sin(Date.now() / 100) * 128) + 128) |0).toString(16);
      if (color_value_hex.length === 1) color_value_hex = '0' + color_value_hex
      ctx_cmp.fillStyle = '#' + color_value_hex + color_value_hex + color_value_hex;    
    }


    // ctx.fillStyle = '#fff'
  //  ctx.globalCompositeOperation = 'source-over';
  //  ctx.fillRect(cursor_position_px,0, 1,waveform.h)
    ctx_cmp.globalCompositeOperation = 'source-over';
    ctx_cmp.fillRect(cursor_position_px,0, 1,waveform.h)

    // composite on to main canvas
    ctx.clearRect(0,0,c_w,c_h);
    ctx.drawImage(c_cmp, 0,0);


    // console.log(cursor_percent)
  }




}

soundcloud.html_content = function(data){
  var html = //"<a href='" + data.url + "' class='sc-player-old'>soundcloud set</a>" +
  // '<div class=soundcloud-player-wrapper>' +
    '<div class=soundcloud-player>' +
      '<div class=soundcloud-player-inner>' +
        '<div class=soundcloud-play-pause></div>' +
        '<h3 class=soundcloud-track-title></h3>' +
      '</div>' +
    '</div>'
    // '<canvas class=soundcloud-waveform></canvas>' +
  // '</div>'

  return html

}

module.exports = soundcloud;


// <iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F113559292"></iframe>