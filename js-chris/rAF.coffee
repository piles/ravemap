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