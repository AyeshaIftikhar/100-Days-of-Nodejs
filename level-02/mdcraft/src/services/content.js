import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import slugify from 'slugify';
import dayjs from 'dayjs';
import { renderMarkdown } from '../lib/markdown.js';
import { setCache, getCache } from '../lib/cache.js';
import { CONFIG } from '../config.js';
import { buildIndex } from '../lib/search.js';

const postsPath = fileURLToPath(CONFIG.POSTS_DIR);
const pagesPath = fileURLToPath(CONFIG.PAGES_DIR);

function readMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { data, content, raw };
}

function toSlug(basename, frontSlug) {
  if (frontSlug) return frontSlug;
  // strip date prefix yyyy-mm-dd-
  const name = basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return slugify(name.replace(/\.md$/i, ''), { lower: true, strict: true });
}

export function loadAllPosts() {
  const cacheKey = 'posts_all';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const files = fs.readdirSync(postsPath).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const fp = path.join(postsPath, file);
    const { data, content, raw } = readMarkdown(fp);
    const slug = toSlug(file, data.slug);
    const date = data.date ? dayjs(data.date).toDate() : new Date(fs.statSync(fp).mtime);
    const html = renderMarkdown(content);
    const excerpt = (content.split('\n').find(l => l.trim()) || '').slice(0, 180);
    const url = `/post/${slug}`;
    const category = data.category || 'general';
    const tags = data.tags || [];
    const niche = data.niche || null;

    return {
      title: data.title || slug,
      slug, url, date, isoDate: dayjs(date).toISOString(),
      category, tags, niche,
      ogImage: data.ogImage || null,
      html, excerpt, raw: content,
      readingMinutes: Math.max(2, Math.round(content.split(/\s+/).length / 200))
    };
  }).sort((a, b) => b.date - a.date);

  setCache(cacheKey, posts, CONFIG.CACHE_TTL_MS);
  return posts;
}

export function loadPostBySlug(slug) {
  const posts = loadAllPosts();
  return posts.find(p => p.slug === slug) || null;
}

export function loadAllPages() {
  const cacheKey = 'pages_all';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const files = fs.existsSync(pagesPath) ? fs.readdirSync(pagesPath).filter(f => f.endsWith('.md')) : [];
  const pages = files.map(file => {
    const fp = path.join(pagesPath, file);
    const { data, content } = readMarkdown(fp);
    return {
      title: data.title || file.replace(/\.md$/, ''),
      slug: data.slug || file.replace(/\.md$/, ''),
      html: renderMarkdown(content)
    };
  });

  setCache(cacheKey, pages, CONFIG.CACHE_TTL_MS);
  return pages;
}

let searchIdx = null;
export function getSearchIndex() {
  if (!searchIdx) {
    const posts = loadAllPosts();
    searchIdx = buildIndex(posts);
  }
  return searchIdx;
}

export function getAllCategories() {
  const posts = loadAllPosts();
  const map = new Map();
  posts.forEach(p => map.set(p.category, (map.get(p.category) || 0) + 1));
  return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function getAllTags() {
  const posts = loadAllPosts();
  const map = new Map();
  posts.forEach(p => (p.tags || []).forEach(t => map.set(t, (map.get(t) || 0) + 1)));
  return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function getAllNiches() {
  const posts = loadAllPosts();
  const map = new Map();
  posts.forEach(p => p.niche && map.set(p.niche, (map.get(p.niche) || 0) + 1));
  return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
