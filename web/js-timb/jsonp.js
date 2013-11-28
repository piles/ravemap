// load external scripts via the jsonp method...

var domq = require('./dom').q;
var uid = require('./uid');

var jsonp = {};

jsonp.fns = {}

jsonp.get = function(url, events){

  if (!events.load) return;

  var script = document.createElement('script');

  var unique_name = "_" + uid();

  jsonp.fns[unique_name] = events.load;

  jsonp.fns[unique_name + "_wrap"] = function(){
    // console.log("foo")
    jsonp.fns[unique_name].apply(this, arguments);

    // collect garbage
    delete jsonp.fns[unique_name]
    delete jsonp.fns[unique_name + "_wrap"]
    domq('head').removeChild(script)
  }

  script.src = url.replace('{{callback}}', "jsonp.fns." + unique_name + "_wrap")

  domq('head').appendChild(script);

  // console.log(script)
  // console.dir(script)

};

// need global export 
window.jsonp = jsonp
module.exports = jsonp;