const express = require("express")
const app = express()
  .set("view engine", "ejs")
  .use(express.static('public'))
const port = process.env.PORT || 3000

const nav_pages = [{name: "Coder Art", link: "coderart"}]

app.get("/", (req, res) => {
  res.render("index", {
    nav_pages: nav_pages,
    cards: [{
      title: "Coder Art",
      desc: "Ever wanted to code a picture real quick in javascript? Now you can!",
      page_link: "coderart",
      github_link: "https://github.com/swag31415/swag-site/blob/main/views/projects/coderart",
      image_link: "/media/coderart.png"
    }]
  })
})

app.get("/coderart", (req, res) => {
  res.render("projects/coderart/coderart", {
    nav_pages: nav_pages
  })
})

app.listen(port, () => {
  console.log(`swag_site is up and running at http://localhost:${port}`)
})
