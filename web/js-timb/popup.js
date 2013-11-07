var popup = {};

popup.list = {};

popup.close = function(){
  for (key in popup.list)
    popup.list[key].close();
};

module.exports = popup;