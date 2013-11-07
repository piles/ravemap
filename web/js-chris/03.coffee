###
  Author: Chris Shier
  Website: http://csh.bz
  Date: October 1st 2013
###

# https://gist.github.com/paulirish/1579671
do -> # set window.requestAnimationFrame()
  w = window
  lastTime = 0
  vendors = ['webkit', 'moz']
  unless w.requestAnimationFrame
    for i in [0...vendors.length]
      w.requestAnimationFrame = w["#{vendors[i]}RequestAnimationFrame"]
      w.cancelAnimationFrame = w["#{vendors[i]}CancelAnimationFrame"] or
        w["#{vendors[i]}CancelRequestAnimationFrame"]
  unless w.requestAnimationFrame
    w.requestAnimationFrame = (callback, element) ->
      currTime = new Date().getTime()
      timeToCall = Math.max 0, 16 - (currTime - lastTime)
      id = w.setTimeout(->
        callback currTime + timeToCall
      , timeToCall)
      lastTime = currTime + timeToCall
      id
  unless w.cancelAnimationFrame
    w.cancelAnimationFrame = (id) ->
      clearTimeout id

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
  clicks: 1

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

hyp = (a, b) -> Math.sqrt a*a + b*b

initCanvas = ->
  window.canvas = document.getElementById 'canvas'
  window.ctx = canvas.getContext '2d'
  window.b_canvas = document.createElement 'canvas'
  window.b_ctx = b_canvas.getContext '2d'
  sizeCanvas b_canvas, 512, 512
  centerContextOrigin b_ctx
  sizeCanvasesToWindow()

  window.addEventListener 'resize', sizeCanvasesToWindow, false

sizeCanvasesToWindow = ->
  resetContextOrigin ctx
  resetContextOrigin b_ctx

  w = window
  d = document
  e = d.documentElement
  g =  d.getElementsByTagName('body')[0]
  width = w.innerWidth or e.clientWidth or g.clientWidth
  height = w.innerHeight or e.clientHeight or g.clientHeight

  ow = canvas.width
  oh = canvas.height

  canvasCopy = document.createElement 'canvas'
  contextCopy = canvasCopy.getContext '2d'
  canvasCopy.width = ow
  canvasCopy.height = oh

  sizeCanvas canvas, width, height

  centerContextOrigin ctx
  centerContextOrigin b_ctx

sizeCanvas = (canvas, width, height) ->
  canvas.w_FLOAT = width
  canvas.h_FLOAT = height
  canvas.width   = width
  canvas.height  = height
  canvas.top     = -height / 2
  canvas.right   = width / 2
  canvas.bottom  = height / 2
  canvas.left    = -width / 2

centerContextOrigin = (context) ->
  context.restore()
  context.translate context.canvas.w_FLOAT/2, context.canvas.h_FLOAT/2
  context.save()

resetContextOrigin = (context) ->
  context.restore()
  context.translate context.canvas.left, context.canvas.top
  context.save()

initCanvas()

TIME = 0

NOW = Date.now()

FRAME = 0

PI = Math.PI

sin = (a) -> Math.sin a

cos = (a) -> Math.cos a

tan = (a) -> Math.tan a

abs = (a) -> Math.abs a

hyp = (a, b) -> Math.sqrt a*a + b*b

radToDeg = (rad) -> rad / (Math.PI/180)

degToRad = (deg) -> deg * (Math.PI/180)

between = (min, x, max) -> Math.min(Math.max(x, min), max)

interpolate = (a, b, t) -> a * (1 - t) + b * t

rgba = (r = 255, g = 0, b = 255, a = 1) ->
  r = between 0, r|0, 255
  g = between 0, g|0, 255
  b = between 0, b|0, 255
  a = between 0, a, 1
  "rgba( #{r}, #{g}, #{b}, #{a})"

hsla = (h = 0, s = 100, l = 50, a = 1) ->
  h = (h|0) % 360
  s = between 0, s, 100
  l = between 0, l, 100
  a = between 0, a, 1
  "hsla(#{h}, #{s}%, #{l}%, #{a})"

