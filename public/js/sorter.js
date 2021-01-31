// Initialize Materialize Select
$(document).ready(() => $("select").formSelect());

// Turns all the sorts in #sorts into options
let sorts = $("#sorts").children().hide()
$("#sort_choice")
  .append(sorts.toArray().map(v => `<option value="${v.id}">${v.id}</option>`))
  .change(e => sorts.hide().filter((i, v) => v.id == e.target.value).show())

// Number sort
$("#in_numbers").keyup(e => {
  nums = e.target.value.match(/-?(\d+(\.\d+)?|\.\d+)/g)
  $("#out_numbers").text(nums ?
    nums.sort((a, b) => a - b).reduce((a, v) => a + ", " + v) :
    "The numbers will show up sorted here"
  )
})

// Reads all the images and returns a promise array of jquery img elements
function read_all(images) {
  return Promise.all(
    [...images].map(v => new Promise(res => {
      const reader = new FileReader()
      reader.onload = e => res(`<img src="${e.target.result}"/>`)
      reader.readAsDataURL(v)
    }))
  )
}

// Compares two images using the user (returns a promise)
function compare(img1, img2) {
  return new Promise(res => {
    $("#img1").html(img1).click(() => res(true))
    $("#img2").html(img2).click(() => res(false))
  })
}

// Uses Binary search to insert. For the fg_sort
async function bin_insert(a, e, cmp, i = 0, j = a.length - 1) {
  if (i > j) { a.splice(i, 0, e); return a }
  let mid = Math.floor((i + j) / 2)
  return await cmp(e, a[mid]) ? bin_insert(a, e, cmp, i, mid - 1) : bin_insert(a, e, cmp, mid + 1, j)
}

// Ford-Johnson algorithm based off the wikipedia article
// I couldn't quite figure out the ordering part so thats excluded
async function fj_sort(a, cmp) {
  if (a.length < 2) return a
  let pairs = []
  let leftover = a.length % 2 ? a.pop() : undefined
  for (let i = 0; i < a.length; i += 2)
    pairs.push(await cmp(a[i], a[i + 1]) ? [a[i], a[i + 1]] : [a[i + 1], a[i]])
  pairs = await fj_sort(pairs, (a, b) => cmp(a[0], b[0]))
  // pairs = pairs.sort((a, b) => a[0][0] - b[0][0])
  let sorted = pairs.pop(); next = []
  while (v = pairs.pop()) {
    sorted.unshift(v[0])
    sorted = await bin_insert(sorted, v[1], cmp)
  }
  if (leftover) sorted = await bin_insert(sorted, leftover, cmp)
  return sorted
}

// Hide the image stuff before the images get selected
$("#img_questions,#img_results").hide()

// Image sort
$("#in_images").change(e => {
  $("#img_questions").show()
  read_all(e.target.files)
    .then(v => fj_sort(v, compare))
    .then(v => {
      $("#img_questions").hide()
      $("#img_results").show().append(
        v.map(v2 => `<div class="card col s12 m6 xl4"><div class="card-image">${v2}</div></div>`)
      )
    })
})