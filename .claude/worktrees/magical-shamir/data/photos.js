/**
 * Photo utility for assigning 1:1 character photos.
 * If a character doesn't have a photo, a random one from assets/img/ is assigned.
 */

const AVAILABLE_PHOTOS = ["barbarian.png", "elf.png", "wizard.png"];

function normalizePhotoValue(photo) {
  if (typeof photo !== "string") return "";
  return photo.trim();
}

/**
 * Get a random photo from the available pool.
 * @returns {string} Photo filename (e.g., "barbarian.png")
 */
function getRandomPhoto() {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_PHOTOS.length);
  return AVAILABLE_PHOTOS[randomIndex];
}

/**
 * Ensure a character has a photo property.
 * If missing, assigns a random one from assets/img/.
 * @param {Object} character
 * @returns {Object} Character with photo property
 */
function ensureCharacterPhoto(character) {
  const normalizedPhoto = normalizePhotoValue(character.photo);
  if (!normalizedPhoto) {
    character.photo = `/assets/img/${getRandomPhoto()}`;
    return character;
  }

  character.photo = normalizedPhoto;
  return character;
}

/**
 * Ensure all characters in an array have photos.
 * @param {Object[]} characters
 * @returns {Object[]} Characters with photo properties
 */
function ensureCharactersPhotos(characters) {
  return characters.map((char) => ensureCharacterPhoto(char));
}

module.exports = {
  getRandomPhoto,
  normalizePhotoValue,
  ensureCharacterPhoto,
  ensureCharactersPhotos,
  AVAILABLE_PHOTOS,
};
