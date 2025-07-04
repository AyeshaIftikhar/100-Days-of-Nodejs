const RSSParser = require("./rss-parser");
const parser = new RSSParser();
const feedsToMonitor = require("./monitored-feeds.json");

async function monitorFeeds() {
  console.log("Starting feed monitoring...");

  while (true) {
    try {
      const items = await parser.parseMultipleFeeds(feedsToMonitor, {
        since: new Date(Date.now() - 3600000), // Last hour
      });

      if (items.length > 0) {
        console.log(`\nNew items found: ${items.length}`);
        items.forEach((item) => {
          console.log(`\n${item.title}`);
          console.log(`From: ${item.source}`);
          console.log(`Published: ${item.pubDate.toLocaleTimeString()}`);
        });
      } else {
        console.log("No new items found.");
      }
    } catch (error) {
      console.error("Monitoring error:", error.message);
    }

    // Wait 15 minutes before checking again
    await new Promise((resolve) => setTimeout(resolve, 900000));
  }
}

monitorFeeds();
