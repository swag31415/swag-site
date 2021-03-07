let advice = []

$("#advice").click(e => {
  if (advice.length > 0)
    e.target.innerText = advice.shift()
})

$("#ask").click(() => {
  age = $("#age").val()
  query = (age ? `I am ${age} years old. ` : "") + $("#question").val()
  fetch("/helpful", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({question: query})
  }).then(data => data.json().then(jdata => {
    advice = jdata
    $("#advice").click()
  }))
  .catch(console.log)
})