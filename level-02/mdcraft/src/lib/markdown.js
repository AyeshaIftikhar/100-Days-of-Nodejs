import MarkdownIt from 'markdown-it';
import mdAnchor from 'markdown-it-anchor';
import mdFootnote from 'markdown-it-footnote';
import mdPrism from 'markdown-it-prism';

export const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false
})
  .use(mdAnchor, { permalink: mdAnchor.permalink.headerLink() })
  .use(mdFootnote)
  .use(mdPrism);

export function renderMarkdown(content) {
  return md.render(content);
}
