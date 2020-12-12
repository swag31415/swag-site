const express = require("express")
const app = express()
  .set("view engine", "ejs")
const port = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.render("index", {
    nav_pages: [{name: "Example", link: "https://google.com"}]
  })
})

app.listen(port, () => {
  console.log(`swag_site is up and running at http://localhost:${port}`)
})
