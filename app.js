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
      title: "Example",
      desc: "this is an example card",
      page_link: "https://google.com",
      github_link: "https://github.com",
      image_link: "https://homepages.cae.wisc.edu/~ece533/images/airplane.png"
    }]
  })
})

app.get("/coderart", (req, res) => {
  res.render("projects/coderart", {
    nav_pages: nav_pages
  })
})

app.listen(port, () => {
  console.log(`swag_site is up and running at http://localhost:${port}`)
})
