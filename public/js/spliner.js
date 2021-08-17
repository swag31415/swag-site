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

const main_tool = new Tool({
  onMouseDown: e => draw_tool.start(e.point),
  onKeyUp: e => {
    if (e.modifiers.control && e.key == "z") revert()
    else if (e.key == "e") {
      edit_tool.activate()
      M.toast({ html: "<span>Switched to <strong>Edit</strong> mode</span>" })
    }
  }
})

const draw_tool = new Tool({
  start: function (point) {
    save()
    // Need two for the onMouseMove stuff
    this.path = new Path([point, point])
    this.path.strokeColor = "white"
    this.activate()
  },
  onKeyUp: function (e) {
    if (e.key == "escape") {
      this.path.lastSegment.remove()
      main_tool.activate()
    } else if (e.modifiers.control && e.key == "z") {
      this.path.lastSegment.remove()
      // If we deleted the whole line
      if (!this.path.lastSegment) main_tool.activate()
    } else if (e.key == "space") {
      this.path.closed = !this.path.closed
    }
  },
  onMouseDown: function (e) {
    this.path.add(e.point)
  },
  onMouseMove: function (e) {
    this.path.lastSegment.point = e.point
    this.path.smooth({ type: "continuous" })
  }
})

const edit_tool = new Tool({
  hit_opts: {
    segments: true,
    stroke: true,
    tolerance: 5
  },
  onMouseDown: function (e) {
    if (this.paste) {
      this.paste.position = e.point
      this.paste = null
      return null
    }
    let hit = project.hitTest(e.point, this.hit_opts)
    if (hit) {
      save()
      this.target_path = hit.item
      if (hit.type == "stroke") {
        this.target_seg = this.target_path.insert(hit.location.index + 1, e.point)
        this.target_path.smooth()
      } else {
        this.target_seg = hit.segment
      }
    }
  },
  onMouseMove: function (e) {
    if (this.paste) {
      this.paste.position = e.point
      return null
    }
    project.activeLayer.selected = false
    this.hov_hit = project.hitTest(e.point, this.hit_opts)
    if (this.hov_hit) this.hov_hit.item.selected = true
  },
  onMouseDrag: function (e) {
    if (!this.target_path || !this.target_seg) return;
    this.target_seg.point = e.point
    this.target_path.smooth({ type: "continuous" })
  },
  onMouseUp: function (e) {
    this.target_path = null
    this.target_seg = null
  },
  onKeyUp: function (e) {
    if (e.modifiers.control && e.key == "z") revert()
    else if (e.key == "e") {
      project.activeLayer.selected = false
      main_tool.activate()
      M.toast({ html: "<span>Switched back to <strong>Draw</strong> mode</span>" })
    } else if (e.key == "delete") {
      save()
      if (this.hov_hit.segment) this.hov_hit.segment.remove()
      else this.hov_hit.item.remove()
    } else if (e.modifiers.control && e.key == "c") {
      navigator.clipboard.writeText(this.hov_hit.item.exportJSON())
    } else if (e.modifiers.control && e.key == "v") {
      save()
      navigator.clipboard.readText().then(t => this.paste = new Path().importJSON(t))
    } else if (e.modifiers.control && e.key == "x") {
      navigator.clipboard.writeText(this.hov_hit.item.exportJSON())
      this.hov_hit.item.remove()
    }
  }
})