###
  rgba cycling by offset sin(time)
###

# START_TIME = Date.now()

TIME = 0

NOW = Date.now()

FRAME = 0
TICK_1 = 0
TICK_2 = 0
TICK_3 = 0
TICK_4 = 0
TICK_5 = 0
TICK_6 = 0
TICK_7 = 0
TICK_8 = 0

tick = ->
  TICK_1 += cfg.ticker_1
  TICK_2 += cfg.ticker_2
  TICK_3 += cfg.ticker_3
  TICK_4 += cfg.ticker_4
  TICK_5 += cfg.ticker_5
  TICK_6 += cfg.ticker_6
  TICK_7 += cfg.ticker_7
  TICK_8 += cfg.ticker_8

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
  r = sin(a + 0*PI/3*offset)*117 + 128
  g = sin(a + 2*PI/3*offset)*117 + 128
  b = sin(a + 4*PI/3*offset)*117 + 128
  rgba r, g, b, 1

rainbowCircle = ->
  square_height = hyp(canvas.height, canvas.width) / cfg.size
  square_width = square_height
  ctx.strokeStyle = 'black'
  for i in [canvas.left + square_width*2 ... canvas.right - square_width*2] by square_width
    for j in [canvas.top + square_height*2 ... canvas.bottom - square_height*2] by square_height
      x_adj = cos(i*cfg.x_a/canvas.width  - cfg.m_sens * Mouse.x/canvas.width  + TICK_2)
      y_adj = cos(j*cfg.y_a/canvas.height + cfg.m_sens * Mouse.y/canvas.height + TICK_3)
      ctx.fillStyle = rainbow TICK_1 - x_adj - y_adj, cfg.sat * -sin(x_adj + y_adj)
      x = i
      x += sin(j * cfg.x_wv_v - i*cfg.x_wv_h + TICK_4)*square_width/2
      x -= sin(j * cfg.x_wv_v2 - i*cfg.x_wv_h2 + TICK_5)*square_width/2
      y = j
      y += sin(j * cfg.y_wv_v - i*cfg.y_wv_h + TICK_6)*square_width/2
      y -= sin(j * cfg.y_wv_v2 - i*cfg.y_wv_h2 + TICK_7)*square_width/2
      ctx.beginPath()
      ctx.arc x, y, square_width/2 - 1, 0, 2*PI, true
      # ctx.arc x, y, 4, 0, 2*PI, true
      ctx.closePath()
      ctx.fill()
      ctx.stroke() if cfg.stroke

class Point
  constructor: (@x_orig, @y_orig, @x = @x_orig, @y = @y_orig) ->

  calc: ->
    square_height = hyp(canvas.height, canvas.width) / cfg.size
    square_width = square_height
    i = @x_orig
    j = @y_orig
    x_adj = cos(i*cfg.x_a/canvas.width  + TICK_2)
    y_adj = cos(j*cfg.y_a/canvas.height + TICK_3)
    # ctx.fillStyle = rainbow TICK_1/60 - x_adj - y_adj, cfg.sat * -sin(x_adj + y_adj)
    x = i
    x += sin(j * cfg.x_wv_v - i*cfg.x_wv_h + TICK_4)*square_width/2
    x -= sin(j * cfg.x_wv_v2 - i*cfg.x_wv_h2 + TICK_5)*square_width/2
    y = j
    y += sin(j * cfg.y_wv_v - i*cfg.y_wv_h + TICK_6)*square_width/2
    y -= sin(j * cfg.y_wv_v2 - i*cfg.y_wv_h2 + TICK_7)*square_width/2

    # @x = @x_orig + sin(TICK_1 + @y_orig/canvas.height*7)*8
    # @y = @y_orig + sin(TICK_2 + @x_orig/canvas.width *6)*7
    @x = x
    @y = y

# x_interval = hyp(canvas.width, canvas.height) / 32
x_interval = 150
y_interval = x_interval

initPoints = ->
  window.points = []
  for i in [canvas.left ... canvas.right] by x_interval
    points.push []
  for i in [0 ... points.length] by 1
    for j in [canvas.top ... canvas.bottom] by y_interval
      points[i].push new Point (i*x_interval - canvas.width/2), j
  console.dir points[0][0]
  return true

