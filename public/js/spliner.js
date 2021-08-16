paper.install(window)
paper.setup("disp")

const main_tool = new Tool()
const draw_tool = new Tool()
const edit_tool = new Tool()

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
  } else if (e.key == "e") {
    paths.forEach(path => path.fullySelected = true)
    edit_tool.activate()
    M.toast({html: "<span>Switched to <strong>Edit</strong> mode</span>"})
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

edit_tool.onKeyUp = e => {
  if (e.key == "e") {
    paths.forEach(path => path.fullySelected = false)
    main_tool.activate()
    M.toast({html: "<span>Switched back to <strong>Draw</strong> mode</span>"})
  }
}