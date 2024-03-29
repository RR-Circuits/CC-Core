const express = require("express")
const app = express()

const port = 3000

app.use(express.static(__dirname + "/public"))

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html")
})

app.listen(port, function() {
    console.log(`Server running at port ${port}.`)
})