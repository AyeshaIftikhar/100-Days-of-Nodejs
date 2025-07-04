const express = require("express");
const RSSParser = require("./parser");
const app = express();
const parser = new RSSParser();

app.get("/api/feed", async (req, res) => {
  try {
    const { url, limit, since, until, category, search, sort } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    const items = await parser.parseFeed(url, {
      limit: limit ? parseInt(limit) : undefined,
      since,
      until,
      category,
      search,
      sort,
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RSS Parser API running on port ${PORT}`);
  console.log("❌ Press Ctrl+C to stop the server");
});
