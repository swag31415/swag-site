const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const grps = ["r", "c", "b"]
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
let data = {}, tiles = {}

$("td.tile").each((i, t) => {
  data[t.id] = [[],[...nums]]
  grps.forEach((g, i) => {
    grp = g + t.id[i]
    if (grp in tiles) tiles[grp].push(t)
    else tiles[grp] = [t]
  })
})

let move_stack = []
function update(tile, val) {
  let old = tile.innerText
  if (val == old) return;
  move_stack.push([tile, old]);
  grps.forEach((g, i) => tiles[g + tile.id[i]].forEach(t => {
    blklst = data[t.id][0]
    if (old != "") blklst.splice(blklst.indexOf(old), 1)
    if (val != "") blklst.push(val)
    data[t.id][1] = nums.filter(n => !blklst.includes(n))
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
      posi = data[t.id][1]
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
  for (h = 0; h < 20; h++) {
    revert(init)
    for (let i = 0; i < 65; i++) {
      t = rand([...$("td.tile:not(.grey,.green)")].filter(t => data[t.id][1].length != 0))
      update(t, rand(data[t.id][1]))
      do_implicit()
      if ($("td.tile:empty").length == 0) return true;
    }
  }
  return false
}

function reset() {
  $("td.tile").removeClass("grey green lighten-2").each((i, t) => update(t, ""))
  move_stack = []
}

function generate(n = 70) {
  reset(); solve()
  let pool = [...$("td.tile")]
  for(i = 0; i < n; i++) {
    update(rand(pool), "")
  }
  $("td.tile:not(:empty)").addClass("grey lighten-2")
}

// TODO Improve input system
var hovered;
$("td.tile").hover(e => hovered = e.target, e => hovered = undefined)
$(document).keyup(e => {
  if (hovered && data[hovered.id][1].includes(e.key)) {
    update(hovered, e.key)
    $(hovered).addClass("green lighten-2")
  } else if (hovered && e.which == 46) {
    update(hovered, "")
    $(hovered).removeClass("green grey lighten-2")
  }
})
$("#solve").click(() => {if (!solve()) alert("thats impossible")})
$("#generate").click(() => generate())
$("#clear").click(reset)