fetch("/stonkey/api?" + new URLSearchParams({sym: "IBM"}))
.then(resp => resp.text())
.then(data => {
  if (data.length < 300) throw data // If it's really short something's up
  return data.split('\n').slice(1,-1).map(row => parseFloat(row.split(',')[1])).reverse()
})
.then(arr => {
  can = document.getElementById("bana");
  // Normalize
  [min, max] = [Math.min(...arr), Math.max(...arr)]
  arr = arr.map(v => can.height - ((v - min) * (can.height / (max - min))))

  ctx = document.getElementById("bana").getContext("2d")
  ctx.beginPath();
  ctx.moveTo(0,arr.splice(0,1))
  arr.forEach((v, i) => {
    x = (i + 1) * (can.width / arr.length)
    ctx.lineTo(x,v)
  })
  ctx.stroke()
})
.catch(err => {
  console.log(err)
  alert("there was an error")
})