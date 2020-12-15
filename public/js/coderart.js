function update_image() {
  width = $("#width").val()
  height = $("#height").val()
  n_runs = $("#n_runs").val()
  func = eval(`(x, y, i, w, h, curr, get, color) => {${codemirror.getValue()}}`)

  var img = new Uint8ClampedArray(4 * width * height)

  let calc = (x, y) => 4 * (y * width + x)
  let get = (x, y) => {
    idx = calc(x, y)
    return img.slice(idx, idx + 4)
  }
  let color = (r, g, b, a = 255) => [r, g, b, a]

  for (let i = 0; i < n_runs; i++) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        idx = calc(x, y)
        pix = func(x, y, i, width, height, img.slice(idx, idx + 4), get, color)
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
  value: `br = 10
  th = 1
  if ((x >= y && x % br < th) || (y > x && y % br < th)) {
    return color((x/w)*255,
                 (y/h)*255,
                 (2-(x/w)-(y/h))*255
                )
  } else {
    return color((y/h)*255,
                 (2-(x/w)-(y/h))*255,
                 (x/w)*255
                )
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