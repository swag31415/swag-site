const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
let data = {}

$("td.tile").each((i, t) => data[t.className] = [])

function update(tile, val) {
  if (data[tile.className].includes(val)) return;
  tile.className.match(/[rcb]\d/g).forEach(g => $("td.tile." + g).each((i, t) => {
    blklst = data[t.className]
    if (tile.innerText != "") blklst.splice(blklst.indexOf(tile.innerText), 1)
    if (val != "") blklst.push(val)
  }))
  tile.innerText = val
}

function solve(i = 100) {
  if (i < 0) return false;
  let imp = true
  while (imp) {
    imp = false
    $("td.tile:empty").each((i, t) => {
      posi = nums.filter(n => !data[t.className].includes(n))
      if (posi.length == 1) {
        update(t, posi[0])
        imp = true
      }
    })
  }
  if ($("td.tile:empty").length > 0) {
    mat = [...$("td.tile")]
      .map(t => [t, nums.filter(n => !data[t.className].includes(n))])
      .filter(v => v[1].length != 0)
    let [t, posi] = rand(mat)
    update(t, rand(posi))
    return solve(i-1)
  }
  return true
}

function reset() {
  $("td.tile").each((i, t) => update(t, ""))
}

function generate(n = 60) {
  update(rand($("td.tile")), rand(nums))
  if (!solve()) {
    reset(); generate(n)
  } else for(i = 0; i < n; i++) {
    update(rand($("td.tile")), "")
  }
}

// TODO Improve input system
var hovered;
$("td.tile").hover(e => hovered = e.target, e => hovered = undefined)
$(document).keyup(e => {
  if (hovered && nums.includes(e.key))
    update(hovered, e.key)
  else if (hovered && e.which == 46)
    update(hovered, "")
})
$("#solve").click(() => solve())
$("#generate").click(() => generate())