const crypto = require('crypto');
require('./config');

const KEY = crypto.scryptSync(
    process.env.APP_CRYPTO_SECRET,
    process.env.APP_CRYPTO_SALT, 32);

function sha256(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store as: iv.tag.ciphertext (all base64)
  return `${iv.toString('base64')}.${tag.toString('base64')}.${ct.toString('base64')}`;
}

function decrypt(stored) {
  const [ivB64, tagB64, ctB64] = stored.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString('utf8');
}

module.exports = {
  encrypt,
  decrypt,
  sha256
};