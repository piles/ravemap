window.Mouse =
  x: -1
  y: -1
  xs: -1
  ys: -1
  xa: -1
  xb: -1
  ya: -1
  yb: -1
  up: true
  down: false
  clicks: 0

  events:
    up: (e) ->
      Mouse.up = true
      Mouse.down = !Mouse.up
      Mouse.clicks++
    down: (e) ->
      e.preventDefault()
      Mouse.down = true
      Mouse.up = !Mouse.down
    move: (e) ->
      if 'touches' of e
        e.preventDefault()
        e = e.touches[0]
      return if e.pageX is Mouse.x or e.pageY is Mouse.y
      Mouse.x = Math.round e.pageX - window.innerWidth / 2
      Mouse.y = Math.round e.pageY - window.innerHeight / 2
      Mouse.xs = (Mouse.x + Mouse.xb) * 0.5
      Mouse.ys = (Mouse.y + Mouse.yb) * 0.5
      Mouse.xb = Mouse.x
      Mouse.yb = Mouse.y

window.addEventListener 'mousedown', Mouse.events.down, false
window.addEventListener 'mouseup', Mouse.events.up, false
window.addEventListener 'mousemove', Mouse.events.move, false
window.addEventListener 'touchstart', Mouse.events.down, false
window.addEventListener 'touchend', Mouse.events.up, false
window.addEventListener 'touchmove', Mouse.events.move, false
