let advice = []
let query = undefined

$("#advice").click(e => {
  if (advice.length > 0)
    e.target.innerText = advice.shift()
  if (question)
    fetch("/helpful/update", {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: query})
    })
})

$("#loader").hide()

$("#ask").click(() => {
  $("#advice").hide()
  $("#loader").show()
  age = $("#age").val()
  query = (age ? `I am ${age} years old. ` : "") + $("#question").val()
  fetch("/helpful", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({question: query})
  }).then(data => data.json().then(jdata => {
    advice = jdata
    $("#loader").hide()
    $("#advice").text(advice.shift()).show()
  }))
  .catch(console.log)
})