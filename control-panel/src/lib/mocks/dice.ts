/**
 * Dice roll fixture data for Storybook stories and Vitest tests.
 *
 * Shape matches the `dice_rolled` Socket.io event payload (SOCKET-EVENTS.md):
 *   { id, charId, characterName, result, modifier, rollResult, sides, timestamp }
 *
 * Also matches the OverlayDice `preview` prop shape.
 * For quick overlay stories, import directly from overlays.ts (dice_roll_nat20 etc.)
 */

/** Natural 20 — critical success, full result with bonus */
export const roll_nat20_d20 = Object.freeze({
  id: 'roll_001',
  charId: 'CH101',
  characterName: 'Kael',
  result: 20,
  sides: 20,
  modifier: 5,   // STR 18 → +4 mod; proficiency +2 at lv 7 → total +5 for athletics check
  rollResult: 25,
  timestamp: '2026-03-24T21:00:00.000Z',
});

/** Natural 1 — critical failure */
export const roll_nat1_d20 = Object.freeze({
  id: 'roll_002',
  charId: 'CH102',
  characterName: 'Lyra',
  result: 1,
  sides: 20,
  modifier: 6,   // DEX 18 → +4 mod; expertise in stealth → +8 total, +4 here (simplified)
  rollResult: 1, // Nat 1 auto-fails regardless of modifier for attack rolls
  timestamp: '2026-03-24T21:05:00.000Z',
});

/** Normal d20 — mid-range result with modifier */
export const roll_normal_d20 = Object.freeze({
  id: 'roll_003',
  charId: 'CH103',
  characterName: 'Brum',
  result: 14,
  sides: 20,
  modifier: 6,   // INT 18 → +4 mod; proficiency +2 at lv 5 for arcana → +6
  rollResult: 20,
  timestamp: '2026-03-24T21:10:00.000Z',
});

/** d8 damage roll (melee weapon) */
export const roll_d8_damage = Object.freeze({
  id: 'roll_004',
  charId: 'CH101',
  characterName: 'Kael',
  result: 7,
  sides: 8,
  modifier: 4,   // STR 18 → +4 to damage
  rollResult: 11,
  timestamp: '2026-03-24T21:12:00.000Z',
});

/** d6 damage roll (off-hand weapon / cantrip / falling) */
export const roll_d6_damage = Object.freeze({
  id: 'roll_005',
  charId: 'CH104',
  characterName: 'Zara',
  result: 4,
  sides: 6,
  modifier: 0,
  rollResult: 4,
  timestamp: '2026-03-24T21:14:00.000Z',
});

/** d4 healing roll (minimum heal / cure wounds low slot) */
export const roll_d4_heal = Object.freeze({
  id: 'roll_006',
  charId: 'CH104',
  characterName: 'Zara',
  result: 3,
  sides: 4,
  modifier: 4,   // WIS 18 → +4 to cure wounds
  rollResult: 7,
  timestamp: '2026-03-24T21:16:00.000Z',
});

/** d12 damage roll (Barbarian greataxe) — included for die-type coverage */
export const roll_d12_greataxe = Object.freeze({
  id: 'roll_007',
  charId: 'CH101',
  characterName: 'Kael',
  result: 11,
  sides: 12,
  modifier: 4,
  rollResult: 15,
  timestamp: '2026-03-24T21:18:00.000Z',
});
