const { createShortId } = require("./id");
const { ensureCharactersPhotos } = require("./photos");

const DEFAULT_TEMPLATE_NAME = "template-characters";

function getTemplateBaseName(templateName) {
  const cleaned = String(templateName || DEFAULT_TEMPLATE_NAME)
    .trim()
    .replace(/\.(js|json)$/i, "");
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
    return DEFAULT_TEMPLATE_NAME;
  }
  return cleaned;
}

function loadCharacterTemplate() {
  const requestedTemplate = process.env.CHARACTERS_TEMPLATE;
  const templateBaseName = getTemplateBaseName(requestedTemplate);

  const tryLoad = (baseName) => {
    const extensions = [".json", ".js"];
    for (const ext of extensions) {
      try {
        return require(`./${baseName}${ext}`);
      } catch (error) {
        if (error.code && error.code !== "MODULE_NOT_FOUND") {
          console.warn(
            `[characters] Failed to load template "${baseName}${ext}": ${error.message}`,
          );
        }
      }
    }
    return null;
  };

  try {
    const loaded = tryLoad(templateBaseName);
    if (loaded) return loaded;
    throw new Error("template not found");
  } catch (error) {
    if (templateBaseName !== DEFAULT_TEMPLATE_NAME) {
      console.warn(
        `[characters] Failed to load template "${templateBaseName}". Falling back to "${DEFAULT_TEMPLATE_NAME}".`,
      );
    }
    const fallback = tryLoad(DEFAULT_TEMPLATE_NAME);
    if (fallback) return fallback;
    throw error;
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
 * Update a character photo URL or data URI.
 * @param {string} id
 * @param {string} photo
 * @returns {Character|null}
 */
function updatePhoto(id, photo) {
  const character = findById(id);
  if (!character) return null;
  character.photo = typeof photo === "string" ? photo.trim() : "";
  ensureCharactersPhotos([character]);
  return character;
}

/**
 * Update editable character fields while preserving data integrity.
 * @param {string} id
 * @param {{name?: string, player?: string, hp_max?: number, hp_current?: number, armor_class?: number, speed_walk?: number, class_primary?: {name?: string, level?: number, subclass?: string}, background?: {name?: string, feat?: string, skill_proficiencies?: string[], tool_proficiency?: string}, species?: {name?: string, size?: string, speed_walk?: number, traits?: string[]}, languages?: string[], alignment?: string, proficiencies?: {skills?: string[], saving_throws?: string[], armor?: string[], weapons?: string[], tools?: string[]}, equipment?: {items?: string[], trinket?: string}}} updates
 * @returns {Character|null}
 */
function updateCharacterData(id, updates) {
  const character = findById(id);
  if (!character) return null;

  const pickText = (value, fallback) => {
    if (value === undefined) return fallback;
    if (typeof value === "string") return value.trim();
    return fallback;
  };

  const pickList = (value, fallback) => {
    if (value === undefined) return fallback;
    if (!Array.isArray(value)) return fallback;
    return normalizeKeyList(value);
  };

  if (typeof updates.name === "string") {
    character.name = updates.name.trim();
  }

  if (typeof updates.player === "string") {
    character.player = updates.player.trim();
  }

  if (typeof updates.hp_max === "number" && Number.isFinite(updates.hp_max)) {
    character.hp_max = Math.max(1, Math.trunc(updates.hp_max));
  }

  if (
    typeof updates.hp_current === "number" &&
    Number.isFinite(updates.hp_current)
  ) {
    character.hp_current = Math.trunc(updates.hp_current);
  }

  if (
    typeof updates.armor_class === "number" &&
    Number.isFinite(updates.armor_class)
  ) {
    character.armor_class = Math.max(0, Math.trunc(updates.armor_class));
  }

  if (
    typeof updates.speed_walk === "number" &&
    Number.isFinite(updates.speed_walk)
  ) {
    character.speed_walk = Math.max(0, Math.trunc(updates.speed_walk));
  }

  if (updates.class_primary !== undefined) {
    const current = character.class_primary || {};
    const input =
      updates.class_primary && typeof updates.class_primary === "object"
        ? updates.class_primary
        : {};
    character.class_primary = {
      name: pickText(input.name, current.name || ""),
      level: Number.isFinite(input.level)
        ? Math.max(1, Math.trunc(input.level))
        : current.level || 1,
      subclass: pickText(input.subclass, current.subclass || ""),
    };
  }

  if (updates.background !== undefined) {
    const current = character.background || {};
    const input =
      updates.background && typeof updates.background === "object"
        ? updates.background
        : {};
    character.background = {
      name: pickText(input.name, current.name || ""),
      feat: pickText(input.feat, current.feat || ""),
      skill_proficiencies: pickList(
        input.skill_proficiencies,
        current.skill_proficiencies || [],
      ),
      tool_proficiency: pickText(
        input.tool_proficiency,
        current.tool_proficiency || "",
      ),
    };
  }

  if (updates.species !== undefined) {
    const current = character.species || {};
    const input =
      updates.species && typeof updates.species === "object"
        ? updates.species
        : {};
    const speedWalk = Number.isFinite(input.speed_walk)
      ? Math.max(0, Math.trunc(input.speed_walk))
      : current.speed_walk || 0;
    character.species = {
      name: pickText(input.name, current.name || ""),
      size: pickText(input.size, current.size || ""),
      speed_walk: speedWalk,
      traits: pickList(input.traits, current.traits || []),
    };
  }

  if (updates.languages !== undefined) {
    character.languages = normalizeKeyList(updates.languages);
  }

  if (updates.alignment !== undefined) {
    character.alignment = pickText(
      updates.alignment,
      character.alignment || "",
    );
  }

  if (updates.proficiencies !== undefined) {
    const current = character.proficiencies || {};
    const input =
      updates.proficiencies && typeof updates.proficiencies === "object"
        ? updates.proficiencies
        : {};
    character.proficiencies = {
      skills: pickList(input.skills, current.skills || []),
      saving_throws: pickList(input.saving_throws, current.saving_throws || []),
      armor: pickList(input.armor, current.armor || []),
      weapons: pickList(input.weapons, current.weapons || []),
      tools: pickList(input.tools, current.tools || []),
    };
  }

  if (updates.equipment !== undefined) {
    const current = character.equipment || {};
    const input =
      updates.equipment && typeof updates.equipment === "object"
        ? updates.equipment
        : {};
    character.equipment = {
      items: pickList(input.items, current.items || []),
      coins: current.coins || { gp: 0, sp: 0, cp: 0 },
      trinket: pickText(input.trinket, current.trinket || ""),
    };
  }

  character.hp_current = clamp(character.hp_current, character.hp_max);
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
 * @param {{name: string, player: string, hp_max: number, hp_current?: number, armor_class?: number, speed_walk?: number, photo?: string, class_primary?: {name?: string, level?: number, subclass?: string}, background?: {name?: string, feat?: string, skill_proficiencies?: string[], tool_proficiency?: string}, species?: {name?: string, size?: string, speed_walk?: number, traits?: string[]}, languages?: string[], alignment?: string, proficiencies?: {skills?: string[], saving_throws?: string[], armor?: string[], weapons?: string[], tools?: string[]}, equipment?: {items?: string[], trinket?: string}}} input
 * @returns {Character}
 */
function normalizeKeyList(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createCharacter(input) {
  const classInput =
    input.class_primary && typeof input.class_primary === "object"
      ? input.class_primary
      : {};
  const backgroundInput =
    input.background && typeof input.background === "object"
      ? input.background
      : {};
  const speciesInput =
    input.species && typeof input.species === "object" ? input.species : {};
  const proficienciesInput =
    input.proficiencies && typeof input.proficiencies === "object"
      ? input.proficiencies
      : {};
  const equipmentInput =
    input.equipment && typeof input.equipment === "object"
      ? input.equipment
      : {};

  const hpMax = Math.max(1, Math.trunc(input.hp_max));
  const hpCurrent =
    input.hp_current === undefined
      ? hpMax
      : clamp(Math.trunc(input.hp_current), hpMax);

  const backgroundSkills = normalizeKeyList(
    backgroundInput.skill_proficiencies,
  );
  const backgroundTool = normalizeText(backgroundInput.tool_proficiency);
  const skills = normalizeKeyList(proficienciesInput.skills);
  const tools = normalizeKeyList(proficienciesInput.tools);
  const normalizedSkills = skills.length > 0 ? skills : backgroundSkills;
  let normalizedTools = tools.length > 0 ? tools : [];
  if (normalizedTools.length === 0 && backgroundTool) {
    normalizedTools = [backgroundTool];
  }
  const speciesSpeed = Number.isFinite(speciesInput.speed_walk)
    ? Math.max(0, Math.trunc(speciesInput.speed_walk))
    : Math.max(0, Math.trunc(input.speed_walk ?? 30));

  const character = {
    id: createShortId(),
    name: input.name,
    player: input.player,
    class_primary: {
      name: normalizeText(classInput.name),
      level: Number.isFinite(classInput.level)
        ? Math.max(1, Math.trunc(classInput.level))
        : 1,
      subclass: normalizeText(classInput.subclass),
    },
    background: {
      name: normalizeText(backgroundInput.name),
      feat: normalizeText(backgroundInput.feat),
      skill_proficiencies: backgroundSkills,
      tool_proficiency: backgroundTool,
    },
    species: {
      name: normalizeText(speciesInput.name),
      size: normalizeText(speciesInput.size),
      speed_walk: speciesSpeed,
      traits: normalizeKeyList(speciesInput.traits),
    },
    languages: normalizeKeyList(input.languages),
    alignment: normalizeText(input.alignment),
    proficiencies: {
      skills: normalizedSkills,
      saving_throws: normalizeKeyList(proficienciesInput.saving_throws),
      armor: normalizeKeyList(proficienciesInput.armor),
      weapons: normalizeKeyList(proficienciesInput.weapons),
      tools: normalizedTools,
    },
    equipment: {
      items: normalizeKeyList(equipmentInput.items),
      coins: { gp: 0, sp: 0, cp: 0 },
      trinket: normalizeText(equipmentInput.trinket),
    },
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
  updatePhoto,
  updateCharacterData,
  addCondition,
  removeCondition,
  updateResource,
  restoreResources,
  createCharacter,
};
