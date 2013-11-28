// had to edit this to allow clicking on a canvas waveform inside soundcloud player popup!

L.Draggable.prototype._onDown = function (e) {
  this._moved = false;

  if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

  // timb edit
  // L.DomEvent.stopPropagation(e);

  if (L.Draggable._disabled) { return; }

  L.DomUtil.disableImageDrag();
  L.DomUtil.disableTextSelection();

  var first = e.touches ? e.touches[0] : e,
      el = first.target;

  // if touching a link, highlight it
  if (L.Browser.touch && el.tagName && el.tagName.toLowerCase() === 'a') {
    L.DomUtil.addClass(el, 'leaflet-active');
  }

  if (this._moving) { return; }

  this._startPoint = new L.Point(first.clientX, first.clientY);
  this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

  L.DomEvent
      .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
      .on(document, L.Draggable.END[e.type], this._onUp, this);
}