window.addEventListener 'resize', initPoints, false
window.addEventListener 'orientationChange', initPoints, false

drawPoints = ->
  for i in [0 ... points.length] by 1
    for j in [0 ... points[i].length] by 1
      points[i][j].calc()
  for i in [1 ... points.length] by 1
    for j in [1 ... points[i].length] by 1
      # rainbow_in = cos(points[i][j].x/canvas.width*4)*3 + cos(points[i][j].y/canvas.height*4)*3
      # ctx.fillStyle = rainbow rainbow_in + TICK_3, 0.1
      # ctx.fillStyle = rainbow 300 + (points[i][j].x - points[i][j].x_orig)/8 - (points[i][j].y - points[i][j].y_orig)/8, 1 * cfg.sat
      hue_x = points[i][j].x / canvas.width * 2
      hue_y = points[i][j].y / canvas.height * 2
      hue_x_delta = (hue_x - points[i][j].x_orig)/canvas.width*2
      hue_y_delta = (hue_y - points[i][j].y_orig)/canvas.height*2
      hue_in = cos(hue_x*3) + cos(hue_y*3)
      ctx.strokeStyle = rainbow( hue_in + TICK_1/10, 1 )
      # ctx.strokeStyle = 'white'
      # ctx.strokeStyle = ctx.fillStyle
      ctx.beginPath()
      ctx.moveTo points[i-1][j-1].x, points[i-1][j-1].y
      ctx.lineTo points[i  ][j-1].x, points[i  ][j-1].y
      ctx.lineTo points[i  ][j  ].x, points[i  ][j  ].y
      ctx.lineTo points[i-1][j  ].x, points[i-1][j  ].y
      ctx.lineTo points[i-1][j-1].x, points[i-1][j-1].y
      ctx.closePath()
      ctx.fill() if cfg.fill
      ctx.stroke() if cfg.stroke

      # ctx.fillStyle = rainbow points[i][j].x/6 + points[i][j].y/6,
      #                 3/4 + Math.sin(Date.now()/16000)/6
      # ctx.beginPath()
      # ctx.moveTo points[i  ][j-1].x, points[i  ][j-1].y
      # ctx.lineTo points[i  ][j  ].x, points[i  ][j  ].y
      # ctx.lineTo points[i-1][j  ].x, points[i-1][j  ].y
      # ctx.lineTo points[i  ][j-1].x, points[i  ][j-1].y
      # ctx.closePath()
      # ctx.fill()
      # ctx.stroke()
  return true

decay = (h, v, s, r) ->
  ctx.save()
  ctx.translate h, v
  if r isnt 0
    ctx.rotate r
  dx = -(canvas.width + s)/2
  dy = -(canvas.height + s)/2
  dw = canvas.width + s
  dh = canvas.height + s
  ctx.drawImage canvas, dx, dy, dw, dh
  ctx.restore()

glitch = (context) ->
  d = context.getImageData 0, 0, context.canvas.width, context.canvas.height
  n = 0
  # d.data.reverse()
  multiplier = 1.001
  mult2 = 2
  modulo = 255 / mult2
  while n < d.width * d.height
    i = n*4
    if n % (11 + Date.now()%22) < 4
      d.data[i+0] = (d.data[i+0]*multiplier % modulo) * mult2
      d.data[i+1] = (d.data[i+1]*multiplier % modulo) * mult2
      d.data[i+2] = (d.data[i+2]*multiplier % modulo) * mult2
    if d.data[i+1] > 200 and n % 3 is 0
      d.data[i+3] = 0
    n++
  context.putImageData d, 0, 0

blocker = document.getElementById 'blocker'
blocker.style.visibility = 'hidden'

flipBlocker = ->
  switch blocker.style.visibility
    when 'visible'
      blocker.style.visibility = 'hidden'
    when 'hidden'
      blocker.style.visibility = 'visible'

window.onmousedown = flipBlocker

imageSmoothing = (context = ctx, a = false) ->
  context.webkitImageSmoothingEnabled = a
  context.mozImageSmoothingEnabled    = a
  context.imageSmoothingEnabled       = a

