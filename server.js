"use strict"

const express = require("express")
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express()
const port = process.env.PORT || 8000

// Proxy the "/bounce" endpoint, to fetch transcripts from
// cross-origin sources.
app.use("/bounce", createProxyMiddleware(
    {
        router (req) {
            console.log(`Bouncing ${req.query.q}...`)
            const u = new URL(req.query.q)
            const result = `${u.protocol}//${u.hostname}`
            console.log(`to ${result}...`)
            return result
        },
        pathRewrite(path, req) {
            const result = new URL(req.query.q).pathname
            console.log(`Path is "${path}. Changing to ${result}...`)
            return result
        },
        changeOrigin: true
    }
))

// Static assets
app.use("/css", express.static("css"))
app.use("/js", express.static("js"))
app.use("/assets", express.static("assets"))

// The one and only home page
function serveIndex (req, res, next) {
    res.sendFile("index.html", { root: "." })
}


app.get("/", serveIndex)
app.get("/index.html", serveIndex)

// Allow cross-origin requests
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    next()
})

app.listen(port, function () {
    console.log("Listening on port:" + port)
})
