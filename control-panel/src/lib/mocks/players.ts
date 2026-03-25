/**
 * Player character fixture data for Storybook stories and Vitest tests.
 *
 * Shape: wire-format runtime view-model consumed by PlayerSheet, CharacterCard,
 * SessionCard, OverlayHP, and OverlayConditions. NOT the PocketBase record shape.
 *
 * Fixtures are immutable — Object.freeze() prevents accidental mutation in stories.
 * Clone before mutating: const mutable = { ...player_sheet_kael, hp_current: 0 }
 *
 * Characters:
 *   CH101  Kael Stoneblade  — Human Fighter 7   (player: Mara)
 *   CH102  Lyra Nightwhisper — Elf Rogue 5       (player: Nico)
 *   CH103  Brum Ironfist    — Gnome Wizard 5    (player: Iris)
 *   CH104  Zara Brightflame — Half-Elf Cleric 5  (player: Dev)
 */

// ── Default: healthy Fighter ────────────────────────────────────────────────

export const player_sheet_kael = Object.freeze({
  id: 'CH101',
  name: 'Kael Stoneblade',
  player: 'Mara',
  hp_current: 38,
  hp_max: 45,
  hp_temp: 5,
  armor_class: 18,
  speed_walk: 30,
  photo: null,
  alignment: 'lg',
  class_primary: { name: 'Guerrero', level: 7 },
  species: { name: 'humano', speed_walk: 30, traits: ['extra_language', 'extra_skill', 'versatile'] },
  ability_scores: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 8 },
  proficiencies: {
    saving_throws: ['str', 'con'],
    skills: ['athletics', 'intimidation', 'perception', 'history'],
    armor: ['light_armor', 'medium_armor', 'heavy_armor', 'shields'],
    weapons: ['simple_weapons', 'martial_weapons'],
    tools: ['playing_cards'],
  },
  conditions: [
    { id: 'cond1', condition_name: 'Envenenado', intensity_level: 1 },
  ],
  resources: [
    { id: 'r1', name: 'Action Surge', pool_current: 1, pool_max: 1, recharge: 'SHORT_REST' },
    { id: 'r2', name: 'Second Wind', pool_current: 0, pool_max: 1, recharge: 'SHORT_REST' },
  ],
  equipment: {
    items: ['chain_mail', 'longsword', 'shield', 'handaxe', 'explorer_pack'],
    coins: { gp: 25, sp: 14, cp: 8 },
  },
  languages: ['comun', 'elfico', 'enano'],
  notes: {
    personality: 'I can stare down a hell hound without flinching.',
    ideals: 'Might makes right. The strong must protect the weak.',
    bonds: "I fight for my home village of Farrow's End.",
    flaws: 'I have little respect for anyone who is not a proven warrior.',
  },
});

// ── Edge case 1: wounded Rogue (44% HP) ──────────────────────────────────────

export const player_sheet_lyra = Object.freeze({
  id: 'CH102',
  name: 'Lyra Nightwhisper',
  player: 'Nico',
  hp_current: 14,
  hp_max: 32,
  hp_temp: 0,
  armor_class: 15,
  speed_walk: 35,
  photo: null,
  alignment: 'cn',
  class_primary: { name: 'Pícaro', level: 5 },
  species: { name: 'elfo', speed_walk: 35, traits: ['darkvision', 'fey_ancestry', 'trance', 'keen_senses'] },
  ability_scores: { str: 8, dex: 18, con: 12, int: 14, wis: 13, cha: 16 },
  proficiencies: {
    saving_throws: ['dex', 'int'],
    skills: ['acrobatics', 'deception', 'perception', 'sleight_of_hand', 'stealth'],
    armor: ['light_armor'],
    weapons: ['simple_weapons', 'hand_crossbows', 'longswords', 'rapiers', 'shortswords'],
    tools: ['thieves_tools'],
  },
  conditions: [],
  resources: [
    { id: 'r7', name: 'Sneak Attack', pool_current: 1, pool_max: 1, recharge: 'TURN' },
    { id: 'r8', name: 'Uncanny Dodge', pool_current: 1, pool_max: 1, recharge: 'TURN' },
  ],
  equipment: {
    items: ['leather_armor', 'rapier', 'shortbow', 'thieves_tools', 'burglar_pack'],
    coins: { gp: 62, sp: 0, cp: 0 },
  },
  languages: ['comun', 'elfico'],
  notes: {
    personality: 'I always have a plan for what to do when things go wrong.',
    ideals: 'Freedom. Chains are meant to be broken.',
    bonds: '',
    flaws: '',
  },
});

