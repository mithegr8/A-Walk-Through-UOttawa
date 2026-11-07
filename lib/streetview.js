// Shared Street View logic for both the local server (server.js) and Vercel (api/).
function num(value, min, max, fallback) {
  const n = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Returns { status, location?, message? } for a request's query parameters.
function streetViewRedirect(query, key) {
  if (!key) return { status: 503, message: 'Street View key is not configured on the server.' };
  const lat = num(query.lat, -90, 90, null);
  const lng = num(query.lng, -180, 180, null);
  if (lat === null || lng === null) return { status: 400, message: 'lat and lng are required.' };
  const params = new URLSearchParams({
    key,
    location: `${lat.toFixed(6)},${lng.toFixed(6)}`,
    heading: String(num(query.heading, 0, 360, 148)),
    pitch: String(num(query.pitch, -90, 90, 0)),
    fov: String(num(query.fov, 10, 100, 90)),
    language: 'en',
  });
  return { status: 302, location: 'https://www.google.com/maps/embed/v1/streetview?' + params.toString() };
}

module.exports = { streetViewRedirect };
