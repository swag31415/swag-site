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
		target_path = hit.item
		if (hit.type == "stroke") {
			target_seg = target_path.insert(hit.location.index + 1, e.point)
			target_path.smooth()
		} else {
      target_seg = hit.segment
    }
  }
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