/**
 * character-form.js
 * =================
 * Shared utilities for CharacterCreationForm and CharacterProfileForm.
 * Centralises option parsing, label lookup, payload building, and form
 * initialisation so both forms can stay thin and in sync.
 */

/**
 * Parse raw characterOptions JSON into named arrays consumed by both forms.
 * @param {Record<string, Array<{key: string, label: string}>>} characterOptions
 */
export function parseOptionSets(characterOptions) {
  const opts = characterOptions || {};
  return {
    classOptions: opts.classes || [],
    subclassOptions: opts.subclasses || [],
    backgroundOptions: opts.backgrounds || [],
    featOptions: opts.feats || [],
    speciesOptions: opts.species || [],
    sizeOptions: opts.sizes || [],
    languageOptions: opts.languages || [],
    rareLanguageOptions: opts.rare_languages || [],
    alignmentOptions: opts.alignments || [],
    skillOptions: opts.skills || [],
    toolOptions: opts.tools || [],
    armorOptions: opts.armor_proficiencies || [],
    weaponOptions: opts.weapon_proficiencies || [],
    itemOptions: opts.items || [],
    trinketOptions: opts.trinkets || [],
  };
}

/**
 * Build a Map<key, label> covering language, proficiency, and equipment
 * option categories — used to resolve pill labels in MultiSelect previews.
 * @param {ReturnType<typeof parseOptionSets>} optionSets
 * @returns {Map<string, string>}
 */
export function buildLabelMap(optionSets) {
  const {
    languageOptions,
    rareLanguageOptions,
    skillOptions,
    toolOptions,
    armorOptions,
    weaponOptions,
    itemOptions,
  } = optionSets;

  const labelOf = new Map(
    /** @type {[string, string][]} */ (
      [
        ...(languageOptions || []),
        ...(rareLanguageOptions || []),
        ...(skillOptions || []),
        ...(toolOptions || []),
        ...(armorOptions || []),
        ...(weaponOptions || []),
        ...(itemOptions || []),
      ]
        .filter((opt) => opt && opt.key != null && opt.label != null)
        .map((opt) => [String(opt.key).trim(), String(opt.label).trim()])
        .filter(([k, v]) => k.length > 0 && v.length > 0)
    ),
  );

  return labelOf;
}

/**
 * Normalize multi-select arrays into trimmed, non-empty key strings.
 * Prevents empty strings from reaching the API payload.
 * @param {string[] | undefined | null} values
 * @returns {string[]}
 */
export function normalizeSelection(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
}

/**
 * Build the nested API payload from flat form field values.
 * Matches the shape expected by POST /api/characters and PUT /api/characters/:id.
 *
 * @param {{
 *   name: string, player: string,
 *   hpMax: number|string, armorClass: number|string, speedWalk: number|string,
 *   classPrimary: string, classSubclass: string, classLevel: number|string,
 *   backgroundName: string, backgroundFeat: string,
 *   speciesName: string, speciesSize: string,
 *   alignment: string,
 *   languages: string[], rareLanguages: string[],
 *   skills: string[], tools: string[],
 *   armor: string[], weapons: string[],
 *   items: string[], trinket: string,
 * }} fields
 */
