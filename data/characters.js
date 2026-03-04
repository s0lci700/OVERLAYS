const { createShortId } = require("./id");

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
 * @property {string}        id             - Stable identifier (e.g. "CH101")
 * @property {string}        name           - Character name shown in overlays
 * @property {string}        player         - Player's real name
 * @property {number}        hp_current     - Current hit points (0–hp_max)
 * @property {number}        hp_max         - Maximum hit points
 * @property {number}        hp_temp        - Temporary HP (not counted in hp_current)
 * @property {number}        armor_class    - AC value
 * @property {number}        speed_walk     - Walking speed in feet
 * @property {{name: string, level: number, subclass?: string}} class_primary - Primary class metadata
 * @property {{name: string, feat: string, skill_proficiencies: string[], tool_proficiency: string}} background - Background payload
 * @property {{name: string, size: string, speed_walk: number, traits: string[]}} species - Species payload
 * @property {string[]}     languages      - Known languages
 * @property {string}       alignment      - Alignment key
 * @property {{skills: string[], saving_throws: string[], armor: string[], weapons: string[], tools: string[]}} proficiencies - Proficiency lists
 * @property {{items: string[], coins: {gp: number, sp: number, cp: number}, trinket: string}} equipment - Equipment payload
 * @property {AbilityScores} ability_scores - Six core D&D ability scores
 * @property {Condition[]}   conditions     - Active status conditions
 * @property {Resource[]}    resources      - Limited-use resources (rage, ki, spell slots, etc.)
 * @property {string}        photo          - URL to 1:1 character photo (e.g. "/assets/img/barbarian.png")
 */

/**
 * Return every character, resources, and conditions for broadcasting and the API.
 * @returns {Character[]}
 */
async function getAll(pb) {
  return await pb.collection("characters").getFullList({
    sort: "name",
  });
}

/**
 * Lookup a character by its stable id.
 * @param {string} id
 * @returns {Character|undefined}
 */
async function findById(pb, id) {
  try {
    return await pb.collection("characters").getOne(id);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

/**
 * Read the character name for logging or display fallbacks.
 * @param {string} id
 * @returns {string}
 */
async function getCharacterName(pb, id) {
  const character = await findById(pb, id);
  return character ? character.name.toString() : "Unknown";
}

/**
 * Clamp the provided HP and overwrite the current value.
 * @param {string} id
 * @param {number} hpCurrent
 * @returns {Character|null}
 */
async function updateHp(pb, id, hpCurrent) {
  const character = await findById(pb, id);
  if (!character) return null;
  const clamped = Math.max(0, Math.min(hpCurrent, character.hp_max));
  return await pb.collection("characters").update(id, {
    hp_current: clamped,
  });
}

/**
 * Update a character photo URL or data URI.
 * @param {string} id
 * @param {string} photo
 * @returns {Character|null}
 */
async function updatePhoto(pb, id, photo) {
  const trimmed = typeof photo === "string" ? photo.trim() : "";
  return await pb.collection("characters").update(id, {
    photo: trimmed,
  });
}

/**
 * Update editable character fields while preserving data integrity.
 * @param {string} id
 * @param {{name?: string, player?: string, hp_max?: number, hp_current?: number, armor_class?: number, speed_walk?: number, class_primary?: {name?: string, level?: number, subclass?: string}, background?: {name?: string, feat?: string, skill_proficiencies?: string[], tool_proficiency?: string}, species?: {name?: string, size?: string, speed_walk?: number, traits?: string[]}, languages?: string[], alignment?: string, proficiencies?: {skills?: string[], saving_throws?: string[], armor?: string[], weapons?: string[], tools?: string[]}, equipment?: {items?: string[], trinket?: string}}} updates
 * @returns {Character|null}
 */
async function updateCharacterData(pb, id, updates) {
  return await pb.collection("characters").update(id, updates);
}

/**
 * Append a typed condition record with a unique 5-character ID.
 * @param {string} id
 * @param {{condition_name: string, intensity_level?: number}} condition
 * @returns {Character|null}
 */

async function addCondition(pb, id, { condition_name, intensity_level = 1 }) {
  const character = await findById(pb, id);
  if (!character) return null;
  const condition = {
    id: createShortId(),
    condition_name,
    intensity_level,
    applied_at: new Date().toISOString(),
  };
  return await pb.collection("characters").update(id, {
    conditions: [...character.conditions, condition],
  });
}

/**
 * Drop a condition using its ID to keep the list clean.
 * @param {string} charId
 * @param {string} conditionId
 * @returns {Character|null}
 */
async function removeCondition(pb, charId, conditionId) {
  const character = await findById(pb, charId);
  character.conditions = character.conditions.filter(
    (c) => c.id !== conditionId,
  );
  return await pb.collection("characters").update(charId, {
    conditions: character.conditions,
  });
}

/**
 * Permanently remove a character from the in-memory list.
 * @param {string} charId
 * @returns {boolean} true if found and removed, false if not found
 */
async function removeCharacter(pb, charId) {
  const character = await findById(pb, charId);
  if (!character) return false;
  await pb.collection("characters").delete(charId);
  return true;
}

/**
 * Update a resource's pool_current while respecting its bounds.
 * @param {string} charId
 * @param {string} resourceId
 * @param {number} pool_current
 * @returns {Resource|null}
 */
async function updateResource(pb, charId, resourceId, pool_current) {
  const character = await findById(pb, charId);
  if (!character) return null;
  const resource = character.resources.find((r) => r.id === resourceId);
  if (!resource) return null;
  resource.pool_current = Math.max(
    0,
    Math.min(pool_current, resource.pool_max),
  );
  return await pb.collection("characters").update(charId, {
    resources: character.resources,
  });
}

/**
 * Refill the appropriate resource pools based on the rest type.
 * @param {string} charId
 * @param {"short"|"long"} restType
 * @returns {{character: Character, restored: string[]}|null}
 */
async function restoreResources(pb, charId, restType) {
  const character = await findById(pb, charId);
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
  const updated = await pb.collection("characters").update(charId, {
    resources: character.resources,
  });
  return { character: updated, restored };
}

// /**
//  * Create and append a new character with sensible defaults.
//  * @param {{name: string, player: string, hp_max: number, hp_current?: number, armor_class?: number, speed_walk?: number, photo?: string, class_primary?: {name?: string, level?: number, subclass?: string}, background?: {name?: string, feat?: string, skill_proficiencies?: string[], tool_proficiency?: string}, species?: {name?: string, size?: string, speed_walk?: number, traits?: string[]}, languages?: string[], alignment?: string, proficiencies?: {skills?: string[], saving_throws?: string[], armor?: string[], weapons?: string[], tools?: string[]}, equipment?: {items?: string[], trinket?: string}}} input
//  * @returns {Character}
//  */

async function createCharacter(pb, input) {
  return await pb.collection("characters").create(input);
}

module.exports = {
  getCharacterName,
  getAll,
  findById,
  updateHp,
  updatePhoto,
  updateCharacterData,
  addCondition,
  removeCondition,
  removeCharacter,
  updateResource,
  restoreResources,
  createCharacter,
};