// ── Edge case 2: critical HP + many conditions (Wizard) ──────────────────────

export const player_sheet_brum = Object.freeze({
  id: 'CH103',
  name: 'Brum Ironfist',
  player: 'Iris',
  hp_current: 2,
  hp_max: 28,
  hp_temp: 0,
  armor_class: 13,
  speed_walk: 25,
  photo: null,
  alignment: 'cg',
  class_primary: { name: 'Mago', level: 5 },
  species: { name: 'gnomo', speed_walk: 25, traits: ['gnome_cunning', 'darkvision', 'artificers_lore'] },
  ability_scores: { str: 8, dex: 10, con: 12, int: 18, wis: 15, cha: 10 },
  proficiencies: {
    saving_throws: ['int', 'wis'],
    skills: ['arcana', 'history', 'investigation', 'medicine'],
    armor: [],
    weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light_crossbows'],
    tools: [],
  },
  conditions: [
    { id: 'c1', condition_name: 'Aturdido', intensity_level: null },
    { id: 'c2', condition_name: 'Asustado', intensity_level: 2 },
    { id: 'c3', condition_name: 'Concentracion', intensity_level: null },
  ],
  resources: [
    { id: 'r3', name: 'Slots Nv.1', pool_current: 0, pool_max: 4, recharge: 'LONG_REST' },
    { id: 'r4', name: 'Slots Nv.2', pool_current: 1, pool_max: 3, recharge: 'LONG_REST' },
    { id: 'r5', name: 'Slots Nv.3', pool_current: 0, pool_max: 2, recharge: 'LONG_REST' },
    { id: 'r6', name: 'Arcane Recovery', pool_current: 0, pool_max: 1, recharge: 'LONG_REST' },
  ],
  equipment: {
    items: ['spellbook', 'dagger', 'component_pouch', 'scholar_pack'],
    coins: { gp: 4, sp: 0, cp: 3 },
  },
  languages: ['comun', 'gnomish', 'sylvan'],
  notes: {
    personality: "There's nothing I like more than a good mystery.",
    ideals: '',
    bonds: '',
    flaws: 'I overlook obvious solutions in favor of complicated ones.',
  },
});

// ── Default: full health Cleric ───────────────────────────────────────────────

export const player_sheet_zara = Object.freeze({
  id: 'CH104',
  name: 'Zara Brightflame',
  player: 'Dev',
  hp_current: 32,
  hp_max: 32,
  hp_temp: 0,
  armor_class: 16,
  speed_walk: 30,
  photo: null,
  alignment: 'ng',
  class_primary: { name: 'Clérigo', level: 5 },
  species: { name: 'semielfo', speed_walk: 30, traits: ['darkvision', 'fey_ancestry', 'skill_versatility'] },
  ability_scores: { str: 10, dex: 12, con: 14, int: 13, wis: 18, cha: 15 },
  proficiencies: {
    saving_throws: ['wis', 'cha'],
    skills: ['insight', 'medicine', 'persuasion', 'religion'],
    armor: ['light_armor', 'medium_armor', 'shields'],
    weapons: ['simple_weapons'],
    tools: ['herbalism_kit'],
  },
  conditions: [],
  resources: [
    { id: 'r9',  name: 'Slots Nv.1', pool_current: 4, pool_max: 4, recharge: 'LONG_REST' },
    { id: 'r10', name: 'Slots Nv.2', pool_current: 3, pool_max: 3, recharge: 'LONG_REST' },
    { id: 'r11', name: 'Slots Nv.3', pool_current: 2, pool_max: 2, recharge: 'LONG_REST' },
    { id: 'r12', name: 'Channel Divinity', pool_current: 1, pool_max: 1, recharge: 'SHORT_REST' },
  ],
  equipment: {
    items: ['scale_mail', 'shield', 'mace', 'holy_symbol', 'priest_pack'],
    coins: { gp: 15, sp: 6, cp: 0 },
  },
  languages: ['comun', 'elfico', 'celestial'],
  notes: {
    personality: 'I see omens in every event and action.',
    ideals: 'Charity. I always help those in need, no matter what.',
    bonds: 'I will do anything to protect the temple where I served.',
    flaws: 'My piety sometimes leads me to blindly trust those who profess faith in my god.',
  },
});

