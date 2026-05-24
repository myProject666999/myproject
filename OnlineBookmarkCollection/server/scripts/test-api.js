const http = require('http');

function get(u) {
  return new Promise((resolve) => {
    http.get('http://127.0.0.1:3001' + u, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ s: res.statusCode, d }));
    }).on('error', (e) => resolve({ s: 0, d: e.message }));
  });
}

function req(method, u, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : '';
    const r = http.request(
      { host: '127.0.0.1', port: 3001, path: u, method, headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve({ s: res.statusCode, d }));
      }
    );
    r.on('error', (e) => resolve({ s: 0, d: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  const cases = [
    ['GET', '/api/folders'],
    ['GET', '/api/tags'],
    ['GET', '/api/bookmarks'],
    ['GET', '/api/stats']
  ];
  for (const [m, u] of cases) {
    const r = await get(u);
    console.log(m, u, '=>', r.s, r.d.slice(0, 200));
  }

  const add = await req('POST', '/api/bookmarks', { url: 'https://example.com', title: 'Example', tags: ['test'] });
  console.log('POST /api/bookmarks =>', add.s, add.d.slice(0, 200));

  const list = await get('/api/bookmarks');
  const payload = JSON.parse(list.d);
  if (payload.data && payload.data.length) {
    const id = payload.data[0].id;
    for (const [m, u, b] of [
      ['GET', '/api/bookmarks/' + id],
      ['PUT', '/api/bookmarks/' + id, { title: 'Example Updated' }],
      ['POST', '/api/bookmarks/check/' + id, {}]
    ]) {
      const r = m === 'GET' ? await get(u) : await req(m, u, b);
      console.log(m, u, '=>', r.s, r.d.slice(0, 200));
    }
    const del = await req('POST', '/api/bookmarks/batch-delete', { ids: [id] });
    console.log('POST /api/bookmarks/batch-delete =>', del.s, del.d.slice(0, 200));
  }
})();
