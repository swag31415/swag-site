async function get_data(symbol) {
  resp = await fetch(`/stonkey/api?sym=${symbol}`)
  data = await resp.text()
  if (data.length < 300) throw data // If it's really short something's up
  return data
    .split('\n')
    .slice(1,-1)
    .map(row => parseFloat(row.split(',')[1]))
    .reverse()
}

const can = document.getElementById("bana")
const ctx = can.getContext("2d")
function plot(arr) {
  [min, max] = [Math.min(...arr), Math.max(...arr)]
  arr = arr.map(v => can.height - ((v - min) * (can.height / (max - min))))
  ctx.clearRect(0, 0, can.width, can.height)
  ctx.beginPath()
  ctx.moveTo(0, arr.splice(0, 1))
  arr.forEach((v, i) => {
    x = (i + 1) * (can.width / arr.length)
    ctx.lineTo(x, v)
  })
  ctx.stroke()
}

$("#play").click(() => {
  get_data($("#sym").val())
  .then(plot).catch(err => {
    console.log(err)
    alert("there was an error")
  })
})