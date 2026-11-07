// Vercel function behind /streetview: adds the server-held key and redirects to Google.
const { streetViewRedirect } = require('../lib/streetview');

module.exports = (req, res) => {
  const result = streetViewRedirect(req.query || {}, (process.env.GOOGLE_MAPS_EMBED_KEY || '').trim());
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (result.status === 302) {
    res.statusCode = 302;
    res.setHeader('Location', result.location);
    return res.end();
  }
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(result.message);
};
