// Vercel function behind /api/streetview/status: tells the page whether a key is configured.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ enabled: Boolean((process.env.GOOGLE_MAPS_EMBED_KEY || '').trim()) }));
};
