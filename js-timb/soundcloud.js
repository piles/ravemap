var text2el = require('./dom').text2el;

var soundcloud = {};

soundcloud.render = function(){
  
}

soundcloud.leaflet_layer = L.Class.extend({

    options: {},

    initialize: function (latlng, content, options) {
        // save position of the layer or any options from the constructor
        this._latlng = latlng;
        this._content = content;
        // this._offset = options.offset
        // L.setOptions(this, options);
    },

    onAdd: function (map) {
        this._map = map;

        // create a DOM element and put it into one of the map panes
        // this._el = L.DomUtil.create('div', 'my-custom-layer leaflet-zoom-hide');
        this._el = text2el(this._content);

        // map.getPanes().overlayPane.appendChild(this._el);
        map.getPanes().popupPane.appendChild(this._el);
        $('a.sc-player, div.sc-player').scPlayer();

        // console.log(this._el.offsetWidth, this._el.offsetHeight)

        this._offset = L.point([-(this._el.offsetWidth/2)|0, -this._el.offsetHeight - 45])
        // this._offset = this._offset.add(L.Popup.prototype.options.offset);

        // add a viewreset event listener for updating layer's position, do the latter
        map.on('viewreset', this._reset, this);
        this._reset();
    },

    onRemove: function (map) {
        // remove layer's DOM elements and listeners
        $('.sc-player.playing a.sc-pause').click();
        map.getPanes().popupPane.removeChild(this._el);
        // $.scPlayer.stopAll();
        map.off('viewreset', this._reset, this);
    },

    _reset: function () {
        // update layer's position
        // console.log(this._offset)
        // var pos = this._map.latLngToLayerPoint(this._latlng);

        var pos = this._offset.add(this._map.latLngToLayerPoint(this._latlng));
        L.DomUtil.setPosition(this._el, pos);
    }
});


module.exports = soundcloud;


// <iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F113559292"></iframe>