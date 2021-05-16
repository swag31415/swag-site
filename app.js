const express = require("express")
var bodyParser = require('body-parser')
const app = express()
  .set("view engine", "ejs")
  .use(express.static('public'))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
const port = process.env.PORT || 3000

const https = require("https")

const nav_pages = [{name: "Home", link: "/"}]
const basic_projects = [{
  title: "Coder Art",
  desc: "Ever wanted to code a picture real quick in javascript? Now you can!",
  page_link: "coderart"
}, {
  title: "Helpful",
  desc: "Data-Science Teams project with Zaki and Brandon. Get personalized Ai-Generated life advice",
  page_link: "helpful"
}, {
  title: "Hangman",
  desc: "My first project when I learned nim, now rewritten in javascript!",
  page_link: "hangman"
}, {
  title: "Jugs",
  desc: "A Javascript port of a short program I made to solve Jug Problems",
  page_link: "jugs"
}, {
  title: "Sorter",
  desc: "Use the Ford-Johnson aglorithm and YOUU to sort basically anything!",
  page_link: "sorter"
}, {
  title: "Chess Move",
  desc: "2000 games of chess visualized by the most common moves on every half turn",
  page_link: "chess_move"
}, {
  title: "The Game",
  desc: "A simulation of how The Game spreads",
  page_link: "the_game"
}, {
  title: "Stonkey",
  desc: "My attempt to gamify stock market predictions. A stock market \"trainer\"",
  page_link: "stonkey"
}]

basic_projects.forEach(v => v.image_link = `/media/${v.page_link}.png`)

app.get("/", (req, res) => {
  res.render("index", {
    nav_pages: nav_pages,
    title: "SwagSite",
    image_link: "/media/swagsite.png",
    cards: [...basic_projects, {
      title: "Normal",
      desc: "A thing I made while learning about normal numbers. It uses a genetic algorithm to generate arbitrarily large numbers with as many numbers below a limit as possible in its digits",
      page_link: "https://colab.research.google.com/drive/1VZw58jOARVv5itOrgM3bF7mPh1Q3dJjt?usp=sharing",
      image_link: "/media/normal.png"
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

const rand = (n) => Math.ceil(n*Math.random())
app.get("/stonkey/api", (req, res) => {
  https.get("https://www.alphavantage.co/query?" + new URLSearchParams({
    function: "TIME_SERIES_INTRADAY_EXTENDED",
    symbol: req.query.sym,
    interval: "15min",
    slice: `year${rand(2)}month${rand(12)}`,
    apikey: process.env.STONKEY_KEY || "demo"
  }), resp => resp.pipe(res))
})

basic_projects.forEach((page) => app.get("/"+page.page_link, (req, res) => {
  res.render("projects/"+page.page_link, {nav_pages: nav_pages, title: page.title, image_link: page.image_link})
}))

app.listen(port, () => {
  console.log(`swag_site is up and running at http://localhost:${port}`)
})