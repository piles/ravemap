###
  rgba cycling by offset sin(time)
###

# START_TIME = Date.now()

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

  # contextCopy.drawImage b_canvas, 0, 0
  # b_canvas.side = hyp width, height
  # sizeCanvas b_canvas, b_canvas.side, b_canvas.side
  # b_ctx.drawImage canvasCopy, 0, 0, ow, oh

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

window.rainbow = (a, offset = 1) ->
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

blocker = document.getElementById 'blocker'
# blocker.style.visibility = 'hidden'

flipBlocker = ->
  switch blocker.style.visibility
    when 'visible'
      blocker.style.visibility = 'hidden'
    when 'hidden'
      blocker.style.visibility = 'visible'

# window.onmousedown = flipBlocker

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

# b_ctx.fillStyle = rainbow 3, 1
# b_ctx.fillRect b_canvas.left, b_canvas.top, b_canvas.width, b_canvas.height

Mouse.clicks = 1

animloop = ->
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

  resetContextOrigin b_ctx
  size = b_canvas.width / (PI*2)
  ctx.drawImage b_canvas, size, size, b_canvas.width - size*2, b_canvas.height - size*2, 
                canvas.left, canvas.top, canvas.width, canvas.height
  centerContextOrigin b_ctx

Configuration = ->
  size: 36

window.cfg = new Configuration()

initGui = ->
  gui = new dat.GUI()
  gui.remember cfg
  gui.close()
  dat.GUI.toggleHide()
  gui.add(cfg, 'size', 1, 128)

window.onload = ->
  initGui()
  animloop()
