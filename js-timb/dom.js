var dom = {};

// turn html text into live elements
dom.text2el = function(text){
  dom.el = dom.el || document.createElement('div');
  dom.el.innerHTML = text;
    // IEmakeUnselectable(text2el.el.childNodes[0]); //todo: hook to do this on creation?
  return dom.el.childNodes[0];
}

dom.q = function(q){
  return document.querySelector(q)
};

dom.qs = function(q){
  return document.querySelectorAll(q)
};

module.exports = dom;