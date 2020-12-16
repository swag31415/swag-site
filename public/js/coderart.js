const eq = (a, b) => // Because js sucks
  a.length === b.length &&
  a.every((v, i) => v === b[i]);

function update_image() {
  width = $("#width").val()
  height = $("#height").val()
  n_runs = $("#n_runs").val()
  func = eval(`(x, y, i, w, h, c, top, bottom, left, right, get, rgb, cmy) => {${codemirror.getValue()}}`)

  var img = new Uint8ClampedArray(4 * width * height)

  let calc = (x, y) => {
    return 4 * (y * width + x)
  }
  let get = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height)
      return [0, 0, 0, 0]
    idx = calc(x, y)
    return [img[idx], img[idx + 1], img[idx + 2], img[idx + 3]]
  }
  let rgb = (r, g, b, a = 255) => [r, g, b, a]
  let cmy = (c, m, y, k = 0) => [255 - c, 255 - m, 255 - y, 255 - k]

  for (let i = 0; i < n_runs; i++) {
    for (let y = 0; y < width; y++) {
      for (let x = 0; x < height; x++) {
        idx = calc(x, y)
        pix = func(x, y, i, width, height, get(x, y),
          get(x, y - 1), get(x, y + 1), get(x - 1, y), get(x + 1, y),
          get, rgb, cmy)
        get(x, y) // idk why this is needed but it works. TODO figure it out
        img[idx + 0] = pix[0]
        img[idx + 1] = pix[1]
        img[idx + 2] = pix[2]
        img[idx + 3] = pix[3]
      }
    }
  }

  let img_data = new ImageData(img, width, height)
  canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
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