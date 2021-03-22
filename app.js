const express = require("express")
var bodyParser = require('body-parser')
const app = express()
  .set("view engine", "ejs")
  .use(express.static('public'))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
const port = process.env.PORT || 3000

const nav_pages = [{name: "Home", link: "/"}]
const basic_projects = ["coderart", "jugs", "the_game", "hangman", "chess_move", "sorter", "helpful"]

app.get("/", (req, res) => {
  res.render("index", {
    nav_pages: nav_pages,
    cards: [{
      title: "Coder Art",
      desc: "Ever wanted to code a picture real quick in javascript? Now you can!",
      page_link: "coderart",
      image_link: "/media/coderart.png"
    }, {
      title: "Helpful",
      desc: "Data-Science Teams project with Zaki and Brandon. Get personalized Ai-Generated life advice",
      page_link: "helpful",
      image_link: "/media/helpful.png"
    }, {
      title: "Hangman",
      desc: "My first project when I learned nim, now rewritten in javascript!",
      page_link: "hangman",
      image_link: "/media/hangman.png"
    }, {
      title: "Jugs",
      desc: "A Javascript port of a short program I made to solve Jug Problems",
      page_link: "jugs",
      image_link: "/media/jug.png"
    }, {
      title: "Sorter",
      desc: "Use the Ford-Johnson aglorithm and YOUU to sort basically anything!",
      page_link: "sorter",
      image_link: "/media/sorter.png"
    }, {
      title: "Chess Move",
      desc: "2000 games of chess visualized by the most common moves on every half turn",
      page_link: "chess_move",
      image_link: "/media/chess_move.png"
    }, {
      title: "Normal",
      desc: "A thing I made while learning about normal numbers. It uses a genetic algorithm to generate arbitrarily large numbers with as many numbers below a limit as possible in its digits",
      page_link: "https://colab.research.google.com/drive/1VZw58jOARVv5itOrgM3bF7mPh1Q3dJjt?usp=sharing",
      image_link: "/media/normal.png"
    }, {
      title: "The Game",
      desc: "A simulation of how The Game spreads",
      page_link: "the_game",
      image_link: "/media/the_game.png"
    }, {
      title: "Txty",
      desc: "A no-frills Quill-based in-browser text editor with hotkeys for everything! I find it suprisingly useful to dump information and gather my thoughts",
      page_link: "https://swag31415.github.io/Txty/",
      image_link: "/media/txty.png"
    }]
  })
})

const helpful_api = require("./src/helpful_api.js")
app.post("/helpful", (req, res) => {
  helpful_api.log(req.body.question)
  helpful_api.get_advice(req.body.question).then(advice => {
    // Sort the advice and return the top 50
    sorted = Object.keys(advice).sort((a, b) => advice[b]-advice[a])
    res.json(sorted.slice(0, 50))
  })
})

app.post("/helpful/update", (req, res) => {
  helpful_api.update(req.body.question)
  res.send("Success")
})

basic_projects.forEach((page) => app.get("/"+page, (req, res) => {
  res.render("projects/"+page, {nav_pages: nav_pages})
}))

app.listen(port, () => {
  console.log(`swag_site is up and running at http://localhost:${port}`)
})