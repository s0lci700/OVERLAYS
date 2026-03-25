/**
 * Fixture shape validation — runs in CI via Vitest.
 *
 * Validates:
 *  1. Required fields are present and correctly typed on each fixture
 *  2. HP invariant: hp_current <= hp_max
 *  3. Ability scores in D&D 5e legal range (1–30)
 *  4. Resources have non-negative pool values with pool_used/pool_current <= pool_max
 *  5. Overlay payloads have valid kind values
 *  6. Object.freeze: top-level fixtures are immutable
 */

import { describe, it, expect } from 'vitest';
import {
  // players
  player_sheet_kael,
  player_sheet_lyra,
  player_sheet_brum,
  player_sheet_zara,
  player_sheet_down,
  player_sheet_many_conditions,
  party_roster,
  // combat
  combat_state,
  combat_state_inactive,
  combat_state_round_1,
  combat_participants,
  encounter_active,
  encounter_empty,
  initiative_rolls,
  // commons
  party_status_healthy,
  party_status_mixed,
  party_status_crisis,
  party_status_empty,
  location_ironhaven,
  // overlays
  dice_roll_nat20,
  dice_roll_nat1,
  dice_roll_normal,
  dice_roll_damage,
  announce_location,
  announce_npc,
  overlay_payload_dice_result,
  overlay_payload_character_intro,
  // stage
  stage_characters,
  stage_characters_partial,
  stage_characters_empty,
  stage_last_roll,
  // dm
  dm_session_active,
  dm_session_pre_combat,
  dm_session_post_combat,
  // dice
  roll_nat20_d20,
  roll_nat1_d20,
  roll_normal_d20,
  roll_d8_damage,
  // npc
  npc_friendly,
  npc_hostile_goblin,
  npc_neutral_merchant,
  npc_boss_sombralord,
  enemy_goblin_a,
} from '../index';

// ── helpers ───────────────────────────────────────────────────────────────────

function checkHpInvariant(fixture: { hp_current: number; hp_max: number }, label: string) {
  expect(fixture.hp_current, `${label}: hp_current must be >= 0`).toBeGreaterThanOrEqual(0);
  expect(fixture.hp_max, `${label}: hp_max must be > 0`).toBeGreaterThan(0);
  expect(fixture.hp_current, `${label}: hp_current must be <= hp_max`).toBeLessThanOrEqual(fixture.hp_max);
}

function checkAbilityScores(scores: Record<string, number>, label: string) {
  const EXPECTED_STATS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const stat of EXPECTED_STATS) {
    expect(scores, `${label}: missing ability score '${stat}'`).toHaveProperty(stat);
    expect(scores[stat], `${label}: ${stat} out of range`).toBeGreaterThanOrEqual(1);
    expect(scores[stat], `${label}: ${stat} out of range`).toBeLessThanOrEqual(30);
  }
}

function checkResources(resources: Array<{ pool_current: number; pool_max: number }>, label: string) {
  for (const r of resources) {
    expect(r.pool_current, `${label}: pool_current must be >= 0`).toBeGreaterThanOrEqual(0);
    expect(r.pool_max, `${label}: pool_max must be > 0`).toBeGreaterThan(0);
    expect(r.pool_current, `${label}: pool_current must be <= pool_max`).toBeLessThanOrEqual(r.pool_max);
  }
}

// ── Player fixtures ───────────────────────────────────────────────────────────

describe('players fixtures', () => {
  const all = [
    [player_sheet_kael, 'kael'],
    [player_sheet_lyra, 'lyra'],
    [player_sheet_brum, 'brum'],
    [player_sheet_zara, 'zara'],
    [player_sheet_down, 'down'],
    [player_sheet_many_conditions, 'many_conditions'],
  ] as const;

  it.each(all)('has required fields: %s', (fixture, label) => {
    expect(fixture.id).toBeTruthy();
    expect(fixture.name).toBeTruthy();
    expect(typeof fixture.hp_current).toBe('number');
    expect(typeof fixture.hp_max).toBe('number');
    expect(Array.isArray(fixture.conditions)).toBe(true);
    expect(Array.isArray(fixture.resources)).toBe(true);
    expect(fixture.class_primary).toBeTruthy();
    expect(typeof fixture.class_primary.level).toBe('number');
  });

  it.each(all)('satisfies HP invariant: %s', (fixture, label) => {
    checkHpInvariant(fixture, label);
  });

  it.each(all)('has valid ability scores: %s', (fixture, label) => {
    checkAbilityScores(fixture.ability_scores, label);
  });

  it.each(all)('resources have valid pool values: %s', (fixture, label) => {
    checkResources(fixture.resources, label);
  });

  it('party_roster contains 4 characters', () => {
    expect(party_roster).toHaveLength(4);
    const ids = party_roster.map(c => c.id);
    expect(ids).toContain('CH101');
    expect(ids).toContain('CH102');
    expect(ids).toContain('CH103');
    expect(ids).toContain('CH104');
  });

  it('top-level fixtures are frozen (immutable)', () => {
    expect(Object.isFrozen(player_sheet_kael)).toBe(true);
    expect(Object.isFrozen(player_sheet_down)).toBe(true);
  });
});

