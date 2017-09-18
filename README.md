# mongodb-scraper
A web app that lets users view and leave comments on the latest news. No articles are written; instead, I used Mongoose and Cheerio to scrape news from another site.

Whenever a user visits the site, the app scrapes stories from a news outlet and displays them for the user. Each scraped article is saved to the MongoDB database. The user can mark favorite articles as saved and display in a saved articles list, and can also delete the article from this list.

Users can leave comments on the articles displayed and revisit them later. The comments are saved to the database as well and associated with their articles. Users are able to delete comments left on the articles. All stored comments are visible to every user.
