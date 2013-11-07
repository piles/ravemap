hyp = (a, b) -> Math.sqrt a*a + b*b

initCanvas = ->
  window.canvas = document.getElementById 'canvas'
  window.ctx = canvas.getContext '2d'

  sizeCanvasesToWindow()

  window.addEventListener 'resize', sizeCanvasesToWindow, false

sizeCanvasesToWindow = ->
  resetContextOrigin ctx
  # resetContextOrigin b_ctx

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
  # centerContextOrigin b_ctx

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

# window.onload = ->
initCanvas()