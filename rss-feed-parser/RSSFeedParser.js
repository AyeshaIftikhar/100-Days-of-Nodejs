const RSSParser = require("./rss-parser");
const parser = new RSSParser();

// Parse single feed
parser
  .parseFeed("https://techblog.com/feed", { limit: 3 })
  .then((items) => console.log(items))
  .catch(console.error);

// Parse multiple feeds
parser
  .parseMultipleFeeds(
    ["https://techblog.com/feed", "https://news.example.com/rss"],
    { category: "javascript" }
  )
  .then((items) => console.log(items));
