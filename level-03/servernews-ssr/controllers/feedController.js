const feedService = require('../services/feedService');

exports.home = async (req, res) => {
  try {
    const allFeeds = await feedService.getAggregatedFeeds();
    res.render('index', { title: 'ServerNews — Aggregated News', feeds: allFeeds });
  } catch (err) {
    console.error(err);
    res.status(500).render('index', { title: 'ServerNews — Error', feeds: [] });
  }
};

exports.article = async (req, res) => {
  const { id } = req.params; // id is encoded as feedId__index (example)
  try {
    const item = await feedService.getItemByEncodedId(id);
    if (!item) return res.status(404).render('article', { title: 'Not Found', item: null });
    res.render('article', { title: item.title, item });
  } catch (err) {
    console.error(err);
    res.status(500).render('article', { title: 'Error', item: null });
  }
};

// simple admin to add feed (in-memory for demo)
exports.addFeed = async (req, res) => {
  const { title, url, id } = req.body;
  if (!url || !title || !id) return res.status(400).send('title, id, url required');
  try {
    await feedService.addFeed({ id, title, url });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add feed');
  }
};
