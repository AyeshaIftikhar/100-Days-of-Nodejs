const parseString = require('xml2js').parseString;
const logger = require('../utils/logger');

class RssParser {
  static async parse(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          logger.error(`RSS parsing failed: ${err.message}`);
          return reject(err);
        }

        try {
          const channel = result.rss.channel[0];
          const feed = {
            title: channel.title[0],
            description: channel.description ? channel.description[0] : '',
            link: channel.link[0],
            language: channel.language ? channel.language[0] : null,
            lastBuildDate: channel.lastBuildDate ? channel.lastBuildDate[0] : null,
            image: channel.image ? {
              url: channel.image[0].url[0],
              title: channel.image[0].title[0],
            } : null,
          };

          const items = channel.item.map(item => ({
            title: item.title[0],
            description: item.description ? item.description[0] : '',
            content: item['content:encoded'] ? item['content:encoded'][0] : '',
            link: item.link[0],
            guid: item.guid ? item.guid[0]._ || item.guid[0] : item.link[0],
            pubDate: item.pubDate ? new Date(item.pubDate[0]) : new Date(),
            author: item.author ? item.author[0] : null,
            categories: item.category ? item.category.map(cat => cat._ || cat) : [],
            enclosure: item.enclosure ? {
              url: item.enclosure[0].$.url,
              type: item.enclosure[0].$.type,
              length: item.enclosure[0].$.length,
            } : null,
          }));

          resolve({ feed, items });
        } catch (error) {
          logger.error(`RSS parsing error: ${error.message}`);
          reject(new Error('Invalid RSS feed format'));
        }
      });
    });
  }
}

module.exports = RssParser;