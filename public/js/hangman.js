var word, guesses = [], stage = 0

// Renders the word and replaces non-guessed letters with underscores
function render_word(showall=false) {
  $("#guess").html(word.replace(/[A-Za-z]/g, m => (guesses.includes(m) || showall ? m : "_") + "&nbsp"))
}

function start_game() {
  $("#start_dialog").hide() // Hide the start dialog
  $("#game").show() // Show game elements
  $("#stages pre:not(:first-child)").hide() // Hide all stages except the first
  render_word() // and render the word
}

$(".letter").click(function () {
  $(this).prop("disabled", true) // Disable this letter
  guess = $(this).text() // get the actual letter
  guess = [guess.toUpperCase(), guess.toLowerCase()] // Both upper and lowercase
  if (guess.some(l => word.includes(l))) { // If it is in the word
    guesses.push(...guess) // add it to the guesses
    render_word()          // and render it
  } else { // Otherwise show the next stage
    $("#stages pre").hide().eq(++stage).show()
  }

  // Get how many letters are left by counting the underscores
  remaining = ($("#guess").html().match(/_/g) || []).length
  if (remaining == 0) { // Win condition
    alert("You win!!") // some celebration
    $(".letter").prop("disabled", true) // disable all the letters
  }
  
  // If we run out of stages disable all the letters
  if (stage >= $("#stages pre").length - 1) {
    $(".letter").prop("disabled", true)
    render_word(true)
  }
})

$("#start").click(e => {
  if (!$("#word").hasClass("valid")) return; // Check if the word is valid
  word = $("#word").val().trim() // the word is what they entered without leading or trailing whitespace
  start_game()
})

$("#rand_start").click(e => {
  word = e.target.value // Every page gets a new random word and its stored in the value!
  start_game()
})