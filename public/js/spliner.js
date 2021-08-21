const disp = document.getElementById("disp")
paper.install(window)
paper.setup(disp)

const dock = document.getElementById("dock")
function spawn_input(name, attrs) {
  let inp = document.createElement("input")
  Object.assign(inp, {...attrs, id: (Math.random() + 1).toString(36).substring(7)})
  let label = document.createElement("label")
  Object.assign(label, {className: "active", for: inp.id, innerText: name})
  let div = document.createElement("div")
  div.className = "input-field col s4 m2"
  div.append(inp, label)
  dock.appendChild(div)
  return [div, inp]
}
function spawn_picker(name, initial_value, on_change) {
  let [div, inp] = spawn_input(name, {type: "text"})
  // Attach the picker
  let picker = new Picker(div)
  inp.addEventListener("focus", () => picker.show())
  picker.onChange = col => {
    inp.style["border-color"] = col.rgbaString
    inp.value = col.hex
    // Push the event along
    if (on_change) on_change(col)
  }
  // Handle initial value
  if (initial_value) picker.setColor(initial_value, false)
  // Add a better remove function
  picker.remove = function () {
    div.remove()
    this.destroy()
  }
  return picker
}
function spawn_slider(name, initial_value, on_change) {
  let [div, inp] = spawn_input(name, {
    type: "number",
    min: 1,
    max: 500,
    step: 1,
    value: initial_value
  })
  inp.addEventListener("change", e => on_change(e.target.value))
  // Handle initial value
  on_change(initial_value)
  return div
}

const background_picker = spawn_picker("background color", "000", c => disp.style["background-color"] = c.hex)

const history = {
  prev: [],
  fut: [],
  length: 20,
  save: function () {
    this.prev.push(project.exportJSON())
    if (this.prev.length > this.length) this.prev.shift()
    this.fut = []
  },
  load: function (dir) {
    let [a1, a2] = ({undo: ["prev", "fut"], redo: ["fut", "prev"]})[dir]
    if (this[a1].length > 0) {
      this[a2].push(project.exportJSON())
      project.clear()
      project.importJSON(this[a1].pop())
      project.activeLayer.selected = false
    }
  },
  check_undo: function (ctrl, key) {
    if (ctrl && key == "z") this.load("undo")
    else if (ctrl && key == "y") this.load("redo")
  }
}

const main_tool = new Tool({
  onActivate: () => project.activeLayer.selected = false,
  onMouseDown: e => e.modifiers.shift ? text_tool.start(e.point) : draw_tool.start(e.point),
  onKeyUp: function (e) {
    history.check_undo(e.modifiers.control, e.key)
    if (e.key == "e") {
      edit_tool.activate()
      M.toast({ html: "<span>Switched to <strong>Edit</strong> mode</span>" })
    } else if (e.modifiers.control && e.key == "v") {
      paste_tool.start(this)
    }
  }
})

