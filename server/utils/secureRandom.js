// apna-adda-backend/utils/secureRandom.js
const crypto = require('crypto');

/**
 * Returns a cryptographically secure random integer in [min, maxExclusive).
 * Uses Node.js crypto.randomInt which is uniformly distributed and eliminates modulo bias.
 */
function secureRandomInt(min, maxExclusive) {
  if (typeof min !== 'number' || typeof maxExclusive !== 'number') {
    throw new TypeError('secureRandomInt: arguments must be numbers');
  }
  if (min >= maxExclusive) {
    throw new RangeError(`secureRandomInt: min (${min}) must be less than maxExclusive (${maxExclusive})`);
  }
  return crypto.randomInt(min, maxExclusive);
}

/**
 * Returns a cryptographically secure random index in [0, lengthExclusive).
 */
function secureRandomIndex(lengthExclusive) {
  if (typeof lengthExclusive !== 'number' || lengthExclusive <= 0) {
    return 0;
  }
  if (lengthExclusive === 1) return 0;
  return crypto.randomInt(0, lengthExclusive);
}

/**
 * Cryptographically secure Fisher-Yates (Knuth) shuffle algorithm.
 * Produces an unbiased, uniformly distributed permutation of the input array.
 */
function secureFisherYatesShuffle(array) {
  if (!Array.isArray(array) || array.length <= 1) {
    return Array.isArray(array) ? [...array] : [];
  }
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Picks `count` unique items randomly from an array without replacement
 * using Fisher-Yates sampling with crypto.randomInt.
 */
function secureSample(array, count) {
  if (!Array.isArray(array) || array.length === 0 || count <= 0) {
    return [];
  }
  const n = Math.min(count, array.length);
  const shuffled = secureFisherYatesShuffle(array);
  return shuffled.slice(0, n);
}

/**
 * Picks a single random item from an array using crypto.randomInt.
 */
function secureChoice(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  const idx = crypto.randomInt(0, array.length);
  return array[idx];
}

module.exports = {
  secureRandomInt,
  secureRandomIndex,
  secureFisherYatesShuffle,
  secureSample,
  secureChoice
};
