

var xhr = {};

xhr.get = function(url, events){
  var xhr = new XMLHttpRequest();
  xhr.open("get", url);
  // if ('responseType' in events){
  //   xhr.responseType = events.responseType
  //   delete events.responseType
  // }
  for (var name in events) xhr.addEventListener(name, events[name])
  xhr.send();
};

module.exports = xhr;