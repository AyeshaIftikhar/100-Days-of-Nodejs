import express from 'express';
import { loadAllPosts, loadPostBySlug, getAllCategories, getAllTags, getSearchIndex } from '../services/content.js';
import { searchIndex } from '../lib/search.js';
import { jsonLdForPost } from '../middleware/seo.js';

const router = express.Router();

router.get('/', (req, res) => {
  const posts = loadAllPosts().slice(0, 20);
  res.render('index', { title: 'Home', posts, categories: getAllCategories(), tags: getAllTags() });
});

router.get('/post/:slug', (req, res, next) => {
  const post = loadPostBySlug(req.params.slug);
  if (!post) return next();
  const jsonLd = jsonLdForPost(post);
  res.render('post', { title: post.title, post, jsonLd });
});

router.get('/category/:name', (req, res) => {
  const name = req.params.name;
  const posts = loadAllPosts().filter(p => p.category === name);
  res.render('category', { title: `Category: ${name}`, name, posts });
});

router.get('/tag/:name', (req, res) => {
  const name = req.params.name;
  const posts = loadAllPosts().filter(p => (p.tags || []).includes(name));
  res.render('tag', { title: `Tag: ${name}`, name, posts });
});

router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  let results = [];
  if (q) {
    const idx = getSearchIndex();
    const matches = searchIndex(idx, q);
    const all = loadAllPosts();
    results = matches.map(m => all.find(p => p.slug === m.ref)).filter(Boolean);
  }
  res.render('search', { title: 'Search', q, results });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

export default router;
