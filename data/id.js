/**
 * @module id
 * @group Utilities
 * @description Short ID generator used for characters, conditions, resources, and roll records.
 */
const { randomBytes } = require("crypto");

const SHORT_ID_LENGTH = 5;
const SHORT_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ALPHABET_LENGTH = SHORT_ID_ALPHABET.length;

/**
 * Generate a short, human-readable ID (default length: 5).
 *
 * Uses a collision-resistant random byte alphabet (`crypto.randomBytes`) and
 * omits visually ambiguous characters (`I`, `O`, `0`, `1`) to make IDs safe
 * for display and URL use.
 *
 * @example
 * createShortId() // → "AB12C"
 *
 * @returns {string} 5-character uppercase alphanumeric ID
 */
function createShortId() {
  let id = "";
  while (id.length < SHORT_ID_LENGTH) {
    const bytes = randomBytes(SHORT_ID_LENGTH);
    for (const value of bytes) {
      id += SHORT_ID_ALPHABET[value % ALPHABET_LENGTH];
      if (id.length === SHORT_ID_LENGTH) break;
    }
  }
  return id;
}

module.exports = {
  createShortId,
};
