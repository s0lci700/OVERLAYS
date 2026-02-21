const { randomUUID } = require("crypto");

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
 * @property {string} id             - UUID assigned on creation
 * @property {string} condition_name - Display name (e.g. "Poisoned")
 * @property {number} intensity_level - Severity (default 1)
 * @property {string} applied_at     - ISO 8601 timestamp
 */

/**
 * @typedef {Object} Resource
 * @property {string} id           - Unique ID within the character (e.g. "r1")
 * @property {string} name         - Display name (e.g. "RAGE", "KI")
 * @property {number} pool_max     - Maximum uses
 * @property {number} pool_current - Remaining uses
 * @property {"SHORT_REST"|"LONG_REST"|"TURN"|"DM"} recharge - When the resource refills
 */

/**
 * @typedef {Object} Character
 * @property {string}        id             - Stable identifier (e.g. "char1")
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
 */

// test characters - will be replaced by DB in the future
/**
 * Simple in-memory character fixtures plus helper functions used by the API.
 * Five Level-5 D&D 5e characters covering the main archetypes:
 *   char1 – Barbarian, char2 – Monk/Rogue, char3 – Fighter,
 *   char4 – Wizard,    char5 – Cleric
 */
const characters = [
  {
    id: "char1",
    name: "El verdadero",
    player: "Lucas",
    class: "Barbarian",
    level: 5,
    hp_current: 28,
    hp_max: 52,
    hp_temp: 0,
    armor_class: 17,
    speed_walk: 30,
    ability_scores: { str: 17, dex: 14, con: 16, int: 10, wis: 13, cha: 10 },
    conditions: [],
    resources: [
      {
        id: "r1",
        name: "RAGE",
        pool_max: 3,
        pool_current: 3,
        recharge: "LONG_REST",
      },
      {
        id: "r2",
        name: "INSPIRACIÓN",
        pool_max: 1,
        pool_current: 0,
        recharge: "DM",
      },
    ],
  },
  {
    id: "char2",
    name: "B12",
    player: "Sol",
    class: "Monk",
    level: 5,
    hp_current: 30,
    hp_max: 38,
    hp_temp: 0,
    armor_class: 16,
    speed_walk: 45,
    ability_scores: { str: 12, dex: 18, con: 13, int: 11, wis: 16, cha: 10 },
    conditions: [],
    resources: [
      {
        id: "r3",
        name: "KI",
        pool_max: 5,
        pool_current: 5,
        recharge: "SHORT_REST",
      },
      {
        id: "r4",
        name: "STUNNING STRIKE",
        pool_max: 1,
        pool_current: 1,
        recharge: "TURN",
      },
    ],
  },
  {
    id: "char3",
    name: "Thornwick",
    player: "Pablo",
    class: "Fighter",
    level: 5,
    hp_current: 44,
    hp_max: 44,
    hp_temp: 0,
    armor_class: 18,
    speed_walk: 30,
    ability_scores: { str: 17, dex: 10, con: 14, int: 12, wis: 12, cha: 10 },
    conditions: [],
    resources: [
      {
        id: "r5",
        name: "ACTION SURGE",
        pool_max: 1,
        pool_current: 1,
        recharge: "SHORT_REST",
      },
      {
        id: "r6",
        name: "SECOND WIND",
        pool_max: 1,
        pool_current: 1,
        recharge: "SHORT_REST",
      },
    ],
  },
  {
    id: "char4",
    name: "Aelindra",
    player: "María",
    class: "Wizard",
    level: 5,
    hp_current: 27,
    hp_max: 27,
    hp_temp: 0,
    armor_class: 12,
    speed_walk: 30,
    ability_scores: { str: 8, dex: 14, con: 13, int: 17, wis: 12, cha: 11 },
    conditions: [],
    resources: [
      {
        id: "r7",
        name: "SPELL SLOT 1",
        pool_max: 4,
        pool_current: 4,
        recharge: "LONG_REST",
      },
      {
        id: "r8",
        name: "SPELL SLOT 2",
        pool_max: 3,
        pool_current: 3,
        recharge: "LONG_REST",
      },
      {
        id: "r9",
        name: "SPELL SLOT 3",
        pool_max: 2,
        pool_current: 2,
        recharge: "LONG_REST",
      },
      {
        id: "r10",
        name: "ARCANE RECOVERY",
        pool_max: 1,
        pool_current: 1,
        recharge: "LONG_REST",
      },
    ],
  },
  {
    id: "char5",
    name: "Brother Cedric",
    player: "Tomás",
    class: "Cleric",
    level: 5,
    hp_current: 38,
    hp_max: 38,
    hp_temp: 0,
    armor_class: 17,
    speed_walk: 30,
    ability_scores: { str: 14, dex: 10, con: 14, int: 13, wis: 17, cha: 14 },
    conditions: [],
    resources: [
      {
        id: "r11",
        name: "CHANNEL DIVINITY",
        pool_max: 2,
        pool_current: 2,
        recharge: "SHORT_REST",
      },
      {
        id: "r12",
        name: "SPELL SLOT 1",
        pool_max: 4,
        pool_current: 4,
        recharge: "LONG_REST",
      },
      {
        id: "r13",
        name: "SPELL SLOT 2",
        pool_max: 3,
        pool_current: 3,
        recharge: "LONG_REST",
      },
      {
        id: "r14",
        name: "SPELL SLOT 3",
        pool_max: 2,
        pool_current: 2,
        recharge: "LONG_REST",
      },
    ],
  },
];

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
 * Append a typed condition record with a unique UUID.
 * @param {string} id
 * @param {{condition_name: string, intensity_level?: number}} condition
 * @returns {Character|null}
 */
function addCondition(id, { condition_name, intensity_level = 1 }) {
  const character = findById(id);
  if (!character) return null;
  const condition = {
    id: randomUUID(),
    condition_name,
    intensity_level,
    applied_at: new Date().toISOString(),
  };
  character.conditions.push(condition);
  return character;
}

/**
 * Drop a condition using its UUID to keep the list clean.
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
};
