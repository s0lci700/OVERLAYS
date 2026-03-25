/**
 * Stage surface fixture data for Storybook stories and Vitest tests.
 *
 * Shapes consumed by:
 *   - CharacterCard (hp_current, hp_max, conditions, resources, class_primary)
 *   - CharacterManagement (characters array)
 *   - DiceRoller (lastRoll)
 *
 * Uses the CharacterCard wire shape (not the full PlayerSheet shape).
 * For the full player shape, import from players.ts.
 */

// ── Default: full party, mixed states ────────────────────────────────────────

export const stage_characters = Object.freeze([
  {
    id: 'CH101',
    name: 'Kael',
    player: 'Mara',
    hp_current: 38,
    hp_max: 45,
    armor_class: 18,
    speed_walk: 30,
    photo: null,
    class_primary: { name: 'Guerrero', level: 7 },
    conditions: [{ id: 'c1', condition_name: 'Envenenado', intensity_level: 1 }],
    resources: [
      { id: 'r1', name: 'Action Surge', pool_current: 1, pool_max: 1, recharge: 'SHORT_REST' },
      { id: 'r2', name: 'Second Wind',  pool_current: 0, pool_max: 1, recharge: 'SHORT_REST' },
    ],
  },
  {
    id: 'CH102',
    name: 'Lyra',
    player: 'Nico',
    hp_current: 14,
    hp_max: 32,
    armor_class: 15,
    speed_walk: 35,
    photo: null,
    class_primary: { name: 'Pícaro', level: 5 },
    conditions: [],
    resources: [
      { id: 'r7', name: 'Sneak Attack',  pool_current: 1, pool_max: 1, recharge: 'TURN' },
      { id: 'r8', name: 'Uncanny Dodge', pool_current: 1, pool_max: 1, recharge: 'TURN' },
    ],
  },
  {
    id: 'CH103',
    name: 'Brum',
    player: 'Iris',
    hp_current: 2,
    hp_max: 28,
    armor_class: 13,
    speed_walk: 25,
    photo: null,
    class_primary: { name: 'Mago', level: 5 },
    conditions: [
      { id: 'c2', condition_name: 'Aturdido', intensity_level: null },
      { id: 'c3', condition_name: 'Asustado', intensity_level: 2 },
    ],
    resources: [
      { id: 'r3', name: 'Slots Nv.1', pool_current: 0, pool_max: 4, recharge: 'LONG_REST' },
      { id: 'r4', name: 'Slots Nv.2', pool_current: 1, pool_max: 3, recharge: 'LONG_REST' },
    ],
  },
  {
    id: 'CH104',
    name: 'Zara',
    player: 'Dev',
    hp_current: 32,
    hp_max: 32,
    armor_class: 16,
    speed_walk: 30,
    photo: null,
    class_primary: { name: 'Clérigo', level: 5 },
    conditions: [],
    resources: [
      { id: 'r9',  name: 'Slots Nv.1',       pool_current: 4, pool_max: 4, recharge: 'LONG_REST' },
      { id: 'r12', name: 'Channel Divinity',  pool_current: 1, pool_max: 1, recharge: 'SHORT_REST' },
    ],
  },
]);

// ── Edge case 1: partial party (2 of 4 characters) ───────────────────────────

export const stage_characters_partial = Object.freeze([
  stage_characters[0],
  stage_characters[1],
]);

// ── Edge case 2: empty roster ─────────────────────────────────────────────────

export const stage_characters_empty = Object.freeze([]);

// ── Last roll (DiceRoller lastRoll store shape) ───────────────────────────────

export const stage_last_roll = Object.freeze({
  id: 'roll_001',
  charId: 'CH101',
  characterName: 'Kael',
  result: 17,
  sides: 20,
  modifier: 5,
  rollResult: 22,
  timestamp: '2026-03-24T21:00:00.000Z',
});

export const stage_last_roll_none = null;
