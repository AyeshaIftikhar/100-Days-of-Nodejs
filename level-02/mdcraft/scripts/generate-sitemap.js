import fs from 'fs';
import path from 'path';
import { CONFIG } from '../src/config.js';
import { loadAllPosts } from '../src/services/content.js';

const urls = [
  { loc: `${CONFIG.SITE_URL}/`, priority: 1.0 },
  { loc: `${CONFIG.SITE_URL}/about`, priority: 0.6 },
  { loc: `${CONFIG.SITE_URL}/rss.xml`, priority: 0.5 }
];

loadAllPosts().forEach(p => {
  urls.push({ loc: `${CONFIG.SITE_URL}${p.url}`, priority: 0.8, lastmod: p.isoDate });
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), xml);
console.log('sitemap.xml generated.');
