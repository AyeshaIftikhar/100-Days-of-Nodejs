const parseString = require('xml2js').parseString;
const logger = require('../utils/logger');

class AtomParser {
  static async parse(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          logger.error(`Atom parsing failed: ${err.message}`);
          return reject(err);
        }

        try {
          const feed = result.feed;
          const parsedFeed = {
            title: feed.title[0]._ || feed.title[0],
            description: feed.subtitle ? feed.subtitle[0]._ || feed.subtitle[0] : '',
            link: feed.link.find(l => l.$.rel === 'alternate').$.href,
            language: feed.language ? feed.language[0] : null,
            updated: feed.updated ? feed.updated[0] : null,
            image: feed.logo ? {
              url: feed.logo[0],
              title: feed.title[0]._ || feed.title[0],
            } : null,
          };

          const items = feed.entry.map(entry => ({
            title: entry.title[0]._ || entry.title[0],
            description: entry.summary ? entry.summary[0]._ || entry.summary[0] : '',
            content: entry.content ? entry.content[0]._ || entry.content[0] : '',
            link: entry.link.find(l => l.$.rel === 'alternate').$.href,
            guid: entry.id[0],
            pubDate: entry.updated ? new Date(entry.updated[0]) : new Date(),
            author: entry.author ? entry.author[0].name[0] : null,
            categories: entry.category ? entry.category.map(cat => cat.$.term) : [],
            enclosure: entry.link.find(l => l.$.rel === 'enclosure') ? {
              url: entry.link.find(l => l.$.rel === 'enclosure').$.href,
              type: entry.link.find(l => l.$.rel === 'enclosure').$.type,
              length: entry.link.find(l => l.$.rel === 'enclosure').$.length,
            } : null,
          }));

          resolve({ feed, items: parsedItems });
        } catch (error) {
          logger.error(`Atom parsing error: ${error.message}`);
          reject(new Error('Invalid Atom feed format'));
        }
      });
    });
  }
}

module.exports = AtomParser;