const express = require("express")
const app = express()
  .set("view engine", "ejs")
  .use(express.static('public'))
const port = process.env.PORT || 3000

const nav_pages = [{name: "Home", link: "/"}]

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
      title: "Txty",
      desc: "A no-frills Quill-based in-browser text editor with hotkeys for everything! I find it suprisingly useful to dump information and gather my thoughts",
      page_link: "https://swag31415.github.io/Txty/",
      github_link: "https://github.com/swag31415/Txty",
      image_link: "/media/txty.png"
    }]
  })
})

app.get("/coderart", (req, res) => {
  res.render("projects/coderart/coderart", {
    nav_pages: nav_pages
  })
})

app.get("/jugs", (req, res) => {
  res.render("projects/jugs/jugs", {
    nav_pages: nav_pages
  })
})

app.listen(port, () => {
  console.log(`swag_site is up and running at http://localhost:${port}`)
})
