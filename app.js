const express = require("express")
const app = express()
  .set("view engine", "ejs")
  .use(express.static('public'))
const port = process.env.PORT || 3000

const nav_pages = [{name: "Home", link: "/"}]
const basic_pages = [{
  url: "/coderart",
  view: "projects/coderart/coderart"
}, {
  url: "/jugs",
  view: "projects/jugs"
}, {
  url: "/the_game",
  view: "projects/the_game"
}, {
  url: "/hangman",
  view: "projects/hangman"
}, {
  url: "/chess_move",
  view: "projects/chess_move"
}, {
  url: "/sorter",
  view: "projects/sorter"
}, {
  url: "/sudoku",
  view: "projects/sudoku"
}]

app.get("/", (req, res) => {
  res.render("index", {
    nav_pages: nav_pages,
    cards: [{
      title: "Coder Art",
      desc: "Ever wanted to code a picture real quick in javascript? Now you can!",
      page_link: "coderart",
      github_link: "https://github.com/swag31415/swag-site/blob/main/views/projects/coderart",
      image_link: "/media/coderart.png"
    }, {
      title: "Jugs",
      desc: "A Javascript port of a short program I made to solve Jug Problems",
      page_link: "jugs",
      github_link: "https://github.com/swag31415/Jugs",
      image_link: "/media/jug.png"
    }, {
      title: "Normal",
      desc: "A thing I made while learning about normal numbers. It uses a genetic algorithm to generate arbitrarily large numbers with as many numbers below a limit as possible in its digits",
      page_link: "https://colab.research.google.com/drive/1VZw58jOARVv5itOrgM3bF7mPh1Q3dJjt?usp=sharing",
      github_link: "https://github.com/swag31415/Normal",
      image_link: "/media/normal.png"
    }, {
      title: "The Game",
      desc: "A simulation of how The Game spreads",
      page_link: "the_game",
      github_link: "https://github.com/swag31415/The_Game",
      image_link: "/media/the_game.png"
    }, {
      title: "Hangman",
      desc: "My first project when I learned nim, now rewritten in javascript!",
      page_link: "hangman",
      github_link: "https://github.com/swag31415/Hangman-Nim-",
      image_link: "/media/hangman.png"
    }, {
      title: "Chess Move",
      desc: "2000 games of chess visualized by the most common moves on every half turn",
      page_link: "chess_move",
      github_link: "https://colab.research.google.com/drive/1nr2RKGPrB-eNi0rMsckgqjHyDOVqRV9g?usp=sharing", // TODO add different label, this ain't github
      image_link: "/media/chess_move.png"
    }, {
      title: "Sorter",
      desc: "Use the Ford-Johnson aglorithm and YOUU to sort basically anything!",
      page_link: "sorter",
      github_link: "", // TOOO add github
      image_link: "/media/sorter.png"
    }, {
      title: "Sudoku",
      desc: "Sudoku game and solver I made for extra credit in a class",
      page_link: "sudoku",
      github_link: "", // TOOO add github
      image_link: "/media/sudoku.png"
    }, {
      title: "Txty",
      desc: "A no-frills Quill-based in-browser text editor with hotkeys for everything! I find it suprisingly useful to dump information and gather my thoughts",
      page_link: "https://swag31415.github.io/Txty/",
      github_link: "https://github.com/swag31415/Txty",
      image_link: "/media/txty.png"
    }]
  })
})

basic_pages.forEach((page) => app.get(page.url, (req, res) => {
  res.render(page.view, {nav_pages: nav_pages})
}))

app.listen(port, () => {
  console.log(`swag_site is up and running at http://localhost:${port}`)
})
