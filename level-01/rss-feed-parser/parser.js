const axios = require("axios");
const FeedParser = require("feedparser");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

// Cache feed results for 15 minutes
const feedCache = new NodeCache({ stdTTL: 900 });

class RSSParser {
  constructor() {
    this.feedParser = new FeedParser();
  }

  async parseFeed(feedUrl, options = {}) {
    const cacheKey = `${feedUrl}-${JSON.stringify(options)}`;
    const cached = feedCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(feedUrl, {
        responseType: "stream",
        timeout: 5000,
        headers: {
          "User-Agent": "Node-RSS-Parser",
        },
      });

      const feedItems = await this._parseStream(response.data, options);
      feedCache.set(cacheKey, feedItems);
      return feedItems;
    } catch (error) {
      throw new Error(`Failed to parse feed: ${error.message}`);
    }
  }

  _parseStream(stream, options) {
    return new Promise((resolve, reject) => {
      const items = [];
      const feedparser = new FeedParser();

      stream.on("error", reject);
      feedparser.on("error", reject);

      feedparser.on("readable", function () {
        let item;
        while ((item = this.read())) {
          // Normalize different feed formats
          const normalized = this._normalizeItem(item);
          // Apply filters if provided
          if (this._passesFilters(normalized, options)) {
            items.push(normalized);
          }
        }
      });

      feedparser.on("end", () => {
        // Sort by date if requested
        if (options.sort === "newest") {
          items.sort((a, b) => b.pubDate - a.pubDate);
        } else if (options.sort === "oldest") {
          items.sort((a, b) => a.pubDate - b.pubDate);
        }

        // Apply limit if specified
        resolve(options.limit ? items.slice(0, options.limit) : items);
      });

      stream.pipe(feedparser);
    });
  }

  _normalizeItem(item) {
    // Extract plain text from HTML descriptions
    const description = item.description
      ? cheerio.load(item.description).text().trim()
      : "";

    // Handle both RSS and Atom formats
    return {
      title: item.title || "",
      description,
      link: item.link || "",
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      author: item.author || item.creator || "",
      categories: item.categories || [],
      guid: item.guid || item.link || "",
      media: {
        image: item.image ? item.image.url : null,
        content: item["media:content"] ? item["media:content"]["@"] : null,
      },
      raw: item, // Keep original for reference
    };
  }

  _passesFilters(item, options) {
    if (!options) return true;

    // Date filter
    if (options.since && item.pubDate < new Date(options.since)) {
      return false;
    }

    if (options.until && item.pubDate > new Date(options.until)) {
      return false;
    }

    // Category filter
    if (
      options.category &&
      !item.categories.some((cat) =>
        cat.toLowerCase().includes(options.category.toLowerCase())
      )
    ) {
      return false;
    }

    // Keyword search
    if (options.search) {
      const searchStr = options.search.toLowerCase();
      const itemStr = `${item.title} ${item.description}`.toLowerCase();
      if (!itemStr.includes(searchStr)) {
        return false;
      }
    }

    return true;
  }

  extractFirstImage(html) {
    const $ = cheerio.load(html);
    const img = $("img").first();
    return img.attr("src") || null;
  }

  extractTextSummary(html, length = 200) {
    const text = cheerio.load(html).text().replace(/\s+/g, " ").trim();
    return text.length > length ? text.substring(0, length) + "..." : text;
  }

  async parseMultipleFeeds(feedUrls, options) {
    const allItems = [];

    await Promise.all(
      feedUrls.map(async (url) => {
        try {
          const items = await this.parseFeed(url, options);
          allItems.push(...items);
        } catch (error) {
          console.error(`Error parsing ${url}: ${error.message}`);
        }
      })
    );

    // Sort all items by date
    return allItems.sort((a, b) => b.pubDate - a.pubDate);
  }
}

module.exports = RSSParser;
