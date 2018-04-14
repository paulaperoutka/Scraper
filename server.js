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

// GET main handlebars
app.get("/", (req, res) => {
  db.Article.find({"saved": false}, (error, data) => {
    res.render("index", {articles: data});
  });
});

// GET saved handlebars
app.get("/saved", function(req, res) {
  db.Article.find({"saved": true}).populate("notes").exec((error, data) => {
    res.render("saved", {articles: data});
  });
});

// GET request to scrape Lonely Planet
app.get("/scrape", function(req, res) {
  request("https://www.lonelyplanet.com/search?q=destinations", function(error, response, html) {
    const $ = cheerio.load(html);

    $("article").each(function(i, element) {
      var result = {};
      result.title = $(this).children(".styles__textContainer___JSbiH").children("a").children("h3").text();
      result.summary = $(this).children(".styles__textContainer___JSbiH").children("a").children("p").text();
      result.link = $(this).children(".styles__textContainer___JSbiH").children("a").attr("href");
      result.image = $(this).children(".styles__thumbnail___2buk9").children("a").children("img").attr("src");

      // console.log(result);
      var entry = new db.Article(result);
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("DB Entries!" + doc);
        }
      });
    });
        res.send("Scrape complete.");
  });
});





app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
