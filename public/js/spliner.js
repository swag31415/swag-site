paper.install(window)
paper.setup("disp")

const tool = new Tool()
var cur_path

tool.onMouseDown = e => {
  cur_path = new Path()
  cur_path.strokeColor = "white"
  cur_path.add(e.point)
}

tool.onMouseDrag = e => {
  cur_path.add(e.point)
}
view.draw()