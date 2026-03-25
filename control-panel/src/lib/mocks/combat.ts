/**
 * Combat state fixture data for Storybook stories and Vitest tests.
 *
 * Shapes consumed by:
 *   - InitiativeStrip (combatants array + inCombat/activeIndex/round props)
 *   - OverlayTurnOrder (mockEncounter: { participants, currentTurnIndex, round })
 *   - cast.ts CombatState interface
 *
 * Enemies use 'e1'/'e2' IDs; players use 'CH10x' IDs consistent with players.ts.
 */

// ── Default: active mid-encounter (Round 2, Goblin A's turn) ─────────────────

export const combat_state = Object.freeze({
  combatActive: true,
  roundNumber: 2,
  initiativeOrder: ['CH101', 'e1', 'CH102', 'e2', 'CH104', 'CH103'],
  activeIndex: 1,
  activeCombatantId: 'e1',
});

// ── Edge case 1: no combat / pre-session ──────────────────────────────────────

export const combat_state_inactive = Object.freeze({
  combatActive: false,
  roundNumber: 0,
  initiativeOrder: [],
  activeIndex: 0,
  activeCombatantId: '',
});

// ── Edge case 2: first round, players haven't acted yet ───────────────────────

export const combat_state_round_1 = Object.freeze({
  combatActive: true,
  roundNumber: 1,
  initiativeOrder: ['CH101', 'CH104', 'e1', 'CH102', 'CH103', 'e2'],
  activeIndex: 0,
  activeCombatantId: 'CH101',
});

// ── Combatant list: enriched objects for InitiativeStrip + OverlayTurnOrder ───
//    Sorted by initiative (descending).

export const combat_participants = Object.freeze([
  { id: 'CH101', name: 'Kael',     initiative: 18, hp_current: 38, hp_max: 45, isPlayer: true,  photo: null },
  { id: 'e1',    name: 'Goblin A', initiative: 14, hp_current: 7,  hp_max: 7,  isPlayer: false, photo: null },
  { id: 'CH102', name: 'Lyra',     initiative: 12, hp_current: 14, hp_max: 32, isPlayer: true,  photo: null },
  { id: 'e2',    name: 'Goblin B', initiative: 9,  hp_current: 3,  hp_max: 7,  isPlayer: false, photo: null },
  { id: 'CH104', name: 'Zara',     initiative: 8,  hp_current: 32, hp_max: 32, isPlayer: true,  photo: null },
  { id: 'CH103', name: 'Brum',     initiative: 6,  hp_current: 2,  hp_max: 28, isPlayer: true,  photo: null },
]);

// ── encounter_state shapes (used by OverlayTurnOrder mockEncounter prop) ──────

export const encounter_active = Object.freeze({
  participants: [
    { id: 'CH101', name: 'Kael',     initiative: 18, hp_current: 38, hp_max: 45, isPlayer: true,  photo: null },
    { id: 'e1',    name: 'Goblin A', initiative: 14, hp_current: 7,  hp_max: 7,  isPlayer: false, photo: null },
    { id: 'CH102', name: 'Lyra',     initiative: 12, hp_current: 14, hp_max: 32, isPlayer: true,  photo: null },
    { id: 'e2',    name: 'Goblin B', initiative: 9,  hp_current: 3,  hp_max: 7,  isPlayer: false, photo: null },
  ],
  currentTurnIndex: 1,
  round: 2,
});

export const encounter_empty = Object.freeze({
  participants: [],
  currentTurnIndex: 0,
  round: 0,
});

// ── DM initiative-roll records (used by InitiativeStrip combatants prop) ─────
//    charId matches player IDs; roll = raw d20; initiative = roll + dex mod.

export const initiative_rolls = Object.freeze([
  { charId: 'CH101', roll: 16, initiative: 18 },
  { charId: 'CH102', roll: 8,  initiative: 12 },
  { charId: 'CH103', roll: 4,  initiative: 6  },
  { charId: 'CH104', roll: 6,  initiative: 8  },
]);
