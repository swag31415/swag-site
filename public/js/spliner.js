paper.install(window)
paper.setup("disp")

var cur_path, shad_path

const main_tool = new Tool()
const draw_tool = new Tool()

main_tool.onMouseDown = e => {
  // Need two for the onMouseMove stuff
  cur_path = new Path([e.point, e.point])
  cur_path.strokeColor = "white"
  draw_tool.activate()
}

draw_tool.onKeyUp = e => {
  if (e.key == "escape") {
    cur_path.lastSegment.remove()
    main_tool.activate()
  }
}

draw_tool.onMouseDown = e => {
  cur_path.add(e.point)
}

draw_tool.onMouseMove = e => {
  cur_path.lastSegment.point = e.point
  cur_path.smooth({type: 'continuous'})
}