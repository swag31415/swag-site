paper.install(window)
paper.setup("disp")

const main_tool = new Tool()
const draw_tool = new Tool()

const paths = []
const last = a => a[a.length - 1]

main_tool.onMouseDown = e => {
  // Need two for the onMouseMove stuff
  paths.push(new Path([e.point, e.point]))
  last(paths).strokeColor = "white"
  draw_tool.activate()
}

main_tool.onKeyUp = e => {
  if (e.modifiers.control && e.key == "z") {
    paths.pop().remove()
  }
}

draw_tool.onKeyUp = e => {
  if (e.key == "escape") {
    last(paths).lastSegment.remove()
    main_tool.activate()
  } else if (e.modifiers.control && e.key == "z") {
    last(paths).lastSegment.remove()
  }
}

draw_tool.onMouseDown = e => {
  last(paths).add(e.point)
}

draw_tool.onMouseMove = e => {
  last(paths).lastSegment.point = e.point
  last(paths).smooth({type: 'continuous'})
}