const { createShortId } = require("./id");
const { ensureCharactersPhotos } = require("./photos");

const DEFAULT_TEMPLATE_NAME = "test_characters";

function getTemplateBaseName(templateName) {
  const cleaned = String(templateName || DEFAULT_TEMPLATE_NAME)
    .trim()
    .replace(/\.js$/i, "");
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
    return DEFAULT_TEMPLATE_NAME;
  }
  return cleaned;
}

function loadCharacterTemplate() {
  const requestedTemplate = process.env.CHARACTERS_TEMPLATE;
  const templateBaseName = getTemplateBaseName(requestedTemplate);

  try {
    return require(`./${templateBaseName}.js`);
  } catch (error) {
    if (templateBaseName !== DEFAULT_TEMPLATE_NAME) {
      console.warn(
        `[characters] Failed to load template "${templateBaseName}". Falling back to "${DEFAULT_TEMPLATE_NAME}".`,
      );
    }
    return require(`./${DEFAULT_TEMPLATE_NAME}.js`);
  }
}

/**
 * @typedef {Object} AbilityScores
 * @property {number} str - Strength
 * @property {number} dex - Dexterity
 * @property {number} con - Constitution
 * @property {number} int - Intelligence
 * @property {number} wis - Wisdom
 * @property {number} cha - Charisma
 */

/**
 * @typedef {Object} Condition
 * @property {string} id             - 5-character ID assigned on creation
 * @property {string} condition_name - Display name (e.g. "Poisoned")
 * @property {number} intensity_level - Severity (default 1)
 * @property {string} applied_at     - ISO 8601 timestamp
 */

/**
 * @typedef {Object} Resource
 * @property {string} id           - Unique ID within the character (e.g. "RS001")
 * @property {string} name         - Display name (e.g. "RAGE", "KI")
 * @property {number} pool_max     - Maximum uses
 * @property {number} pool_current - Remaining uses
 * @property {"SHORT_REST"|"LONG_REST"|"TURN"|"DM"} recharge - When the resource refills
 */

/**
 * @typedef {Object} Character
 * @property {string}        id             - Stable identifier (e.g. "CH001")
 * @property {string}        name           - Character name shown in overlays
 * @property {string}        player         - Player's real name
 * @property {number}        hp_current     - Current hit points (0–hp_max)
 * @property {number}        hp_max         - Maximum hit points
 * @property {number}        hp_temp        - Temporary HP (not counted in hp_current)
 * @property {number}        armor_class    - AC value
 * @property {number}        speed_walk     - Walking speed in feet
 * @property {AbilityScores} ability_scores - Six core D&D ability scores
 * @property {Condition[]}   conditions     - Active status conditions
 * @property {Resource[]}    resources      - Limited-use resources (rage, ki, spell slots, etc.)
 * @property {string}        photo          - URL to 1:1 character photo (e.g. "/assets/img/barbarian.png")
 */

/**
 * Simple in-memory character fixtures plus helper functions used by the API.
 * Source data lives in swappable template files under /data.
 */
const characters = ensureCharactersPhotos(
  structuredClone(loadCharacterTemplate()),
);

const clamp = (value, max) => Math.max(0, Math.min(value, max));

/**
 * Return every character, resources, and conditions for broadcasting and the API.
 * @returns {Character[]}
 */
function getAll() {
  return characters;
}

/**
 * Lookup a character by its stable id.
 * @param {string} id
 * @returns {Character|undefined}
 */
function findById(id) {
  return characters.find((c) => c.id === id);
}

/**
 * Read the character name for logging or display fallbacks.
 * @param {string} id
 * @returns {string}
 */
function getCharacterName(id) {
  const character = findById(id);
  return character ? character.name.toString() : "Unknown";
}

/**
 * Clamp the provided HP and overwrite the current value.
 * @param {string} id
 * @param {number} hpCurrent
 * @returns {Character|null}
 */
function updateHp(id, hpCurrent) {
  const character = findById(id);
  if (!character) return null;
  character.hp_current = clamp(hpCurrent, character.hp_max);
  return character;
}

/**
 * Append a typed condition record with a unique 5-character ID.
 * @param {string} id
 * @param {{condition_name: string, intensity_level?: number}} condition
 * @returns {Character|null}
 */
function addCondition(id, { condition_name, intensity_level = 1 }) {
  const character = findById(id);
  if (!character) return null;
  const condition = {
    id: createShortId(),
    condition_name,
    intensity_level,
    applied_at: new Date().toISOString(),
  };
  character.conditions.push(condition);
  return character;
}

/**
 * Drop a condition using its ID to keep the list clean.
 * @param {string} charId
 * @param {string} conditionId
 * @returns {Character|null}
 */
function removeCondition(charId, conditionId) {
  const character = findById(charId);
  if (!character) return null;
  character.conditions = character.conditions.filter(
    (c) => c.id !== conditionId,
  );
  return character;
}

/**
 * Update a resource's pool_current while respecting its bounds.
 * @param {string} charId
 * @param {string} resourceId
 * @param {number} pool_current
 * @returns {Resource|null}
 */
function updateResource(charId, resourceId, pool_current) {
  const character = findById(charId);
  if (!character) return null;
  const resource = character.resources.find((r) => r.id === resourceId);
  if (!resource) return null;
  resource.pool_current = Math.max(
    0,
    Math.min(pool_current, resource.pool_max),
  );
  return resource;
}

/**
 * Refill the appropriate resource pools based on the rest type.
 * @param {string} charId
 * @param {"short"|"long"} restType
 * @returns {{character: Character, restored: string[]}|null}
 */
function restoreResources(charId, restType) {
  const character = findById(charId);
  if (!character) return null;
  const restored = [];
  character.resources.forEach((res) => {
    const shouldRestore =
      res.recharge === "SHORT_REST" ||
      (restType === "long" && res.recharge === "LONG_REST");
    if (shouldRestore) {
      res.pool_current = res.pool_max;
      restored.push(res.name);
    }
  });
  return { character, restored };
}

/**
 * Create and append a new character with sensible defaults.
 * @param {{name: string, player: string, hp_max: number, hp_current?: number, armor_class?: number, speed_walk?: number, photo?: string}} input
 * @returns {Character}
 */
function createCharacter(input) {
  const hpMax = Math.max(1, Math.trunc(input.hp_max));
  const hpCurrent =
    input.hp_current === undefined
      ? hpMax
      : clamp(Math.trunc(input.hp_current), hpMax);

  const character = {
    id: createShortId(),
    name: input.name,
    player: input.player,
    hp_current: hpCurrent,
    hp_max: hpMax,
    hp_temp: 0,
    armor_class: Math.max(0, Math.trunc(input.armor_class ?? 10)),
    speed_walk: Math.max(0, Math.trunc(input.speed_walk ?? 30)),
    ability_scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    conditions: [],
    resources: [],
    photo: input.photo,
  };

  ensureCharactersPhotos([character]);
  characters.push(character);
  return character;
}

module.exports = {
  characters,
  getCharacterName,
  getAll,
  findById,
  updateHp,
  addCondition,
  removeCondition,
  updateResource,
  restoreResources,
  createCharacter,
};
