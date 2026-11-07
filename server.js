// A Walk Through uOttawa — small backend
// Serves the website and keeps the Google Maps Embed API key on the server,
// so no device (laptop, phone, or the cylinder display) ever has to type it in.
//
// Run:  node server.js        (Node 18 or newer, no packages needed)
// Key:  put GOOGLE_MAPS_EMBED_KEY=... in a .env file next to this script,
//       or set it as an environment variable on your host.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { streetViewRedirect } = require('./lib/streetview');

// ---------- Load .env (tiny parser, no dependency) ----------
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const MAPS_KEY = (process.env.GOOGLE_MAPS_EMBED_KEY || '').trim();
const PUBLIC_DIR = path.join(__dirname, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

// Send the site's origin to Google so a referrer-restricted key is accepted.
const BASE_HEADERS = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...BASE_HEADERS, ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Health / feature check used by the page on load.
  if (url.pathname === '/api/streetview/status') {
    return send(res, 200, JSON.stringify({ enabled: Boolean(MAPS_KEY) }), {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  }

  // The Street View iframe points here; the server adds the key and redirects to Google.
  if (url.pathname === '/streetview') {
    const result = streetViewRedirect(Object.fromEntries(url.searchParams), MAPS_KEY);
    if (result.status === 302) return send(res, 302, '', { Location: result.location, 'Cache-Control': 'no-store' });
    return send(res, result.status, result.message, { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  // ---------- Static files ----------
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Forbidden');

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { ...BASE_HEADERS, 'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`A Walk Through uOttawa → http://localhost:${PORT}`);
  console.log(MAPS_KEY ? 'Street View: key loaded from server ✓' : 'Street View: no GOOGLE_MAPS_EMBED_KEY set — pages will fall back to the key form.');
});
