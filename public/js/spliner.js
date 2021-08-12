paper.install(window)
paper.setup("disp")

const tool = new Tool()
var cur_path

tool.onKeyUp = e => {
  if (e.key == "s") {
    cur_path = new Path()
    cur_path.strokeColor = "white"
  }
}

tool.onMouseDown = e => {
  cur_path.add(e.point)
}

tool.onMouseUp = e => {
  cur_path.smooth()
}