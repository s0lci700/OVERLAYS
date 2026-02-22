const { randomBytes } = require("crypto");

const SHORT_ID_LENGTH = 5;
const SHORT_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ALPHABET_LENGTH = SHORT_ID_ALPHABET.length;

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
