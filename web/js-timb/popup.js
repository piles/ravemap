var popup = {};

popup.list = {};

popup.close = function(){
  for (var key in popup.list)
    popup.list[key].close();
};

popup.width = 400;

module.exports = popup;