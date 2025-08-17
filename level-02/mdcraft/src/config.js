import 'dotenv/config';

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
  SITE_NAME: process.env.SITE_NAME || 'MDCraft',
  SITE_TAGLINE: process.env.SITE_TAGLINE || 'High-value technical content',
  CONTENT_DIR: new URL('../content', import.meta.url),
  POSTS_DIR: new URL('../content/posts', import.meta.url),
  PAGES_DIR: new URL('../content/pages', import.meta.url),
  CACHE_TTL_MS: 1000 * 60 * 5 // 5 minutes
};

export const NICHES = [
  { key: 'ai-engineering', title: 'AI Engineering', monetization: ['Courses', 'Consulting', 'Evaluations', 'MLOps tooling'] },
  { key: 'cloud-finops', title: 'Cloud Cost Optimization', monetization: ['Audits', 'Advisory', 'SaaS benchmark reports'] },
  { key: 'cybersecurity', title: 'Cybersecurity', monetization: ['VAPT', 'Managed security', 'Compliance'] },
  { key: 'fintech-compliance', title: 'FinTech Compliance', monetization: ['Policy templates', 'Fractional compliance officer', 'Workshops'] }
];
