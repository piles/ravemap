// http://www.mixcloud.com/developers/documentation/#embedding
// 

// var extend = require('./extend');
// var text2el = require('./dom').text2el;
// var url = require('./url');
// var xhr = require('./xhr');
// var jsonp = require('./jsonp');

var mixcloud = {};

//var req_embed_html = function(url){
//  var xhr = new XMLHttpRequest();
//  xhr.get(url, {
//            load: function(){ console.log(arguments, this) }
//          , error: function(){ console.log(arguments, this) }
//  })
//}

// var player_add_fetched_embed_json_to_layer = function(layer){
//   return function(json){
//     if (json.html)
//       layer._el_container.innerHTML = json.html
//   }
// }

mixcloud.fn_add = function(layer){ 
  // layer._el_container = layer._el.querySelector('.player-embed-container');
  // var u = url.parse(layer._url);

  // use initial_content to embed iframe instead...
  //var url_embedjson = "http://api.mixcloud.com" + u.directory + "embed-json/?color=000000&callback={{callback}}"
  //jsonp.get(url_embedjson, { load: player_add_fetched_embed_json_to_layer(layer) })

};

mixcloud.fn_rm = function(){ 
    // $('.sc-player.playing a.sc-pause').click();
};

mixcloud.html_content = function(data){
  // return ""
  return '<iframe width=400 height=300 ' +
    'src="//www.mixcloud.com/widget/iframe/?' + 
      'feed=' + encodeURIComponent(data.url) + //'http%3A%2F%2Fwww.mixcloud.com%2FSlipmatt%2Fslipmatt-world-of-rave-28%2F' + 
      '&amp;mini=true' +
      '&amp;stylecolor=000000' +
      '&amp;hide_artwork=true' +
      '&amp;embed_type=widget_standard' +
      // '&amp;embed_uuid=1b8d968a-a85e-404e-926e-7cbecdaf56d7' +
      '&amp;hide_tracklist=' +
      '&amp;hide_cover=' +
      '&amp;autoplay="' + 
  'frameborder=0></iframe>'
}

module.exports = mixcloud;

