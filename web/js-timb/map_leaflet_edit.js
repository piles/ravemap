// extensions, hacks, edits on the leaflet source
// todo: clean this up and get rid of old bits

// add an extra pane to contain animated pin bits
L.MapWithAnimPane = L.Map.extend({
    _initPanes: function () {
    var panes = this._panes = {};

    this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);

    this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
    panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
    panes.shadowPane = this._createPane('leaflet-shadow-pane');
    panes.overlayPane = this._createPane('leaflet-overlay-pane');
    panes.markerAnimPane = this._createPane('leaflet-marker-anim-pane');
    panes.markerPane = this._createPane('leaflet-marker-pane');
    panes.popupPane = this._createPane('leaflet-popup-pane');

    var zoomHide = ' leaflet-zoom-hide';

    if (!this.options.markerZoomAnimation) {
      L.DomUtil.addClass(panes.markerPane, zoomHide);
      L.DomUtil.addClass(panes.markerAnimPane, zoomHide);
      L.DomUtil.addClass(panes.shadowPane, zoomHide);
      L.DomUtil.addClass(panes.popupPane, zoomHide);
    }
  },


  _animatePathZoom: function (e) {
console.log("FUCK")
    var scale = this.getZoomScale(e.zoom),
        offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

    this._zoom_anim_start = Date.now();
    this._zoom_anim_scale = scale;
    this._zoom_anim_offset = offset;
    // console.log(offset)
    //console.log(scale);

    // console.log(this._pathRoot.style[L.DomUtil.TRANSFORM], L.DomUtil.getTranslateString(offset))

    this._pathRoot.style[L.DomUtil.TRANSFORM] =
            L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';


            console.log("FUCK")

    // console.log(offset.x, offset.y, L.DomUtil.getTranslateString(offset) )

    this._pathZooming = true;
  },

  _tryAnimatedZoom: function (center, zoom, options) {

    if (this._animatingZoom) { return true; }

    options = options || {};

    // don't animate if disabled, not supported or zoom difference is too large
    if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
            Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

    // offset is the pixel coords of the zoom origin relative to the current center
    var scale = this.getZoomScale(zoom),
        offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
      origin = this._getCenterLayerPoint()._add(offset);

    this._zoom_anim_start = Date.now();
    this._zoom_anim_scale = scale;
    this._zoom_anim_offset = offset;

    // don't animate if the zoom origin isn't within one screen from the current center, unless forced
    if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

    this
        .fire('movestart')
        .fire('zoomstart');

    this._animateZoom(center, zoom, origin, scale, null, true);

    return true;
  },


});

L.IconAnim = L.Icon.extend({
    _setIconStyles: function (img, name) {
    var options = this.options,
        size = L.point(options[name + 'Size']),
        anchor;

    if (name === 'shadow') {
      anchor = L.point(options.shadowAnchor || options.iconAnchor);
    } else if (name === 'anim') {
      anchor = L.point(options.animAnchor || options.iconAnchor);
    } else {
      anchor = L.point(options.iconAnchor);
    }

    if (!anchor && size) {
      anchor = size.divideBy(2, true);
    }

    img.className = 'leaflet-marker-' + name + ' ' + options.className;

    if (anchor) {
      img.style.marginLeft = (-anchor.x) + 'px';
      img.style.marginTop  = (-anchor.y) + 'px';
    }

    if (size) {
      img.style.width  = size.x + 'px';
      img.style.height = size.y + 'px';
    }
  },

  createAnim: function (oldAnim) {
    return this._createIcon('anim', oldAnim);
  }

});



L.Icon.prototype.createAnim = function (oldAnim) {
    return this._createIcon('anim', oldAnim);
  }




L.MarkerAnim = L.Marker.extend({

  _initIcon: function () {
    var options = this.options,
        map = this._map,
        animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
        classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

    var icon = options.icon.createIcon(this._icon),
      addIcon = false;

    // if we're not reusing the icon, remove the old one and init new one
    if (icon !== this._icon) {
      if (this._icon) {
        this._removeIcon();
      }
      addIcon = true;

      if (options.title) {
        icon.title = options.title;
      }
    }

    L.DomUtil.addClass(icon, classToAdd);

    if (options.keyboard) {
      icon.tabIndex = '0';
    }

    this._icon = icon;

    this._initInteraction();

    if (options.riseOnHover) {
      L.DomEvent
        .on(icon, 'mouseover', this._bringToFront, this)
        .on(icon, 'mouseout', this._resetZIndex, this);
    }

    var newShadow = options.icon.createShadow(this._shadow),
      addShadow = false;

    if (newShadow !== this._shadow) {
      this._removeShadow();
      addShadow = true;
    }

    if (newShadow) {
      L.DomUtil.addClass(newShadow, classToAdd);
    }
    this._shadow = newShadow;


    var addAnim = false;
    if (this.options.icon.options.animUrl){

      var newAnim = options.icon.createAnim(this._anim);

      if (newAnim !== this._anim) {
        this._removeAnim();
        addAnim = true;
      }

      if (newAnim) {
        L.DomUtil.addClass(newAnim, classToAdd);
      }
      this._anim = newAnim;
    }

    if (options.opacity < 1) {
      this._updateOpacity();
    }


    var panes = this._map._panes;

    if (addIcon) {
      panes.markerPane.appendChild(this._icon);
    }

    if (addAnim) {
      panes.markerPane.appendChild(this._anim);

      // panes.markerAnimPane.appendChild(this._anim);
    }

    if (newShadow && addShadow) {
      panes.shadowPane.appendChild(this._shadow);
    }
  },

  _removeAnim: function () {
    if (this._anim) {
      // this._map._panes.markerAnimPane.removeChild(this._anim);
      this._map._panes.markerPane.removeChild(this._anim);

    }
    this._anim = null;
  },

  _setPos: function (pos) {
    L.DomUtil.setPosition(this._icon, pos);

    if (this._shadow) {
      L.DomUtil.setPosition(this._shadow, pos);
    }

    if (this._anim) {
      L.DomUtil.setPosition(this._anim, pos);
    }

    this._zIndex = pos.y + this.options.zIndexOffset;

    this._resetZIndex();
  },

  _updateZIndex: function (offset) {
    // console.log("buh", offset, "buh")
    this._icon.style.zIndex = this._zIndex + offset;
    if (this._anim)
      this._anim.style.zIndex = this._zIndex + offset;
  }



});







