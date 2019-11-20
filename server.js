let express = require("express")
let request = require("request")

let app = express()
let port = 8000

app.get("/bounce", function serveBounceFile(req, res, next) {
    request(req.query.q).pipe(res)
})

app.use("/css", express.static("css"))
app.use("/js", express.static("js"))
//app.use("/assets", express.static("assets"))


function serveIndex(req, res, next){
    res.sendFile("index.html", {root: "."})
}


app.get("/", serveIndex)
app.get("/index.html", serveIndex)


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
})

app.listen(port, function () {
    console.log("Listening on port:" + port)
})

