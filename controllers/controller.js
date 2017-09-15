// Node Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request'); // for web-scraping
var cheerio = require('cheerio'); // for web-scraping

// Import the Comment and Article models
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

// Index Page Render (first visit to the site)
router.get('/', function(req, res) {

  // Scrape data
  res.redirect('/scrape');

});


// Articles Page Render
router.get('/articles', function(req, res) {

  // Search MongoDB for all article entries (sort newest to top, assuming Ids increment)
  Article.find().sort({
      _id: -1
    })

    // But also populate all of the comments associated with the articles.
    .populate('comments')

    // Then, send them to the handlebars template to be rendered
    .exec(function(err, doc) {
      // log any errors
      if (err) {
        console.log(err);
      }
      // or send the doc to the browser as a json object
      else {
        var hbsObject = {
          articles: doc
        }
        res.render('index', hbsObject);
        // res.json(hbsObject)
      }
    });
});


router.get('/saved', function(req, res) {

  // Search MongoDB for all distinct saved article entries (sort newest to top, assuming Ids increment)
  Article.find({"saved": "true"}).sort({_id: -1})

    // But also populate all of the comments associated with the articles.
    .populate('comments')

    // Then, send them to the handlebars template to be rendered
    .exec(function(err, doc) {
      // log any errors
      if (err) {
        console.log(err);
      }
      // or send the doc to the browser as a json object
      else {
        var hbsObject = {
          articles: doc
        }
        res.render('saved', hbsObject);
        // res.json(hbsObject)
      }
    });
});


// Web Scrape Route
router.get('/scrape', function(req, res) {

  // First, grab the body of the html with request
  request('http://www.dailynews.com/', function(error, response, html) {

    // Then, load html into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // This is an error handler for the newspaper website only
    var titlesArray = [];

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.image-wrapper").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object

      result.image = $(this).children("img").attr("data-src");
      result.title = $(this).parent().attr("title");
      result.link = $(this).parent().attr("href");
      console.log(result);

      // Error handling to ensure there are no empty scrapes
      if (result.image !== "" && result.title !== "" && result.link !== "") {

        // Check within each scrape since the Los Angeles Daily News may have duplicate articles...
        // Due to async, moongoose will not save the articles fast enough for the duplicates within a scrape to be caught
        if (titlesArray.indexOf(result.title) == -1) {

          // Push the saved item to our titlesArray to prevent duplicates
          titlesArray.push(result.title);

          // Only add the entry to the database if is not already there
          Article.count({
            title: result.title
          }, function(err, test) {

            // If the count is 0, then the entry is unique and should be saved
            if (test == 0) {

              // Using the Article model, create a new entry (note that the "result" object has the exact same key-value pairs of the model)
              var entry = new Article(result);

              // Save the entry to MongoDB
              entry.save(function(err, doc) {
                // log any errors
                if (err) {
                  console.log(err);
                }
                // or log the doc that was saved to the DB
                else {
                  console.log(doc);
                }
              });

            }
            // Log that scrape is working, just the content was already in the Database
            else {
              console.log('Redundant Database Content. Not saved to DB.')
            }

          });
        }
        // Log that scrape is working, just the content was missing parts
        else {
          console.log('Redundant News Content. Not Saved to DB.')
        }

      }
      // Log that scrape is working, just the content was missing parts
      else {
        console.log('Empty Content. Not Saved to DB.')
      }

    });

    // Redirect to the Articles Page, done at the end of the request for proper scoping
    res.redirect("/articles");

  });

});



// Add a Comment Route - **API**
router.post('/add/comment/:id', function(req, res) {

  // Collect article id
  var articleId = req.params.id;

  // Collect Author Name
  var commentAuthor = req.body.name;

  // Collect Comment Content
  var commentContent = req.body.comment;

  // "result" object has the exact same key-value pairs of the "Comment" model
  var result = {
    author: commentAuthor,
    content: commentContent
  };

  // Using the Comment model, create a new comment entry
  var entry = new Comment(result);

  // Save the entry to the database
  entry.save(function(err, doc) {
    // log any errors
    if (err) {
      console.log(err);
    }
    // Or, relate the comment to the article
    else {
      // Push the new Comment to the list of comments in the article
      Article.findOneAndUpdate({
          '_id': articleId
        }, {
          $push: {
            'comments': doc._id
          }
        }, {
          new: true
        })
        // execute the above query
        .exec(function(err, doc) {
          // log any errors
          if (err) {
            console.log(err);
          } else {
            // Send Success Header
            res.sendStatus(200);
          }
        });
    }
  });

});


// Delete a Comment Route
router.post('/remove/comment/:id', function(req, res) {

  // Collect comment id
  var commentId = req.params.id;

  // Find and Delete the Comment using the Id
  Comment.findByIdAndRemove(commentId, function(err, todo) {

    if (err) {
      console.log(err);
    } else {
      // Send Success Header
      res.sendStatus(200);
    }

  });
});


// Save an Article Route
router.post('/save/article/:id', function(req, res) {

  // Collect Article id
  var articleId = req.params.id;
  Article.findOneAndUpdate({
      '_id': articleId
    }, {
      $set: {
        'saved': true
      }
    }, {
      new: true
    })
    // execute the above query
    .exec(function(err, doc) {
      // log any errors
      if (err) {
        console.log(err);
      } else {
        // Send Success Header
        //res.sendStatus(200);
        console.log("Saved article successfully");
        // Display all the scraped articles
        res.redirect("/articles");
      }
    });
});


// Delete a saved Article Route
router.post('/delete/savedArticle/:id', function(req, res) {

  // Collect Article id
  var articleId = req.params.id;
  console.log("Deleted saved article");
  Article.findOneAndUpdate({
      '_id': articleId
    }, {
      $set: {
        'saved': false
      }
    }, {
      new: true
    })
    // execute the above query
    .exec(function(err, doc) {
      // log any errors
      if (err) {
        console.log(err);
      } else {
        // Send Success Header
        //res.sendStatus(200);
        console.log("Saved article successfully");
        // Display all the saved articles
        res.redirect("/saved");
      }
    });
});


// Export Router to Server.js
module.exports = router;
