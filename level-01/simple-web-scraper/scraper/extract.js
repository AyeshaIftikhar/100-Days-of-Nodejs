const axios = require('axios');
const cheerio = require('cheerio');

const extractData = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(data);

    // Example: Extract all <h2> titles and links
    const results = [];

    $('h2 a').each((_, el) => {
      results.push({
        title: $(el).text().trim(),
        link: $(el).attr('href')
      });
    });

    return { count: results.length, results };
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = extractData;