export function buildCharacterPayload(fields) {
  const {
    name,
    player,
    hpMax,
    armorClass,
    speedWalk,
    classPrimary,
    classSubclass,
    classLevel,
    backgroundName,
    backgroundFeat,
    speciesName,
    speciesSize,
    alignment,
    languages,
    rareLanguages,
    skills,
    tools,
    armor,
    weapons,
    items,
    trinket,
  } = fields;

  const levelVal = Number(classLevel);
  const speedVal = Number(speedWalk);
  const acVal = Number(armorClass);

  const normalSkills = normalizeSelection(skills);
  const normalTools = normalizeSelection(tools);
  const normalArmor = normalizeSelection(armor);
  const normalWeapons = normalizeSelection(weapons);
  const normalItems = normalizeSelection(items);
  const normalLanguages = normalizeSelection(languages);
  const normalRareLanguages = normalizeSelection(rareLanguages);

  return {
    name: String(name ?? "").trim(),
    player: String(player ?? "").trim(),
    hp_max: Number(hpMax),
    armor_class: Number.isFinite(acVal) ? acVal : 0,
    speed_walk: Number.isFinite(speedVal) ? speedVal : 0,
    class_primary: {
      name: String(classPrimary ?? ""),
      level: Number.isFinite(levelVal) ? levelVal : 1,
      subclass: String(classSubclass ?? ""),
    },
    background: {
      name: String(backgroundName ?? ""),
      feat: String(backgroundFeat ?? ""),
      skill_proficiencies: normalSkills,
      tool_proficiency: normalTools[0] || "",
    },
    species: {
      name: String(speciesName ?? ""),
      size: String(speciesSize ?? ""),
      speed_walk: Number.isFinite(speedVal) ? speedVal : 0,
      traits: [],
    },
    languages: [...normalLanguages, ...normalRareLanguages],
    alignment: String(alignment ?? ""),
    proficiencies: {
      skills: normalSkills,
      saving_throws: [],
      armor: normalArmor,
      weapons: normalWeapons,
      tools: normalTools,
    },
    equipment: {
      items: normalItems,
      coins: { gp: 0, sp: 0, cp: 0 },
      trinket: String(trinket ?? ""),
    },
  };
}

/**
 * Default form values for character creation mode (all fields blank/zero).
 * @returns {ReturnType<typeof getFormValuesFromCharacter>}
 */
export function getDefaultFormValues() {
  return {
    name: "",
    player: "",
    hpMax: 30,
    armorClass: 10,
    speedWalk: 30,
    classPrimary: "",
    classSubclass: "",
    classLevel: 1,
    backgroundName: "",
    backgroundFeat: "",
    speciesName: "",
    speciesSize: "",
    alignment: "",
    languages: [],
    rareLanguages: [],
    skills: [],
    tools: [],
    armor: [],
    weapons: [],
    items: [],
    trinket: "",
  };
}

/**
 * Derive form initial values from an existing character object (edit mode).
 * Splits languages into base/rare using the provided rare-language key set.
 *
 * @param {Record<string, any>} character
 * @param {Set<string> | string[]} rareLanguageKeys
 */
export function getFormValuesFromCharacter(character, rareLanguageKeys) {
  const classPrimary = character.class_primary || {};
  const background = character.background || {};
  const species = character.species || {};
  const proficiencies = character.proficiencies || {};
  const equipment = character.equipment || {};
  const allLanguages = Array.isArray(character.languages)
    ? character.languages
    : [];

  const rareKeys =
    rareLanguageKeys instanceof Set
      ? rareLanguageKeys
      : new Set(rareLanguageKeys || []);

  const baseLanguages = [];
  const rareLanguages = [];
  for (const lang of allLanguages) {
    if (rareKeys.has(lang)) rareLanguages.push(lang);
    else baseLanguages.push(lang);
  }

  const backgroundTools = background.tool_proficiency
    ? [background.tool_proficiency]
    : [];

  return {
    name: character.name || "",
    player: character.player || "",
    hpMax: character.hp_max || "",
    armorClass: character.armor_class ?? "",
    speedWalk: character.speed_walk ?? "",
    classPrimary: classPrimary.name || "",
    classSubclass: classPrimary.subclass || "",
    classLevel: classPrimary.level || 1,
    backgroundName: background.name || "",
    backgroundFeat: background.feat || "",
    speciesName: species.name || "",
    speciesSize: species.size || "",
    alignment: character.alignment || "",
    languages: baseLanguages,
    rareLanguages,
    skills: proficiencies.skills || background.skill_proficiencies || [],
    tools: proficiencies.tools || backgroundTools,
    armor: proficiencies.armor || [],
    weapons: proficiencies.weapons || [],
    items: equipment.items || [],
    trinket: equipment.trinket || "",
  };
}
