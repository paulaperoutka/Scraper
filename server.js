const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const db = require("./models");

const request = require("request");
const cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

const app = express();

app.use(logger("dev"));
//change to false once DB populated
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Load main handlebars
app.get("/", (req, res) => {
  db.Article.find({"saved": false}, (error, data) => {
    res.render("index", {articles: data});
  });
});






app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
