import lunr from 'lunr';

export function buildIndex(posts) {
  return lunr(function () {
    this.ref('slug');
    this.field('title');
    this.field('excerpt');
    this.field('content');
    this.field('tags');
    posts.forEach(p => this.add({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || '',
      content: p.raw || '',
      tags: (p.tags || []).join(' ')
    }));
  });
}

export function searchIndex(idx, q) {
  if (!q || !idx) return [];
  try {
    return idx.search(q);
  } catch {
    return [];
  }
}
