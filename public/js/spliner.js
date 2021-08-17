paper.install(window)
paper.setup("disp")

let history = []
function save() {
  history.push(project.exportJSON())
  if (history.length > 20) history.shift()
}
function revert() {
  if (history.length > 0) {
    project.clear()
    project.importJSON(history.pop())
    project.activeLayer.selected = false
  }
}

const main_tool = new Tool()
const draw_tool = new Tool()
const edit_tool = new Tool()

const paths = []
const last = a => a[a.length - 1]

main_tool.onMouseDown = e => {
  save()
  // Need two for the onMouseMove stuff
  paths.push(new Path([e.point, e.point]))
  last(paths).strokeColor = "white"
  draw_tool.activate()
}

main_tool.onKeyUp = e => {
  if (e.modifiers.control && e.key == "z") revert()
  else if (e.key == "e") {
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
    // If we deleted the whole line
    if (!last(paths).lastSegment) main_tool.activate()
  } else if (e.key == "space") {
    last(paths).closed = !last(paths).closed
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
  if (e.modifiers.control && e.key == "z") revert()
  else if (e.key == "e") {
    project.activeLayer.selected = false
    main_tool.activate()
    M.toast({html: "<span>Switched back to <strong>Draw</strong> mode</span>"})
  }
}

const hit_opts = {
  segments: true,
  stroke: true,
  tolerance: 5
}
var target_path = null
var target_seg = null
edit_tool.onMouseDown = e => {
  let hit = project.hitTest(e.point, hit_opts)
  if (hit) {
    save()
		target_path = hit.item
		if (hit.type == "stroke") {
			target_seg = target_path.insert(hit.location.index + 1, e.point)
			target_path.smooth()
		} else {
      target_seg = hit.segment
    }
  }
}

edit_tool.onMouseMove = e => {
	project.activeLayer.selected = false
  let hit = project.hitTest(e.point, hit_opts)
	if (hit) hit.item.selected = true
}

edit_tool.onMouseDrag = e => {
  if (!target_path || !target_seg) return;
  target_seg.point = e.point
  target_path.smooth({type:"continuous"})
}

edit_tool.onMouseUp = e => {
  target_path = null
  target_seg = null
}