var empty = require('./fn').empty
var text2el = require('./dom').text2el;

// soundcloud.leaflet_layer = L.Class.extend({
L.PlayerPopup = L.Class.extend({

    options: {},

    initialize: function (opts) {
        // save position of the layer or any options from the constructor

        this._latlng = opts.latlng;
        this._html = opts.html;
        this._fn_add = opts.fn_add || empty;
        this._fn_rm = opts.fn_rm || empty;
        this._url = opts.url;
        this._fn_close_popup = opts.fn_close_popup || empty;

        // console.log(opts)

        // console.log(this.options);
        // this._fn_
        // this._offset = options.offset
        // L.setOptions(this, options);
    },

    onAdd: function (map) {

        var layer = this;

        this._map = map;

        // create a DOM element and put it into one of the map panes
        // this._el = L.DomUtil.create('div', 'my-custom-layer leaflet-zoom-hide');
        this._el = text2el(this._html);



        // map.getPanes().overlayPane.appendChild(this._el);
        map.getPanes().popupPane.appendChild(this._el);


        var close_button = this._el.querySelector(".player-close");
        close_button.addEventListener("click", this._fn_close_popup)

        this._fn_add(this);
        // $('a.sc-player, div.sc-player').scPlayer();

        // console.log(this._el.offsetWidth, this._el.offsetHeight)

        this._offset = L.point([-(this._el.offsetWidth/2)|0, -this._el.offsetHeight - 45])
        // this._offset = this._offset.add(L.Popup.prototype.options.offset);

        // add a viewreset event listener for updating layer's position, do the latter
        map.on('viewreset', this._reset, this);
        this._reset();
    },

    onRemove: function (map) {
        // remove layer's DOM elements and listeners
        this._fn_rm(this);
        
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