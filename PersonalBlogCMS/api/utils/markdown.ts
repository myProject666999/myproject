import { marked } from 'marked';
import xss from 'xss';

marked.setOptions({
  breaks: true,
  gfm: true,
});

const xssOptions = {
  whiteList: {
    a: ['href', 'title', 'target'],
    b: [],
    strong: [],
    i: [],
    em: [],
    p: [],
    br: [],
    span: ['class'],
    ul: [],
    ol: [],
    li: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    blockquote: [],
    code: ['class'],
    pre: ['class'],
    img: ['src', 'alt', 'title'],
    table: [],
    thead: [],
    tbody: [],
    tr: [],
    th: [],
    td: [],
    hr: [],
  },
};

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  const html = marked.parse(markdown) as string;
  return xss(html, xssOptions);
}

export function filterCommentContent(content: string): string {
  if (!content) return '';
  const commentXssOptions = {
    whiteList: {
      a: ['href', 'title'],
      b: [],
      strong: [],
      i: [],
      em: [],
      p: [],
      br: [],
      code: [],
    },
  };
  return xss(content, commentXssOptions);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}
