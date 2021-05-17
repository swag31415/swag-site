async function get_data(symbol) {
  resp = await fetch(`/stonkey/api?sym=${symbol}`)
  data = await resp.text()
  if (data.length < 300) throw data // If it's really short something's up
  return data
  .split('\n')
  .slice(1,-1)
  .reverse()
  .reduce((dict, row) => {
    [date, val, ...rest] = row.split(',')
    date = date.substring(0, 10)
    val = parseFloat(val)
    if (date in dict) dict[date].push(val)
    else dict[date] = [val];
    return dict
  }, {})
}

const line = document.getElementById("line")
const [width, height] = [300, 100]

async function play(arr, step) {
  // Normalize values
  [min, max] = [Math.min(...arr), Math.max(...arr)]
  arr = arr.map(v => height - ((v - min) * (height / (max - min))))
  // Clear
  points = ""
  line.setAttribute("points", points)
  // Render
  for (let i = 0; i < arr.length; i++) {
    x = (i + 1) * (width / arr.length)
    // Add the point
    points += `${x} ${arr[i]} `
    line.setAttribute("points", points)
    // Animation
    await new Promise(r => setTimeout(r, step))
  }
}

$("#play").click(async () => {
  // Get the data
  try {
    queue = await get_data($("#sym").val())
  } catch (err) {
    console.error(err)
    alert("there was an error")
    return;
  }
  play(Object.values(queue)[0], 50)
})