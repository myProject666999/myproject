const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const config = require('../../config/default');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function fetchMeta(url) {
  const result = { url, title: '', icon: '', description: '', statusCode: null, ok: false };
  try {
    const resp = await axios.get(url, {
      timeout: config.fetch.timeout,
      maxRedirects: config.fetch.maxRedirects,
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      responseType: 'text',
      transformResponse: [(data) => data]
    });
    result.statusCode = resp.status;
    const html = resp.data || '';
    const $ = cheerio.load(html);
    result.title = ($('title').first().text() || '').trim().slice(0, 255);
    const desc = $('meta[name="description"]').attr('content')
      || $('meta[property="og:description"]').attr('content') || '';
    result.description = desc.trim().slice(0, 512);

    let icon = $('link[rel="icon"]').attr('href')
      || $('link[rel="shortcut icon"]').attr('href')
      || $('link[rel="apple-touch-icon"]').attr('href') || '';
    if (icon) {
      try { icon = new URL(icon, url).toString(); } catch (_) { icon = ''; }
    }
    if (!icon) {
      try { icon = new URL('/favicon.ico', url).toString(); } catch (_) { icon = ''; }
    }
    result.icon = icon;
    result.ok = resp.status >= 200 && resp.status < 400;
  } catch (err) {
    result.error = err.message;
    if (err.response) result.statusCode = err.response.status;
    result.ok = false;
  }
  return result;
}

async function checkUrl(url) {
  try {
    const resp = await axios.head(url, {
      timeout: config.fetch.timeout,
      maxRedirects: config.fetch.maxRedirects,
      headers: { 'User-Agent': UA }
    });
    return { ok: resp.status >= 200 && resp.status < 400, statusCode: resp.status };
  } catch (err) {
    if (err.response) return { ok: false, statusCode: err.response.status };
    try {
      const resp = await axios.get(url, {
        timeout: config.fetch.timeout,
        maxRedirects: config.fetch.maxRedirects,
        headers: { 'User-Agent': UA }
      });
      return { ok: resp.status >= 200 && resp.status < 400, statusCode: resp.status };
    } catch (e2) {
      return { ok: false, statusCode: e2.response ? e2.response.status : 0 };
    }
  }
}

module.exports = { fetchMeta, checkUrl };