animloop = ->
  requestAnimationFrame animloop
  FRAME++

  tick()
  imageSmoothing ctx, false

  glitch ctx if FRAME % 277 < (Date.now() % 7)

  mxc = Mouse.x / canvas.width - 0.5
  myc = Mouse.y / canvas.height - 0.5
  horizontal = mxc * 4;
  vertical = myc * 4;

  alternator = Math.sin(Date.now()/12800)+1.1
  spread = alternator * 4
  # rotate = ((Mouse.x / canvas.width) - 0.5) / (canvas.height / (Mouse.y - canvas.height / 2) * 40)
  rotate = 0

  # decay 0, -1, 1, 0
  # decay 0, 0, 0, PI
  decay 1, 1, -spread, 0.008 * alternator - (Math.PI + (Mouse.clicks)/2 + 1)
  decay -1, -1, spread, -0.007 * alternator + (Math.PI + (Mouse.clicks)/2 + 1)

  # drawPoints()
  

  glitch ctx if FRAME % 377 < (Date.now() % 9)

Configuration = ->

  size: 36

  stroke: true
  fill: false

  x_wv_h: 0.001
  x_wv_v: 0.002
  y_wv_h: 0.003
  y_wv_v: 0.004

  x_wv_h2: -0.005
  x_wv_v2: -0.006
  y_wv_h2: -0.007
  y_wv_v2: -0.008

  m_sens: 0.1
  offset_3: 1
  offset_2: 1
  offset_1: 1
  x_a: 1
  y_a: -3
  sat: 0.5

  ticker_1: 1/16
  ticker_2: 1/17
  ticker_3: 1/32
  ticker_4: 1/146
  ticker_5: 1/156
  ticker_6: 1/166
  ticker_7: 1/176
  ticker_8: 1/186

window.cfg = new Configuration()

initGui = ->
  gui = new dat.GUI()
  gui.remember cfg
  gui.close()
  dat.GUI.toggleHide()
  gui.add(cfg, 'size', 1, 128)
  gui.add(cfg, 'stroke')
  gui.add(cfg, 'fill')
  f_waves = gui.addFolder 'Waves'
  f_waves.add(cfg, 'x_wv_v', -1/40, 1/40)
  f_waves.add(cfg, 'x_wv_v2', -1/40, 1/40)
  f_waves.add(cfg, 'y_wv_h', -1/40, 1/40)
  f_waves.add(cfg, 'y_wv_h2', -1/40, 1/40)
  f_waves.add(cfg, 'y_wv_v', -1/40, 1/40)
  f_waves.add(cfg, 'y_wv_v2', -1/40, 1/40)
  f_waves.add(cfg, 'x_wv_h', -1/40, 1/40)
  f_waves.add(cfg, 'x_wv_h2', -1/40, 1/40)
  f_waves.add(cfg, 'x_a', -30, 30)
  f_waves.add(cfg, 'y_a', -30, 30)
  # f_waves.open()
  f_time = gui.addFolder 'Time'
  f_time.add(cfg, 'ticker_1', -1/50, 1/50)
  f_time.add(cfg, 'ticker_2', -1/50, 1/50)
  f_time.add(cfg, 'ticker_3', -1/50, 1/50)
  f_time.add(cfg, 'ticker_4', -1/50, 1/50)
  f_time.add(cfg, 'ticker_5', -1/50, 1/50)
  f_time.add(cfg, 'ticker_6', -1/50, 1/50)
  f_time.add(cfg, 'ticker_7', -1/50, 1/50)
  # f_time.add(cfg, 'ticker_8', -1/50, 1/50)
  # f_time.open()
  f_hue = gui.addFolder 'Hue'
  f_hue.add(cfg, 'sat', 0, 1)
  f_hue.add(cfg, 'offset_1', 0, PI)
  f_hue.add(cfg, 'offset_2', 0, PI)
  f_hue.add(cfg, 'offset_3', 0, PI)
  # f_hue.open()

window.onload = ->
  initGui()
  initPoints()
  animloop()
