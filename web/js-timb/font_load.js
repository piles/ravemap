// hacky font polling to check for loading
// the reason for doing this is that firefox will draw text into a canvas 
// using the wrong font before the right one is loaded
// based on https://github.com/patrickmarabeas/jQuery-FontFace-onLoad

var extend = require('./extend');
var css = require('./css');


var font_load = function(config_in){

  var config = extend({
      font: '',
      load_fn: function(){},
      fail_fn: function(){},
      font_to_compare: '"Times New Roman"',
      string: '@@@',
      delay: 50,
      timeout: 8000
  }, config_in);

  var el = document.createElement('span')
    , style = el.style;
  style.position = 'absolute';
  style.top = '-9999px';
  style.left = '-9999px';
  style.visibility = 'hidden';
  style.fontFamily = config.font_to_compare;
  style.fontSize = '50px'; 
  el.innerHTML = config.string;

  document.body.appendChild(el);

  var font_width_old = el.offsetWidth;

  el.style.fontFamily = config.font + ',' + config.font_to_compare;

  function check_loop() {

    var font_width = el.offsetWidth;

    if (font_width_old === font_width){

      if(config.timeout < 0) {
          config.fail_fn();
      }
      else {
        setTimeout(check_loop, config.delay);
        config.timeout = config.timeout - config.delay;
      }

    }
    else {
      config.load_fn();
    }
  };

  check_loop();

}

module.exports = font_load;