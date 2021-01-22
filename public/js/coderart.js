// -------------------------- COLOR METHODS -------------------------- //
const rgb = (r, g, b, a = 255) => [r, g, b, a] // Create an rgba color
const cmy = (c, m, y, k = 0) => [255 - c, 255 - m, 255 - y, 255 - k] // Create a cmyk color
const hsv = (h, s, v, a = 1) => { // Create a hsv color
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6)
  f = h * 6 - i
  p = v * (1 - s)
  q = v * (1 - f * s)
  t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break
    case 1: r = q, g = v, b = p; break
    case 2: r = p, g = v, b = t; break
    case 3: r = p, g = q, b = v; break
    case 4: r = t, g = p, b = v; break
    case 5: r = v, g = p, b = q; break
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), Math.round(a * 255)]
}
const eq = (a, b) => // To compare colors
  a.length === b.length && a.every((v, i) => v === b[i]);
// ------------------------------------------------------------------- //

function update_image() {
  // Get parameters
  w = $("#width").val()
  h = $("#height").val()
  n_runs = $("#n_runs").val()

  // Create the image
  var img = new Uint8ClampedArray(4 * w * h)

  // Initialize access methods
  let calc = (x, y) => 4 * (y * w + x)
  let get = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h)
      return [0, 0, 0, 0]
    idx = calc(x, y)
    return [img[idx], img[idx + 1], img[idx + 2], img[idx + 3]]
  }

  // The user's code
  func = eval(`(x, y, i, w, h, c, top, bottom, left, right, get, rgb, cmy, hsv) => {${codemirror.getValue()}}`)

  for (let i = 0; i < n_runs; i++) {
    for (let y = 0; y < w; y++) {
      for (let x = 0; x < h; x++) {
        // Run the user's function and calculate 
        pix = func(x, y, i, w, h, get(x, y),
          get(x, y - 1), get(x, y + 1), get(x - 1, y), get(x + 1, y),
          get, rgb, cmy, hsv)
        get(x, y) // idk why this is needed but it works. TODO figure it out

        // Assign the pixel values
        idx = calc(x, y)
        img[idx + 0] = pix[0]
        img[idx + 1] = pix[1]
        img[idx + 2] = pix[2]
        img[idx + 3] = pix[3]
      }
    }
  }

  let img_data = new ImageData(img, w, h)
  canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  canvas.getContext("2d").putImageData(img_data, 0, 0)

  $("#artbox").html(`<img src="${canvas.toDataURL()}">`)
}

// Initialize the codemirror
var codemirror = CodeMirror(document.getElementById("editor"), {
  mode: "text/javascript",
  tabSize: 2,
  theme: "seti",
  value: `white = rgb(255, 255, 255)
  xor = (a, b) => a ? !b : b
  if (!i && ((!x && !y) || xor(eq(top, white), eq(left, white))))
    return white
  else if (!i)
    return rgb(0, 0, 0)
  else {
    [x, y] = [(x/w)*255, (y/h)*255]
    return eq(c, white) ? rgb(y, 510-x-y, x) : cmy(y, 510-x-y, x)
  }`
})

// Add a run button to the codemirror
$("<button></button>").css({
  "position": "absolute",
  "bottom": "0.5em",
  "right": "0.5em"
}).addClass("btn")
  .text("Run")
  .click(update_image)
  .appendTo("#editor > .CodeMirror")