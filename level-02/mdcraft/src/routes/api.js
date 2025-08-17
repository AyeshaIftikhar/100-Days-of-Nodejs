import express from 'express';
import RSS from 'rss';
import { CONFIG } from '../config.js';
import { loadAllPosts } from '../services/content.js';

const router = express.Router();

router.get('/rss.xml', (req, res) => {
  const feed = new RSS({
    title: CONFIG.SITE_NAME,
    description: CONFIG.SITE_TAGLINE,
    site_url: CONFIG.SITE_URL,
    feed_url: `${CONFIG.SITE_URL}/rss.xml`,
    language: 'en'
  });

  loadAllPosts().forEach(p => {
    feed.item({
      title: p.title,
      description: p.excerpt,
      url: `${CONFIG.SITE_URL}${p.url}`,
      date: p.date
    });
  });

  res.set('Content-Type', 'application/xml');
  res.send(feed.xml({ indent: true }));
});

export default router;
