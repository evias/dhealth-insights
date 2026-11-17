// middleware/auth.js
const crypto = require('crypto');

// Authorized access API keys. Never export.
const authApiKeysStr = process.env.AUTH_API_KEY || '';
const authorizedApiKeys = authApiKeysStr.length > 0
    ? authApiKeysStr.split(',') : [];

// Timing-safe comparison avoids leaking key info via response timing.
function timingSafeCompare(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// apiKeyAuth middleware can be used to protect routes by API Key.
// Returns HTTP 401 and 403 given missing/invalid api key.
function apiKeyAuth(req, res, next) {
  const apiKey = req.get('x-api-key');
  if (!apiKey || !authorizedApiKeys.length) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  const isValid = authorizedApiKeys.some(
    (valid) => valid && timingSafeCompare(apiKey, valid)
  );
  if (!isValid) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.client = { authenticated: true };
  next();
}

module.exports = { apiKeyAuth };