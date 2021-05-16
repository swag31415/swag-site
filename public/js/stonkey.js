params = 
fetch("https://www.alphavantage.co/query?" + new URLSearchParams({
  function: "TIME_SERIES_INTRADAY_EXTENDED",
  symbol: "IBM",
  interval: "15min",
  slice: "year1month1",
  apikey: "demo"
})).then(resp => resp.text())
.then(data => data.split('\n').slice(1,-1).map(row => parseFloat(row.split(',')[1])).reverse())
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