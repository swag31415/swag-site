// Hey jsyn I really don't like how I did form validation here and I'm
// 1000% sure there's a better way. I'm sorry and I'll come back to redo
// this if I have time.

// Initialize Materialize selectors
$(document).ready(() => {
  $('select').formSelect()
  $(".select-wrapper").focusout(function () { // Some custom validation for the selectors
    is_valid = Boolean($(this).find("select").val())
    $(this).find("input.dropdown-trigger")
      .addClass(is_valid ? "valid" : "invalid")
      .removeClass(is_valid ? "invalid" : "valid")
  })
})

// Sets up the Materialize modal for showing results
$(document).ready(() => $("#results_modal").modal())

$(".alg-select").change(function () { // Makes the inputs change according to the algorithm selected
  // This requires the following structure and order
  // - div.alg-select
  //   - select
  // - div
  //   - input
  //   - label
  v = $(this).find("select").val() // The selected algorithm
  inp = $(this).next().find("input") // The input
  if (v == "random")
    inp.prop("disabled", false).attr({ min: 0, max: "", step: 1 }).next().text("number")
  else if (v == "percent")
    inp.prop("disabled", false).attr({ min: 0, max: 1, step: "any" }).next().text("enter percent")
  else
    inp.removeClass("invalid valid").val("").prop("disabled", true).next().text("")
  setTimeout(() => inp.focus(), 0) // After everything is set up we focus the input
})

var data // Where the uploaded data gets stored}

$("#network_upload").change(function () { // When a file is uploaded
  let reader = new FileReader()
  reader.readAsText(this.files[0]) // Read the file
  reader.onerror = () => $("#upload_path").addClass("invalid").val("Upload Failed")
  reader.onload = () => data = reader.result // and store it
})

function parse_data(is_directed) {
  var network = {} // To hold the completed network
  const add_edge = (node, adj) => { // A handy method for adding edges
    if (!(node in network)) network[node] = [new Set(), 0] // Add the node if it doesn't exist
    if (!(adj in network)) network[adj] = [new Set(), 0] // Also add the adj because scores
    network[node][0].add(adj) // Add the edge
  }

  data.split("\n").forEach(line => { // For each line in the data
    let [key, val, ...rest] = line.split(" ") // extract the first two space-delimited things
    if (key && val) { // and if they both exist use them to define an edge
      add_edge(key, val)
      if (!is_directed) // If not directed we have to define the opposite edge as well
        add_edge(val, key)
    }
  })
  console.log(network)
  return network
}

// ===== Here begins the logic for the actual simulation stuff =====

function shuffled(array) { // Shuffles an array (also works for sets)
  var result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result
}

function objmap(obj, mapfn) { // A map function for objects because I miss python
  return Object.keys(obj).reduce(function (result, key) {
    result[key] = mapfn(obj[key])
    return result
  }, {})
}

const algorithms = { // The algorithms, all of them have to handle both sets and arrays
  first: (a) => [[...a][0]],
  random: (a, n) => shuffled(a).slice(0, n),
  percent: (a, p) => [...a].filter(v => Math.random() < p)
}

function run_game(seed_alg, seed_opt, spread_alg, spread_opt, network_is_directed, n_iterations) {
  let network = parse_data(network_is_directed) // Parse and get the network
  var logs = []
  seed_alg(Object.keys(network), seed_opt).forEach(key => network[key][1] = -1) // Seed the network
  for (let i = 0; i < n_iterations; i++) {
    Object.keys(network).forEach(k => network[k][1] += 1) // Increase everyone's score
    logs.push(objmap(network, (v => v[1]))) // Log an object with all the nodes and their scores
    Object.values(network).forEach(v => { // Spread the failures
      if (v[1] == 0) spread_alg(v[0], spread_opt).forEach(adj => network[adj][1] = -1)
    })
  }
  return logs // return an array of all the scores throughout the affair
}

$("#run_the_game").click((e) => {
  // Validate inputs
  if ($(":enabled").filter((i, v) => !v.value).addClass("invalid")
    .focusout() // Because our selector validation is tied to focusout
    .length) return undefined // if we had any invalids, we abort

  let results = run_game( // Get all the inputs and run the game
    algorithms[$("#seed_alg").val()], $("#seed_opt").val(),
    algorithms[$("#spread_alg").val()], $("#spread_opt").val(),
    $("#is_directed").prop("checked"), $("#n_entries").val()
  )

  let headers = Object.keys(results[0]) // The headers are all the same so we get them as an array
  $("#results_headers").html(headers.map(h => `<th>${h}</th>`)) // Html for the headers
  $("#results_entries").html(Object.values(results).map(v => { // Html for the entries
    return `<tr>${headers.reduce(((a, h) => a + `<td>${v[h]}</td>`), "")}</tr>`
  }))
  $("#results_modal").modal("open") // Show the results modal
})