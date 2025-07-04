const RSSParser = require('./rss-parser');
const parser = new RSSParser();

const techFeeds = [
  'https://techcrunch.com/feed',
  'https://www.theverge.com/rss/index.xml',
  'https://arstechnica.com/feed/'
];

async function getTechNews() {
  const items = await parser.parseMultipleFeeds(techFeeds, {
    limit: 10,
    sort: 'newest'
  });

  console.log('Latest Tech News:');
  items.forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.title}`);
    console.log(`   Source: ${item.source}`);
    console.log(`   Published: ${item.pubDate.toLocaleString()}`);
    console.log(`   Summary: ${item.summary}`);
  });
}

getTechNews();