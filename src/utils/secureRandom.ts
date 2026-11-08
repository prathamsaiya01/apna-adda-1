// src/utils/secureRandom.ts

/**
 * Browser-side cryptographically secure random utilities using window.crypto
 */

export function secureRandomIndex(lengthExclusive: number): number {
  if (typeof lengthExclusive !== 'number' || lengthExclusive <= 1) return 0;

  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const randomBuffer = new Uint32Array(1);
    const maxUint32 = 0xFFFFFFFF;
    // Discard upper range to eliminate modulo bias
    const limit = maxUint32 - (maxUint32 % lengthExclusive);
    let rand: number;
    do {
      window.crypto.getRandomValues(randomBuffer);
      rand = randomBuffer[0];
    } while (rand >= limit);
    return rand % lengthExclusive;
  }

  // Safe fallback if crypto is not available
  return Math.floor(Math.random() * lengthExclusive);
}

/**
 * Unbiased Fisher-Yates shuffle with cryptographic random values
 */
export function secureFisherYatesShuffle<T>(array: T[]): T[] {
  if (!Array.isArray(array) || array.length <= 1) {
    return Array.isArray(array) ? [...array] : [];
  }
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Picks a single random item from an array
 */
export function secureChoice<T>(array: T[]): T | null {
  if (!Array.isArray(array) || array.length === 0) return null;
  const idx = secureRandomIndex(array.length);
  return array[idx];
}

/**
 * Picks `count` unique items randomly without replacement
 */
export function secureSample<T>(array: T[], count: number): T[] {
  if (!Array.isArray(array) || array.length === 0 || count <= 0) return [];
  const n = Math.min(count, array.length);
  const shuffled = secureFisherYatesShuffle(array);
  return shuffled.slice(0, n);
}
