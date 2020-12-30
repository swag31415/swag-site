var n_jugs = 0
var max_jug_size = 20

$("#add_jug").click(() => {
  n_jugs++ // Increase the number of jugs
  $(`<div id="jug_${n_jugs}_input" class="row">
    <div class="input-field col s2">
      <input id="jug_${n_jugs}_size" class="jug_size validate" type="number" min="1" required>
      <label for="jug_${n_jugs}_size">Jug ${n_jugs} Size</label>
      <span class="helper-text" data-error="Please enter a positive integer"></span>
    </div>
    <p class="input-field range-field col s10">
      <input type="range" id="jug_${n_jugs}" class="jug" min="1" max="${max_jug_size}" value="1">
    </p>
  </div>`).appendTo("#jugs") // Actually add it

  let id_text = "#jug_" + n_jugs // This is how we name them
  let jug = $(id_text) // A JQuery object for the jug we just made
  let jug_size = $(id_text + "_size") // A Jquery object for the jug size selector we just made
  jug_size.change(() => { // When jug size changes also update the jug 
    let new_val = jug_size.val()
    if (new_val > max_jug_size) {         // If the new jug holds more than the current maxiumum jug size
      max_jug_size = new_val              // Increase the maximum jug size
      $(".jug").attr("max", max_jug_size) // and update all the jugs
    }
    jug.val(new_val)
  })
  jug.change(() => {             // When the jug changes also update the jug size input
    jug_size.val(jug.val())
      .next().addClass("active") // and make it active if it wasn't already
  })                             // (the selector we use requires the label to be right after the input)
}).click() // Add one jug after we load the page

$("#remove_jug").click(() => {           // When you click the remove jug button
  if (n_jugs > 1)                        // If we have at least two jugs
    $(`#jug_${n_jugs--}_input`).remove() // remove one and decrease the number of jugs
})

// Verifies all the inputs and does appropriate css
// It returns true if they are all valid, false otherwise
function verify_inputs() {
  return $(".jug_size,#target").filter((i, v) => !v.value).addClass("invalid").length == 0
}

// Calculates the greatest common divisor (gcd) of numbers a and b recursively
function gcd(a, b) {
  return !b ? a : gcd(b, a % b)
}

// Returns if it is possible to solve a jug problem with given jugs and target
function is_possible(target, jug_sizes) {
  let jugs_gcd = jug_sizes.reduce(gcd) // Get the gcd of the whole array
  return target % jugs_gcd == 0 // If it divides the target we can solve it!
}

// Returns the shortest solution to a jug problem with given jugs and target
function jug_alg(target, jug_sizes) {
  jug_sizes = [...new Set(jug_sizes)] // Remove Duplicates
  jug_sizes = jug_sizes.flatMap(j => [j, -j]) // Add negatives
  var paths = [[0]], sums = [0] // Initialize sum and path lists
  while (paths.length) { // While there are still paths
    let path = paths.shift() // Grab the one at the beginning of the queue
    for (const j of jug_sizes) { // And for every jug size (positive and negative)
      let sum = path[path.length - 1] + j // Calculate the sum if that jug was added
      if (sum > 0 && !sums.includes(sum)) { // and if its positive and we haven't already calculated it
        if (sum == target) return [...path, sum]         // Return the path if its the target
          .map((v, i, a) => a[i + 1] - v).filter(v => v) // (we convert it to jug amounts first)
        paths.push([...path, sum]) // else push it onto the queue
        sums.push(sum) // and add the sum to the queue of calculated sums
      }
    }
  }
}

// Turns the given number into a word if its small enough and returns a "randomly" colored paragraph tag for it
function to_word(num) {
  const nums = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]
  const colors = ["red", "pink", "purple", "indigo", "blue", "cyan", "teal", "green", "lime", "yellow", "amber", "orange"]
  return `<span class="${colors[num % colors.length]}-text"><strong>${num in nums ? nums[num] : num}</strong></span>`
}

$("#run_jugs").click(() => {
  if (verify_inputs()) { // Verify the inputs are true
    let jug_sizes = $(".jug_size").map((i, v) => parseInt(v.value)).toArray() // Get all the jug sizes as an array
    let target = $("#target").val() // Get the target
    var steps = "<p>Unfortunately, this jug problem is <span class='red-text'><strong>impossible</strong></span></p>" // Message if its impossible
    if (is_possible(target, jug_sizes)) { // Check if the jug problem is possible
      let results = jug_alg(target, jug_sizes)                  // Solve the jug problem
        .reduce((a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {}) // And group the steps by type (do this *x* times, do this *y* times, etc..)
      steps = Object.entries(results).map((e, i, a) => { // Turn the results into an array of paragraph tags
        let [v, n] = e
        let av = Math.abs(v)
        return `<p>${i + 1}. ${v > 0 ? "Add" : "Remove"} ${to_word(av)} cup${av > 1 ? "s" : ""} using Jug ${to_word(jug_sizes.indexOf(av) + 1)} ${n > 1 ? `${to_word(n)} times for a total of ${to_word(n * av)} cups` : ""}</p>`
      })
    }
    $("#results").html(steps) // Add the steps to the modal
    $("#results_modal").modal("open") // Show the modal
  }
})

// Sets up the Materialize modal for showing results
$(document).ready(() => $("#results_modal").modal())