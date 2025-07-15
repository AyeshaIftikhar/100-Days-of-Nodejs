const RSSParser = require("./parser");
const parser = new RSSParser();

async function displayLatestTechNews() {
  const items = await parser.parseFeed("https://techblog.com/feed", {
    limit: 3,
    category: "javascript",
    sort: "newest",
  });

  console.log("Latest JavaScript Articles:");
  items.forEach((item) => {
    console.log(`\n${item.title}`);
    console.log(`Published: ${item.pubDate.toLocaleDateString()}`);
    console.log(`Link: ${item.link}`);
  });
}

displayLatestTechNews();