// ── Combat fixtures ───────────────────────────────────────────────────────────

describe('combat fixtures', () => {
  it('combat_state has required fields', () => {
    expect(typeof combat_state.combatActive).toBe('boolean');
    expect(typeof combat_state.roundNumber).toBe('number');
    expect(Array.isArray(combat_state.initiativeOrder)).toBe(true);
    expect(typeof combat_state.activeIndex).toBe('number');
  });

  it('combat_state is active with participants', () => {
    expect(combat_state.combatActive).toBe(true);
    expect(combat_state.initiativeOrder.length).toBeGreaterThan(0);
    expect(combat_state.activeIndex).toBeGreaterThanOrEqual(0);
    expect(combat_state.activeIndex).toBeLessThan(combat_state.initiativeOrder.length);
  });

  it('combat_state_inactive has empty order', () => {
    expect(combat_state_inactive.combatActive).toBe(false);
    expect(combat_state_inactive.initiativeOrder).toHaveLength(0);
  });

  it('combat_participants satisfy HP invariant', () => {
    for (const p of combat_participants) {
      checkHpInvariant(p, `participant ${p.id}`);
    }
  });

  it('encounter_active has participants sorted by initiative', () => {
    const initiatives = encounter_active.participants.map(p => p.initiative);
    for (let i = 1; i < initiatives.length; i++) {
      expect(initiatives[i]).toBeLessThanOrEqual(initiatives[i - 1]);
    }
  });

  it('encounter_empty has no participants', () => {
    expect(encounter_empty.participants).toHaveLength(0);
    expect(encounter_empty.round).toBe(0);
  });

  it('initiative_rolls have roll <= 20 (d20)', () => {
    for (const r of initiative_rolls) {
      expect(r.roll).toBeGreaterThanOrEqual(1);
      expect(r.roll).toBeLessThanOrEqual(20);
      expect(r.initiative).toBeGreaterThanOrEqual(r.roll); // initiative >= roll (mods are positive)
    }
  });
});

// ── Commons fixtures ──────────────────────────────────────────────────────────

describe('commons fixtures', () => {
  it('party_status arrays satisfy HP invariant', () => {
    for (const char of party_status_healthy) checkHpInvariant(char, `healthy:${char.id}`);
    for (const char of party_status_mixed)   checkHpInvariant(char, `mixed:${char.id}`);
    for (const char of party_status_crisis)  checkHpInvariant(char, `crisis:${char.id}`);
  });

  it('party_status_empty is empty array', () => {
    expect(party_status_empty).toHaveLength(0);
  });

  it('location_ironhaven has required fields', () => {
    expect(location_ironhaven.id).toBeTruthy();
    expect(location_ironhaven.name).toBeTruthy();
    expect(location_ironhaven.description).toBeTruthy();
  });
});

// ── Overlay fixtures ──────────────────────────────────────────────────────────

