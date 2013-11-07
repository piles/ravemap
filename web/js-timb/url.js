var url = {};

url.init = function(){
  var u = url.parsed = url.parse(document.location);
  if (u.host === 'ravemaps.local'){
    url.proxify = url.proxify_corsify;
    url.tile_server = 'http://tiles.ravemaps.local/'
  } else {
    url.proxify = url.proxify_phanes;
    url.tile_server = 'http://198.199.72.134/ravemaps/'
  }
};


url.proxify_phanes = function(u){
  u = "http://198.199.72.134/cors/"+ u.replace(/^https?:\/\//, "");
  return u;
};

url.proxify_corsify = function(u){
  return "http://corsify.appspot.com/" + u;
}

// parseUri 1.2.2
// http://blog.stevenlevithan.com/archives/parseuri
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
url.parse = function(str) {
  var o   = url.parse.options,
    m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i   = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
};

url.parse.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

module.exports = url;