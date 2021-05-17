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

async function is_choose_up() {
  $("#up,#down").show()
  icu = await new Promise(res => {
    $("#up").on("click.icu", () => res(true))
    $("#down").on("click.icu", () => res(false))
  })
  $("#up,#down").off("click.icu").hide()
  return icu
}

const line = document.getElementById("line")
const [width, height] = [300, 100]

async function play(arr, hint, step) {
  // Normalize values
  [min, max] = [Math.min(...arr), Math.max(...arr)]
  arr = arr.map(v => height - ((v - min) * (height / (max - min))))
  // Clear
  points = ""
  line.setAttribute("points", points)
  // Render and play
  hinted = false
  for (let i = 0; i < arr.length; i++) {
    x = (i + 1) * (width / arr.length)
    // Add the point
    points += `${x} ${arr[i]} `
    line.setAttribute("points", points)
    // Check for hint stage
    if (!hinted && (i / arr.length) > (hint / 100)) {
      pval = arr[i]
      was_up = await is_choose_up()
      hinted = true
    }
    // Animation
    await new Promise(r => setTimeout(r, step))
  }
  // We use less than becuase y-axis grows down for images
  return was_up == (arr[arr.length-1] < pval)
}

$("#play").click(async () => {
  // Display loader
  $("#dloader").show()
  $("#inputs").hide()
  // Get the data
  try {
    dict = await get_data($("#sym").val())
  } catch (err) {
    console.error(err)
    alert("there was an error")
    return;
  }
  // Get values
  queue = Object.values(dict)
  // Shuffle
  for (let i = queue.length - 1; i > 0; i--) {
    j = Math.ceil(i*Math.random());
    [queue[i], queue[j]] = [queue[j], queue[i]]
  }
  // Confgure values
  const hint = $("#hint").val()
  $("#up,#down").css("width", 100 - hint + '%')
  // Show game
  $("#game").show()
  $("#dloader").hide()
  // Play
  score = 0
  for (const arr of queue) {
    score += await play(arr, hint, 50)
  }
  console.log(`final score is ${score}`)
})