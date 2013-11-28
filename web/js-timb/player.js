var url = require('./url');
var map = require('./map');
var loop = require('./anim_loop');

var audio = require('./audio');
require('./player_leaflet');
// var soundcloud = require('./player_soundcloud');
// var mixcloud = require('./player_mixcloud');
var domq = require('./dom').q;

// var model = require('./player_model');

var players = {};
players.soundcloud = require('./player_soundcloud');
players.mixcloud = require('./player_mixcloud');


var player = {is_open: false};
var dom = {};
var popup = {};

player.layer_leaflet = null;
player.layer_id = null;

var popup_wrapper_html = function(data, html_to_wrap){
  html_to_wrap = html_to_wrap || ""

  // console.log(html_to_wrap)

  var content = 
  "<div class=player-popup>" + 
    "<h2>We Raved Here:</h2>" +
    "<h3>" + data.venue + "</h3>" +
    '<img src="img/player/close.png" class=player-close>' + 
    "<div class=player-embed-container>" +
      html_to_wrap +
    // "<a href='" + data.url + "' class='sc-player'>soundcloud set</a>" +
    "</div>" +
  "</div>"

  return content
};

player.anim = function(){
  if (!player.layer_id || !player.player_type.anim) return;
  player.player_type.anim(player)
}

player.close = function(){
  dom.el.classList.add('hidden')
  dom.el_embed_container.innerHTML = ''

  //if (player.layer_leaflet) {
  //  map.leaflet.removeLayer(player.layer_leaflet);
  //  player.layer_leaflet = null;
  //}

  if ("player_type" in player && "fn_rm" in player.player_type) player.player_type.fn_rm(player)

  player.canvas.classList.add('hidden')
  player.layer_id = null;
  player.is_open = false;

}

player.pan_map_to_fit = function(){
  var r = dom.el.getBoundingClientRect()
    , pan_x = 0
    , pan_y = 0
    , pad = 50
    , ww = window.innerWidth
    , wh = window.innerHeight

  if (r.left < pad) pan_x = r.left - pad;

  if (r.right > ww - pad) pan_x = Math.abs(ww - r.right) + pad;

  if (r.top < pad) pan_y = r.top - pad;

  if (r.bottom > wh - pad) pan_y = Math.abs(wh - r.bottom) + pad;

  if (pan_x !== 0 || pan_y !== 0)
    map.leaflet.panBy([pan_x, pan_y]);  
};



player.open = function(e){

  var data = e.target.data;

  // console.log(e.target)

  var u = url.parse(data.url);

  if (player.layer_id === data.id){ // same pin clicked as current open player... just close
    player.close()
    return;
  } else {
    player.close()
  }

  dom.el.classList.remove('hidden')
  // dom.el.innerHTML = "<h1>FUCK</h1>"

  var domain_parts = u.host.split(".")
  var domain = domain_parts[domain_parts.length - 2];

  if (domain === 'soundcloud')
    var player_type = players.soundcloud
  else if (domain === 'mixcloud')
    var player_type = players.mixcloud
  else
    return;

  player.player_type = player_type;


  // var initial_content = player_type.html_content(data)
  // var content = popup_wrapper_html(data, initial_content)

  dom.el_embed_container.innerHTML = player_type.html_content(data)

  // return;
// console.log(e.target._icon);
  player.is_open = true;
  dom.el_venue.innerHTML = data.venue || ''
  player.pin = e.target
  player.latlng = e.target._latlng
  player.url = data.url;
  player.layer_id = data.id;
  player.dirty = true;
  if ("fn_add" in player.player_type) player_type.fn_add(player)
  player.resize();
  player.pan_map_to_fit();

  return;

  // popup.

  var opts = {
      latlng: e.target._latlng
    , html: content
    , fn_add: player_type.fn_add
    , fn_rm: player_type.fn_rm
    , fn_close_popup: player.close
    , url: data.url
  };



  // u.directory

  player.layer_leaflet = new L.PlayerPopup(opts)
  player.player_type = player_type;
  // player.layer_leaflet = new soundcloud.leaflet_layer(opts)
  player.layer_id = data.id;

  map.leaflet.addLayer(player.layer_leaflet);

  player.pan_map_to_fit();


/*
  map.leaflet.closePopup();

  if (open_popup === e.target.data){
    open_popup = null;
    return;    
  }
*/
  // if (map.leaflet._popup){
    // open_popup = null;
    // return;
  // }

  // console.log(e.target)

  // var anchor = L.point(e.target.options.icon.options.popupAnchor || [0, 0]);
  // anchor = anchor.add(L.Popup.prototype.options.offset);

  // var anchor = L.point([]);



  // var options = {offset:anchor};





  // if (open_player._el)

  // 7window.FUCK = open_player._el


  // pan map to contain player


  // console.log(r.top, r.right, r.bottom, r.left);



  // console.log(open_player._el)
  // return

/*
  map.leaflet.openPopup(content, e.target._latlng, {

  // map.leaflet.openPopup(e.target.data.venue, e.target._latlng, {
    offset: anchor
  });
  
  $('a.sc-player, div.sc-player').scPlayer();


  open_popup = e.target.data;  
*/
};

player.resize = function(){

  // var p = map.leaflet.latLngToLayerPoint(player.pin._latlng);

  var p = map.leaflet.latLngToContainerPoint(player.pin._latlng)

  // console.log(player.el.offsetWidth, player.el.clientWidth)

  var r_pin = player.pin._icon.getBoundingClientRect()
  var top = p.y - player.el.offsetHeight - 50
  var left = p.x + r_pin.width/2 - player.el.offsetWidth/2
  player.el.style.top = top + 'px'
  player.el.style.left = left + 'px'

  // console.log(map.leaflet.latLngToLayerPoint(player.latlng));

  // this._offset = L.point([-(this._el.offsetWidth/2)|0, -this._el.offsetHeight - 45])
}

player.init = function(){
  audio.init();

  player.el = dom.el = domq('#ui-popup');
  dom.el_close = domq('#ui-popup .player-close')
  dom.el_venue = domq('#ui-popup .player-venue')
  dom.el_embed_container = domq('#ui-popup .player-embed-container')
  player.canvas = domq('#ui-popup canvas')
  player.ctx = player.canvas.getContext('2d')

  dom.el_close.addEventListener("click", function(){ /*console.log("blah");*/ player.close()})

  map.leaflet.on('viewreset move', function(){
    if (!player.is_open) return
      // console.log("fug")
    player.dirty = true;
    player.resize();
  })

  // init different engines
  for (var key in players){ var p = players[key]
    if ("init" in p) p.init(player);
  }

  loop.fns_render.push(player.anim)
}

module.exports = player;