const { XMLParser } = require('fast-xml-parser');

function parseNetscape(html) {
  const items = [];
  const linkRegex = /<A\s+([^>]*)>([\s\S]*?)<\/A>/gi;
  const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const attrs = {};
    let a;
    while ((a = attrRegex.exec(m[1])) !== null) attrs[a[1].toLowerCase()] = a[2];
    if (attrs.href) {
      items.push({
        url: attrs.href,
        title: (m[2] || '').trim() || attrs.href,
        icon: attrs.icon || '',
        addDate: attrs.add_date ? Number(attrs.add_date) * 1000 : null
      });
    }
  }
  return items;
}

function parseXbel(xml) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const doc = parser.parse(xml);
  const items = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.bookmark) {
      const list = Array.isArray(node.bookmark) ? node.bookmark : [node.bookmark];
      list.forEach((b) => {
        items.push({
          url: b['@_href'] || '',
          title: (b.title || b['@_href'] || '').trim(),
          icon: '',
          addDate: null
        });
      });
    }
    if (node.folder) {
      const list = Array.isArray(node.folder) ? node.folder : [node.folder];
      list.forEach(walk);
    }
  };
  walk(doc.xbel || doc);
  return items;
}

function parseBookmarks(text) {
  const t = text.trim();
  if (t.startsWith('<?xml') || t.startsWith('<xbel')) return parseXbel(t);
  return parseNetscape(t);
}

function exportNetscape(bookmarks) {
  const lines = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<!-- This is an automatically generated file. -->',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>'
  ];
  bookmarks.forEach((b) => {
    const iconAttr = b.icon ? ` ICON="${b.icon}"` : '';
    const addDate = Math.floor((b.created_at ? new Date(b.created_at).getTime() : Date.now()) / 1000);
    lines.push(`    <DT><A HREF="${b.url}" ADD_DATE="${addDate}"${iconAttr}>${b.title || b.url}</A>`);
  });
  lines.push('</DL><p>');
  return lines.join('\n');
}

module.exports = { parseBookmarks, exportNetscape };
