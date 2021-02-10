const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
let data = {}

$("td.tile").each((i, t) => data[t.id] = [])

let move_stack = []
function update(tile, val) {
  let old = tile.innerText
  if (val == old) return;
  move_stack.push([tile, old])
  tile.className.match(/[rcb]\d/g).forEach(g => $("td.tile." + g).each((i, t) => {
    blklst = data[t.id]
    if (old != "") blklst.splice(blklst.indexOf(old), 1)
    if (val != "") blklst.push(val)
  }))
  tile.innerText = val
}
function revert(size) {
  while (move_stack.length > size) {
    update(...move_stack.pop())
    move_stack.pop()
  }
}

function do_implicit() {
  let imp = true
  while (imp) {
    imp = false
    $("td.tile:empty").each((i, t) => {
      posi = nums.filter(n => !data[t.id].includes(n))
      if (posi.length == 1) {
        update(t, posi[0])
        imp = true
      }
    })
  }
}

function solve() {
  do_implicit()
  let init = move_stack.length
  while ($("td.tile:empty").length > 0) {
    revert(init)
    for (let i = 0; (i < 65) && ($("td.tile:empty").length > 0); i++) {
      mat = [...$("td.tile:not(.grey)")]
        .map(t => [t, nums.filter(n => !data[t.id].includes(n))])
        .filter(v => v[1].length != 0)
      let [t, posi] = rand(mat)
      update(t, rand(posi))
      do_implicit()
    }
  }
}

function reset() {
  $("td.tile").removeClass("grey lighten-2").each((i, t) => update(t, ""))
  move_stack = []
}

function generate(n = 70) {
  reset()
  update(rand($("td.tile")), rand(nums))
  solve()
  for(i = 0; i < n; i++) {
    update(rand($("td.tile")), "")
  }
  $("td.tile:not(:empty)").addClass("grey lighten-2")
}

// TODO Improve input system
var hovered;
$("td.tile").hover(e => hovered = e.target, e => hovered = undefined)
$(document).keyup(e => {
  if (hovered && nums.includes(e.key) && !data[hovered.id].includes(e.key)) {
    update(hovered, e.key)
    $(hovered).addClass("grey lighten-2")
  } else if (hovered && e.which == 46) {
    update(hovered, "")
    $(hovered).removeClass("grey lighten-2")
  }
})
$("#solve").click(() => solve())
$("#generate").click(() => generate())
$("#clear").click(reset)