clear = (context) ->
  context.clearRect context.canvas.left, context.canvas.top, context.canvas.width, context.canvas.height

clearWhite = (context) ->
  context.fillStyle = 'white'
  context.fillRect context.canvas.left, context.canvas.top, context.canvas.width, context.canvas.height

clearBlack = (context) ->
  context.fillStyle = 'black'
  context.fillRect context.canvas.left, context.canvas.top, context.canvas.width, context.canvas.height

rainbow = (a, offset = 1) ->
  r = sin(a + 0*PI/3*offset)*127 + 128
  g = sin(a + 2*PI/3*offset)*127 + 128
  b = sin(a + 4*PI/3*offset)*127 + 128
  rgba r, g, b, 1

decay = (context, h, v, s, r) ->
  context.save()
  context.translate h, v
  if r isnt 0
    context.rotate r
  dx = -(context.canvas.width + s)/2
  dy = -(context.canvas.height + s)/2
  dw = context.canvas.width + s
  dh = context.canvas.height + s
  context.drawImage context.canvas, dx, dy, dw, dh
  context.restore()

imageSmoothing = (context = ctx, a = false) ->
  context.webkitImageSmoothingEnabled = a
  context.mozImageSmoothingEnabled    = a
  context.imageSmoothingEnabled       = a

paintEdges = (context, fillStyle, size = 1) ->
  canvas = context.canvas
  context.fillStyle = fillStyle
  context.fillRect canvas.left, canvas.top, canvas.width - size, size
  context.fillRect canvas.right - size, canvas.top, size, canvas.height - size
  context.fillRect canvas.left + size, canvas.bottom - size, canvas.width - size, size
  context.fillRect canvas.left, canvas.top + size, size, canvas.height - size

mapImage = new Image()
mapImage.src = './img/mapbg.png'
console.dir mapImage

do animloop = ->
  requestAnimationFrame animloop
  FRAME++

  imageSmoothing ctx, false
  imageSmoothing b_ctx, false

  paintEdges b_ctx, rainbow(FRAME / 60 + PI/2, sin(FRAME/300)*0.25 + 1), 1

  s = 5.6 / 7
  x = Mouse.x / window.innerWidth
  y = Mouse.y / window.innerHeight
  r3 = Mouse.clicks + FRAME/999999
  decay b_ctx, -cos(FRAME/940) * s - x, sin(FRAME/941) * s - y, -12, -PI - 0.0105 - r3
  decay b_ctx, sin(FRAME/942) * s + x, -cos(FRAME/943) * s + y, 10, PI + 0.0064 + r3

  ctx.clearRect canvas.left, canvas.top, canvas.width, canvas.height

  ctx.globalCompositeOperation = 'source-over'
  # UK Land areamap goes here
  ctx.drawImage mapImage, canvas.left, canvas.top, canvas.width, canvas.height

  ctx.globalCompositeOperation = 'source-out'
  resetContextOrigin b_ctx
  size = b_canvas.width / (PI*2)
  ctx.drawImage b_canvas, size, size, b_canvas.width - size*2, b_canvas.height - size*2, 
                canvas.left, canvas.top, canvas.width, canvas.height
  centerContextOrigin b_ctx

  ctx.globalCompositeOperation = 'destination-over'
  # this will be ocean
  for i in [canvas.left..canvas.right] by 30
    ctx.fillStyle = "hsla(#{i - FRAME/4 % 30}, 100%, 50%, 0.5)"
    ctx.fillRect (i - FRAME/4 % 30) + 30, canvas.top, 3, canvas.height
  for i in [canvas.top..canvas.bottom] by 30
    ctx.fillStyle = "hsla(#{i + FRAME/4 % 30}, 100%, 50%, 0.5)"
    ctx.fillRect canvas.left, i + FRAME/4 % 30, canvas.width, 3
  