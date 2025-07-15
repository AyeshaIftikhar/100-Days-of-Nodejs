# RSS Feed Parser
An RSS Feed (Really Simple Syndication) is a standardized format used to distribute and receive regularly updated content from websites, such as news articles, blog posts, or podcasts.

## 🔹 What it Does:
It automatically delivers new content to subscribers in a structured XML format, without requiring them to visit the website.

## 🔹 How It Works:
- A website generates an RSS feed URL (e.g., https://example.com/feed.xml).
- You subscribe to that URL using an RSS reader (like Feedly, Inoreader, or even some email clients).
- The reader checks for updates regularly and displays new content from all your subscriptions in one place.

## 🔹 Key Elements of an RSS Feed:
- `<channel>`: Metadata about the feed (title, description, link).
- `<item>`: Each individual update/post.
    - `<title>`: The post's title.
    - `<link>`: URL to the full content.
    - `<description>`: Summary or snippet.
    - `<pubDate>`: Date it was published.

## 🔹 Example Use Cases:
- 📚 Bloggers updating readers automatically.
- 🎧 Podcasters delivering new episodes to apps like Spotify or Apple Podcasts.
- 📰 News websites offering headline updates.
- 📡 Developers syndicating API update logs or changelogs.

## 🔹 Benefits:
- No spam or algorithms—just pure content.
- Offline-friendly via apps.
- Saves time by aggregating updates in one place.

## Features
- Fetch and parse RSS/Atom feeds
- Support for custom feed URLs
- Item filtering by date, category, or keywords
- Feed normalization (handle both RSS and Atom formats)
- Caching to avoid repeated requests
- CLI and API interfaces

```bash
node cli.js parse -u https://example.com/feed.xml --limit 5 --sort newest
```