/**
 * Convert any string into a URL-safe slug.
 *
 * Handles: accents/diacritics, ligatures, German umlauts,
 * special symbols, repeated separators, casing, and length limits.
 *
 * @param {string} input
 * @param {Object} [options]
 * @param {string}   [options.separator='-']     Character used between words
 * @param {number}   [options.maxLength=0]       0 = no limit; otherwise trim to N chars (word-safe)
 * @param {boolean}  [options.lowercase=true]    Force lowercase output
 * @param {boolean}  [options.strict=false]      true = strip chars with no replacement (e.g. `@`), false = transliterate
 * @returns {string}
 */
function slugify(input, options = {}) {
  const {
    separator = '-',
    maxLength = 0,
    lowercase = true,
    strict = false,
  } = options;

  if (typeof input !== 'string') return '';

  const map = {
    // German
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
    // Ligatures & special letters
    'æ': 'ae', 'œ': 'oe', 'Æ': 'Ae', 'Œ': 'Oe',
    'ø': 'o', 'Ø': 'O', 'å': 'a', 'Å': 'A',
    'đ': 'd', 'Đ': 'D', 'ð': 'd', 'Ð': 'D',
    'þ': 'th', 'Þ': 'TH', 'ł': 'l', 'Ł': 'L',
    // Symbols → words
    '&': ' and ', '@': ' at ', '%': ' percent ',
    '$': ' dollar ', '€': ' euro ', '£': ' pound ',
    '+': ' plus ', '©': ' copyright ', '®': ' registered ',
    '™': ' trademark ',
  };

  let str = input.normalize('NFKD');

  // Replace known characters before NFKD stripping (they'd be lost otherwise)
  str = str.replace(/[äöüßÄÖÜæœÆŒøØåÅđĐðÐþÞłŁ&@%$€£+©®™]/g, (ch) => map[ch] ?? ch);

  if (strict) {
    // Strip anything that isn't a letter/number/space
    str = str.replace(/[^\p{L}\p{N}\s-]/gu, '');
  } else {
    // Transliterate: split accented letters into base letter + combining mark,
    // then drop the marks (é → e, ç → c, ñ → n, …)
    str = str.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  }

  if (lowercase) str = str.toLowerCase();

  // Replace anything that isn't a letter/number with the separator
  const safeSep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
  str = str
    .replace(/[^\p{L}\p{N}]+/gu, safeSep)
    .replace(new RegExp(`${safeSep}{2,}`, 'g'), safeSep)   // collapse repeats
    .replace(new RegExp(`^${safeSep}+|${safeSep}+$`, 'g'), ''); // trim edges

  // Word-safe truncation
  if (maxLength > 0) {
    const sepEsc = new RegExp(`${safeSep}`, 'g');
    if (str.length > maxLength) {
      str = str.slice(0, maxLength);
      const lastSep = str.lastIndexOf(separator);
      if (lastSep > maxLength * 0.6) str = str.slice(0, lastSep); // don't cut mid-word
    }
    str = str.replace(new RegExp(`${safeSep}+$`), '');
  }

  return str;
}

module.exports = {
  slugify,
};
