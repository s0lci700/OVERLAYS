/**
 * DM panel fixture data for Storybook stories and Vitest tests.
 *
 * Shapes consumed by:
 *   - SessionCard (character prop — hp, conditions, class, resources)
 *   - InitiativeStrip (characters array + combatants array + inCombat/activeIndex/round)
 *   - SessionBar (pendingAction, pendingTarget)
 *   - DMPanel (combined session state)
 */

// ── Default: active session with combat in progress ───────────────────────────

export const dm_session_active = Object.freeze({
  inCombat: true,
  round: 2,
  activeIndex: 1,  // Goblin A's turn
  characters: [
    {
      id: 'CH101',
      name: 'Kael',
      player: 'Mara',
      hp_current: 38,
      hp_max: 45,
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
      photo: null,
      class_primary: { name: 'Pícaro', level: 5 },
      conditions: [{ id: 'c5', condition_name: 'Envenenado', intensity_level: 1 }],
      resources: [
        { id: 'r7', name: 'Sneak Attack', pool_current: 1, pool_max: 1, recharge: 'TURN' },
      ],
    },
    {
      id: 'CH103',
      name: 'Brum',
      player: 'Iris',
      hp_current: 2,
      hp_max: 28,
      photo: null,
      class_primary: { name: 'Mago', level: 5 },
      conditions: [{ id: 'c2', condition_name: 'Aturdido', intensity_level: null }],
      resources: [
        { id: 'r3', name: 'Slots Nv.1', pool_current: 0, pool_max: 4, recharge: 'LONG_REST' },
      ],
    },
    {
      id: 'CH104',
      name: 'Zara',
      player: 'Dev',
      hp_current: 32,
      hp_max: 32,
      photo: null,
      class_primary: { name: 'Clérigo', level: 5 },
      conditions: [],
      resources: [
        { id: 'r9',  name: 'Slots Nv.1',       pool_current: 4, pool_max: 4, recharge: 'LONG_REST' },
        { id: 'r12', name: 'Channel Divinity',  pool_current: 1, pool_max: 1, recharge: 'SHORT_REST' },
      ],
    },
  ],
  combatants: [
    { charId: 'CH101', roll: 16, initiative: 18 },
    { charId: 'e1',    roll: 12, initiative: 14 }, // Goblin A (NPC, no full character record)
    { charId: 'CH102', roll: 8,  initiative: 12 },
    { charId: 'e2',    roll: 7,  initiative: 9  }, // Goblin B
    { charId: 'CH104', roll: 6,  initiative: 8  },
    { charId: 'CH103', roll: 4,  initiative: 6  },
  ],
});

// ── Edge case 1: pre-combat (session open, no initiative yet) ─────────────────

export const dm_session_pre_combat = Object.freeze({
  inCombat: false,
  round: 0,
  activeIndex: 0,
  characters: dm_session_active.characters,
  combatants: [],
});

// ── Edge case 2: post-combat (encounter ended, players rest) ──────────────────

export const dm_session_post_combat = Object.freeze({
  inCombat: false,
  round: 0,
  activeIndex: 0,
  characters: [
    { ...dm_session_active.characters[0], hp_current: 45, conditions: [] }, // healed
    { ...dm_session_active.characters[1], hp_current: 32, conditions: [] }, // healed
    { ...dm_session_active.characters[2], hp_current: 28, conditions: [] }, // healed
    { ...dm_session_active.characters[3], hp_current: 32, conditions: [] }, // healed
  ],
  combatants: [],
});

// ── SessionBar pending action shapes ─────────────────────────────────────────

export const session_bar_pending_damage = Object.freeze({
  pendingAction: 'damage' as const,
  pendingTarget: 'CH101',
  pendingAmount: 8,
});

export const session_bar_pending_heal = Object.freeze({
  pendingAction: 'heal' as const,
  pendingTarget: 'CH103',
  pendingAmount: 12,
});

export const session_bar_pending_condition = Object.freeze({
  pendingAction: 'condition' as const,
  pendingTarget: 'CH102',
  pendingCondition: 'Envenenado',
});
