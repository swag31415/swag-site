let advice = []
let curr_question = ""

$("#loader").hide()

function get_query() {
  age = $("#age").val()
  return (age ? `I am ${age} years old. ` : "") + $("#question").val()
}

$("#question,#age").change(() => {
  let query = get_query()
  if (curr_question != query) {
    $("#ask").text("ASK!").removeClass("purple").addClass("green")
    curr_question = query
  }
})

$("#ask").click(e => {
  if (e.target.innerText == "ASK!") {
    $("#advice").hide()
    $("#loader").show()
    fetch("/helpful", {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: curr_question})
    }).then(data => data.json().then(jdata => {
      advice = jdata
      $("#loader").hide()
      $("#advice").text(advice.shift()).show()
      $(e.target).text("Ask Again!").removeClass("green").addClass("purple")
    })).catch(console.log)
  } else {
    if (advice.length > 0) {
      $("#advice").text(advice.shift())
      fetch("/helpful/update", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question: curr_question})
      }).catch(console.log)
    }
  }
})