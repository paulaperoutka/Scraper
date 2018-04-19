const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const db = require("./models");
let Note = db.Note;

const request = require("request");
const cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

const mongodb_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.Promise = Promise;
mongoose.connect(mongodb_URI);

const app = express();

app.use(logger("dev"));
//change to false once DB populated
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// GET index handlebars
app.get("/", (req, res) => {
  db.Article.find({"saved": false}, (error, data) => {
    res.render("index", {articles: data});
  });
});

// GET saved handlebars
app.get("/saved", function(req, res) {
  db.Article.find({"saved": true})
  .populate("notes")
  .exec((error, data) => {
    res.render("saved", {articles: data});
  });
});

// GET request to scrape Lonely Planet
app.get("/scrape", (req, res) => {
  request("https://www.lonelyplanet.com/search?q=destinations", (error, response, html) => {
    const $ = cheerio.load(html);

    $("article").each(function(i, element) {
      var result = {};
      result.title = $(this).children(".styles__textContainer___JSbiH").children("a").children("h3").text();
      result.summary = $(this).children(".styles__textContainer___JSbiH").children("a").children("p").text();
      result.link = $(this).children(".styles__textContainer___JSbiH").children("a").attr("href");
      let fullImage = $(this).children(".styles__thumbnail___2buk9").children("a").children("img").attr("src");
        if (fullImage) {
          result.image = fullImage.replace(/\?.*/,'');
        }
        else {
          result.image = "https://posvudusha.files.wordpress.com/2012/07/lonely-planet-covers.jpg?w=494&h=232&crop=1";
        }
          // console.log(result);
      db.Article.create(result)
      .then(function(dbArticle) {
        console.log(dbArticle);
      })
      .catch(function(err) {
          return res.json(err);
      });
    });
    console.log("Scrape complete.");
    res.redirect("/");
  });
});

// Get all articles scraped
app.get("/articles", (req, res) => {
  db.Article.find({})
  .then((dbArticle) => {
    res.json(dbArticle);
  })
  .catch((error) => {
    res.json(error);
  });
});


// GET article by id
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ "_id": req.params.id })
  .populate("notes")
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(error) {
    res.json(error);
  });
});

// SAVE article
app.post("/articles/save/:id", (req, res) => {
  db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
  .exec((err, doc) => {
    if (err) {
      console.log(err);
    }
    else {
      res.send(doc);
    }
  });
});

// DELETE saved article, don't remove notes?
app.post("/articles/delete/:id", (req, res) => {
  db.Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false
    // , "notes": []
  })
  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.send(doc);
    }
  });
});


// CREATE note
app.post("/notes/save/:id", (req, res) => {
  var newNote = new Note({
    article: req.params.id,
    body: req.body.text
  });
  console.log(req.body);
  newNote.save((error, note) => {
    if (error) {
      console.log(error);
    }
    else {
      db.Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "notes": note } })
      .exec((error) => {
        if (error) {
          console.log(error);
          res.send(error);
        }
        else {
          res.send(note);
        }
      });
    }
  });
});

// DELETE note
app.delete("/notes/delete/:note_id/:article_id", (req, res) => {
  db.Note.findOneAndRemove({ "_id": req.params.note_id }, (err) => {
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      db.Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"notes": req.params.note_id}})
      .exec((err) => {
        if (err) {
          console.log(err);
          res.send(err);
        }
        else {
          res.send("Note deleted.");
        }
      });
    }
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