const draw_tool = new Tool({
  def_stroke: "#fff",
  def_fill: "#fff0",
  def_thicc: 1,
  start: function (point) {
    history.save()
    // Need two for the onMouseMove stuff
    this.path = new Path([point, point])
    // Add color controls
    this.stroke_picker = spawn_picker("stroke color", this.def_stroke, c => {
      draw_tool.def_stroke = c.hex
      draw_tool.path.strokeColor = c.hex
    })
    this.fill_picker = spawn_picker("fill color", this.def_fill, c => {
      draw_tool.def_fill = c.hex
      draw_tool.path.fillColor = c.hex
    })
    this.thicc_slider = spawn_slider("thickness", this.def_thicc, n => {
      draw_tool.def_thicc = n
      draw_tool.path.strokeWidth = n
    })
    this.activate()
  },
  onDeactivate: function () {
    this.stroke_picker.remove()
    this.fill_picker.remove()
    this.thicc_slider.remove()
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
  select_tool: new Tool({
    start: function (point) {
      this.path = new Path({
        segments: [point],
        strokeColor: "#06e",
        fillColor: "#06e3",
        closed: true
      })
      this.activate()
    },
    onMouseDrag: function (e) {
      this.path.add(e.point)
    },
    onMouseUp: function(e) {
      // Calculate selected segments
      let segs = project.activeLayer.children
        .filter(path => path.id != this.path.id)
        .flatMap(path => path.segments)
        .filter(seg => this.path.contains(seg.point))
      this.path.remove()
      if (segs.length == 0) edit_tool.activate()
      else edit_tool.bulk_tool.start(segs)
    }
  }),
  bulk_tool: new Tool({
    start: function (segments) {
      this.segs = segments
      project.activeLayer.selected = false
      this.segs.forEach(seg => seg.point.selected = true)
      this.pivot = this.segs.map(seg => seg.point).reduce((p1, p2) => p1.add(p2)).divide(this.segs.length)
      this.activate()
    },
    onMouseDown: function (e) {
      history.save()
      let hit = project.hitTest(e.point, edit_tool.hit_opts)
      if (hit && hit.type == "segment" && hit.segment.selected) this.mode = "move"
      else this.mode = "spin"
    },
    onMouseDrag: function (e) {
      switch (this.mode) {
      case "move":
        this.segs.forEach(seg => seg.point = seg.point.add(e.delta))
        this.pivot = this.pivot.add(e.delta)
        break;
      case "spin":          
        let ang = e.point.subtract(this.pivot).angle - e.lastPoint.subtract(this.pivot).angle
        let trans = new Matrix().rotate(ang, this.pivot)
        this.segs.forEach(seg => seg.transform(trans))
      }
    },
    onKeyUp: function (e) {
      if (e.key == "escape") {
        project.activeLayer.selected = false
        edit_tool.activate()
      }
    }
  }),
  hit_opts: {
    segments: true,
    stroke: true,
    tolerance: 5
  },
  onMouseDown: function (e) {
    let hit = project.hitTest(e.point, this.hit_opts)
    if (hit) {
      history.save()
      this.target_path = hit.item
      if (hit.type == "stroke") {
        this.target_seg = this.target_path.insert(hit.location.index + 1, e.point)
        this.target_path.smooth()
      } else {
        this.target_seg = hit.segment
      }
    } else this.select_tool.start(e.point)
  },
  onMouseMove: function (e) {
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
    history.check_undo(e.modifiers.control, e.key)
    if (e.key == "e") {
      main_tool.activate()
      M.toast({ html: "<span>Switched back to <strong>Draw</strong> mode</span>" })
    } else if (e.modifiers.control && e.key == "v") {
      paste_tool.start(this)
    } else if (this.hov_hit) {
      if (e.key == "delete") {
        history.save()
        if (this.hov_hit.segment) this.hov_hit.segment.remove()
        else this.hov_hit.item.remove()
      } else if (e.modifiers.control && e.key == "c") {
        navigator.clipboard.writeText(this.hov_hit.item.exportJSON())
      } else if (e.modifiers.control && e.key == "x") {
        navigator.clipboard.writeText(this.hov_hit.item.exportJSON())
        this.hov_hit.item.remove()
      }
    }
  }
})

const paste_tool = new Tool({
  start: function (prev_tool) {
    history.save()
    this.prev_tool = prev_tool
    this.activate()
    navigator.clipboard.readText()
      .then(t => this.paste = new Path().importJSON(t))
      .catch(e => {
        M.toast({ html: "<span>Error parsing clipboard</span>", classes: "red" })
        main_tool.activate()
      })
  },
  onMouseMove: function (e) {
    if (this.paste) this.paste.position = e.point
  },
  onMouseDown: function (e) {
    this.paste.position = e.point
    this.paste = null
    this.prev_tool.activate()
  }
})

const text_tool = new Tool({
  def_fill: "#fff",
  start: function (point) {
    history.save()
    this.text = new PointText(point)
    this.fill_picker = spawn_picker("text color", this.def_fill, c => {
      this.def_fill = c.hex
      this.text.fillColor = c.hex
    })
    this.activate()
  },
  onMouseDown: () => main_tool.activate(),
  onDeactivate: function () {
    this.fill_picker.remove()
  },
  onKeyDown: function (e) {
    if (e.key == "escape") main_tool.activate()
    else if (e.key == "backspace" || e.key == "delete")
      this.text.content = this.text.content.slice(0, -1)
    else if (e.modifiers.control && e.key == "v")
      navigator.clipboard.readText().then(t => this.text.content += t)
    else this.text.content += e.character
  }
})