import { randomBytes } from 'crypto';

const SHORT_ID_LENGTH = 5;
const SHORT_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ALPHABET_LENGTH = SHORT_ID_ALPHABET.length;

/**
 * Generate a short collision-resistant human-readable ID (5 chars).
 * Avoids ambiguous characters (I, O, 0, 1).
 */
export function createShortId(): string {
  let id = '';
  while (id.length < SHORT_ID_LENGTH) {
    const bytes = randomBytes(SHORT_ID_LENGTH);
    for (const value of bytes) {
      id += SHORT_ID_ALPHABET[value % ALPHABET_LENGTH];
      if (id.length === SHORT_ID_LENGTH) break;
    }
  }
  return id;
}
