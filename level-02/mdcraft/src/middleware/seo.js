import { CONFIG } from '../config.js';

export function seo(req, res, next) {
  res.locals.site = {
    url: CONFIG.SITE_URL,
    name: CONFIG.SITE_NAME,
    tagline: CONFIG.SITE_TAGLINE
  };
  next();
}

export function jsonLdForPost(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.isoDate,
    "dateModified": post.isoDate,
    "wordCount": post.raw.split(/\s+/).length,
    "author": { "@type": "Person", "name": "Editorial Team" },
    "publisher": { "@type": "Organization", "name": "MDCraft" },
    "mainEntityOfPage": `${CONFIG.SITE_URL}${post.url}`,
    "image": post.ogImage ? [`${CONFIG.SITE_URL}${post.ogImage}`] : []
  };
}
