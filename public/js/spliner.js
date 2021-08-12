const SVG = "http://www.w3.org/2000/svg"
const disp = document.getElementById("disp")

const dot_r = "1"
function add_dot(x, y, style) {
  circ = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  circ.setAttribute("cx", x)
  circ.setAttribute("cy", y)
  circ.setAttribute("r", dot_r)
  circ.style = style ? style : ""
  disp.append(circ)
  return circ
}

function add_poly(is_closed, style) {
  pgon = document.createElementNS(SVG, is_closed ? "polygon" : "polyline")
  pgon.style = style ? style : ""
  disp.append(pgon)
  return pgon
}

function extend_poly(poly, x, y) {
  pnt = disp.createSVGPoint()
  pnt.x = x
  pnt.y = y
  poly.points.appendItem(pnt)
  return pnt
}

function add_quad(is_closed, style) {
  path = document.createElementNS(SVG, "path")
  path.setAttributeNS(null, "d", "")
  path.dataset.points = JSON.stringify([])
  path.dataset.is_closed = JSON.stringify(is_closed)
  path.style = style ? style : ""
  disp.append(path)
  return path
}

function extend_quad(quad, x, y) {
  // Update data-points
  pnts = JSON.parse(quad.dataset.points)
  pnts.push([x, y])
  quad.dataset.points = JSON.stringify(pnts)
  // Update d
  d = pnts.reduce((str, [x, y], i) => {
    cmd = (["M", "Q", " "])[i] || "T"
    return str + cmd + x + "," + y
  }, "")
  if (JSON.parse(quad.dataset.is_closed)) {
    [x0, y0] = pnts[0]
    d += "T" + x0 + "," + y0
  }
  quad.setAttributeNS(null, "d", d)
}

// const curv = add_quad(true, "fill: none; stroke: #fff")
// disp.addEventListener("mouseup", e => {
//   extend_quad(curv, e.offsetX, e.offsetY)
// })

// const poly = add_poly(true, "fill: none; stroke: #fff")

// disp.addEventListener("mouseup", e => {
//   extend_poly(poly, e.offsetX, e.offsetY)
// })

const def_style = "fill: none; stroke: #fff"
var elem = null
var extend = null
document.addEventListener("keyup", e => {
  const key_map = {
    "s" : [add_quad, extend_quad],
    "z" : [add_poly, extend_poly],
    "Escape" : [() => null, null]
  }
  if (e.key in key_map) {
    e.preventDefault();
    [addf, extend] = key_map[e.key]
    elem = addf(e.shiftKey, def_style)
    console.log(e.shiftKey)
    return false
  }

  // if (e.key == "s") {
  //   extend = extend_quad
  //   elem = add_quad(e.altKey, def_style)
  // } else if (e.key == "z") {
  //   extend = extend_poly
  //   elem = add_poly(e.altKey, def_style)
  // } else if (e.key == "Escape") {
  //   extend = null
  //   elem = null
  // }
})

document.addEventListener("mouseup", e => {
  if (extend) extend(elem, e.offsetX, e.offsetY)
})