// ── Edge case: 0 HP / unconscious ────────────────────────────────────────────

export const player_sheet_down = Object.freeze({
  id: 'CH101',
  name: 'Kael Stoneblade',
  player: 'Mara',
  hp_current: 0,
  hp_max: 45,
  hp_temp: 0,
  armor_class: 18,
  speed_walk: 30,
  photo: null,
  alignment: 'lg',
  class_primary: { name: 'Guerrero', level: 7 },
  species: { name: 'humano', speed_walk: 30, traits: ['extra_language', 'extra_skill', 'versatile'] },
  ability_scores: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 8 },
  proficiencies: {
    saving_throws: ['str', 'con'],
    skills: ['athletics', 'intimidation'],
    armor: ['light_armor', 'medium_armor', 'heavy_armor', 'shields'],
    weapons: ['simple_weapons', 'martial_weapons'],
    tools: [],
  },
  conditions: [
    { id: 'cond_down', condition_name: 'Inconsciente', intensity_level: null },
  ],
  resources: [
    { id: 'r1', name: 'Action Surge', pool_current: 0, pool_max: 1, recharge: 'SHORT_REST' },
    { id: 'r2', name: 'Second Wind', pool_current: 0, pool_max: 1, recharge: 'SHORT_REST' },
  ],
  equipment: {
    items: ['chain_mail', 'longsword', 'shield'],
    coins: { gp: 25, sp: 14, cp: 8 },
  },
  languages: ['comun', 'elfico'],
  notes: { personality: '', ideals: '', bonds: '', flaws: '' },
});

// ── Stress case: 5 conditions ─────────────────────────────────────────────────

export const player_sheet_many_conditions = Object.freeze({
  id: 'CH103',
  name: 'Brum Ironfist',
  player: 'Iris',
  hp_current: 2,
  hp_max: 28,
  hp_temp: 0,
  armor_class: 13,
  speed_walk: 0,
  photo: null,
  alignment: 'cg',
  class_primary: { name: 'Mago', level: 5 },
  species: { name: 'gnomo', speed_walk: 25, traits: ['gnome_cunning', 'darkvision'] },
  ability_scores: { str: 8, dex: 10, con: 12, int: 18, wis: 15, cha: 10 },
  proficiencies: {
    saving_throws: ['int', 'wis'],
    skills: ['arcana', 'history'],
    armor: [],
    weapons: ['daggers', 'quarterstaffs'],
    tools: [],
  },
  conditions: [
    { id: 'mc1', condition_name: 'Envenenado',     intensity_level: 1 },
    { id: 'mc2', condition_name: 'Aturdido',        intensity_level: null },
    { id: 'mc3', condition_name: 'Asustado',        intensity_level: 2 },
    { id: 'mc4', condition_name: 'Concentracion',   intensity_level: null },
    { id: 'mc5', condition_name: 'Paralizado',      intensity_level: null },
  ],
  resources: [
    { id: 'r3', name: 'Slots Nv.1', pool_current: 0, pool_max: 4, recharge: 'LONG_REST' },
  ],
  equipment: {
    items: ['spellbook', 'dagger'],
    coins: { gp: 4, sp: 0, cp: 3 },
  },
  languages: ['comun', 'gnomish'],
  notes: { personality: '', ideals: '', bonds: '', flaws: '' },
});

// ── Convenience: full party array (used by stage/overlay stories) ─────────────

export const party_roster = Object.freeze([
  player_sheet_kael,
  player_sheet_lyra,
  player_sheet_brum,
  player_sheet_zara,
]);