describe('overlays fixtures', () => {
  const diceRolls = [dice_roll_nat20, dice_roll_nat1, dice_roll_normal, dice_roll_damage];

  it.each(diceRolls.map(r => [r, r.id] as const))('dice roll has required fields (%s)', (roll) => {
    expect(roll.charId).toBeTruthy();
    expect(roll.characterName).toBeTruthy();
    expect(roll.result).toBeGreaterThanOrEqual(1);
    expect(roll.sides).toBeGreaterThan(0);
    expect(roll.rollResult).toBeGreaterThanOrEqual(roll.result);
  });

  it('nat20 result equals 20', () => {
    expect(dice_roll_nat20.result).toBe(20);
    expect(dice_roll_nat20.sides).toBe(20);
  });

  it('nat1 result equals 1', () => {
    expect(dice_roll_nat1.result).toBe(1);
    expect(dice_roll_nat1.sides).toBe(20);
  });

  it('announce fixtures have type/title/body', () => {
    expect(announce_location.type).toBe('location');
    expect(announce_location.title).toBeTruthy();
    expect(announce_location.body).toBeTruthy();
    expect(announce_npc.type).toBe('npc');
  });

  it('OverlayPayload wrappers have valid kind', () => {
    const valid = ['dice_result', 'success_failure', 'character_intro', 'info_block'];
    expect(valid).toContain(overlay_payload_dice_result.kind);
    expect(valid).toContain(overlay_payload_character_intro.kind);
    expect(overlay_payload_dice_result.ttlMs).toBeGreaterThan(0);
  });
});

// ── Stage fixtures ────────────────────────────────────────────────────────────

describe('stage fixtures', () => {
  it('stage_characters has 4 entries', () => {
    expect(stage_characters).toHaveLength(4);
  });

  it('stage_characters satisfy HP invariant', () => {
    for (const c of stage_characters) checkHpInvariant(c, `stage:${c.id}`);
  });

  it('stage_characters_partial has 2 entries', () => {
    expect(stage_characters_partial).toHaveLength(2);
  });

  it('stage_characters_empty is empty', () => {
    expect(stage_characters_empty).toHaveLength(0);
  });

  it('stage_last_roll has required fields', () => {
    expect(stage_last_roll).not.toBeNull();
    expect(stage_last_roll!.charId).toBeTruthy();
    expect(stage_last_roll!.sides).toBeGreaterThan(0);
    expect(stage_last_roll!.result).toBeGreaterThanOrEqual(1);
    expect(stage_last_roll!.result).toBeLessThanOrEqual(stage_last_roll!.sides);
  });
});

// ── DM fixtures ───────────────────────────────────────────────────────────────

describe('dm fixtures', () => {
  it('dm_session_active has inCombat=true with combatants', () => {
    expect(dm_session_active.inCombat).toBe(true);
    expect(dm_session_active.characters.length).toBeGreaterThan(0);
    expect(dm_session_active.combatants.length).toBeGreaterThan(0);
  });

  it('dm_session_pre_combat has no combatants', () => {
    expect(dm_session_pre_combat.inCombat).toBe(false);
    expect(dm_session_pre_combat.combatants).toHaveLength(0);
  });

  it('dm characters satisfy HP invariant', () => {
    for (const c of dm_session_active.characters) checkHpInvariant(c, `dm:${c.id}`);
    for (const c of dm_session_post_combat.characters) checkHpInvariant(c, `dm_post:${c.id}`);
  });
});

// ── Dice fixtures ─────────────────────────────────────────────────────────────

describe('dice fixtures', () => {
  const rolls = [roll_nat20_d20, roll_nat1_d20, roll_normal_d20, roll_d8_damage];

  it.each(rolls.map(r => [r.id, r] as const))('roll %s: result within die range', (_, roll) => {
    expect(roll.result).toBeGreaterThanOrEqual(1);
    expect(roll.result).toBeLessThanOrEqual(roll.sides);
  });

  it.each(rolls.map(r => [r.id, r] as const))('roll %s: rollResult = result + modifier', (_, roll) => {
    expect(roll.rollResult).toBe(roll.result + roll.modifier);
  });
});

// ── NPC fixtures ──────────────────────────────────────────────────────────────

describe('npc fixtures', () => {
  const all = [npc_friendly, npc_hostile_goblin, npc_neutral_merchant, npc_boss_sombralord];

  it.each(all.map(n => [n.id, n] as const))('npc %s has required fields', (_, npc) => {
    expect(npc.id).toBeTruthy();
    expect(npc.name).toBeTruthy();
    expect(typeof npc.is_hostile).toBe('boolean');
    checkHpInvariant(npc, npc.id);
  });

  it('boss has more HP than mobs', () => {
    expect(npc_boss_sombralord.hp_max).toBeGreaterThan(npc_hostile_goblin.hp_max);
  });

  it('enemy_goblin_a has encounter-participant shape', () => {
    expect(enemy_goblin_a.isPlayer).toBe(false);
    expect(typeof enemy_goblin_a.initiative).toBe('number');
  });
});
