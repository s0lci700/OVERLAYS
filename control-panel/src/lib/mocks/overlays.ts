/**
 * Audience overlay payload fixture data for Storybook stories and Vitest tests.
 *
 * Shapes consumed by overlay components via their `preview` prop:
 *   - OverlayDice      — dice_rolled event payload
 *   - OverlayAnnounce  — announce event payload
 *   - OverlayTurnOrder — mockEncounter prop (see combat.ts for full shape)
 *   - OverlayLevelUp   — level_up event payload
 *   - OverlayPlayerDown — player_down event payload
 *   - OverlayLowerThird — lower_third event payload
 *   - OverlayCharacterFocus — character_focused event payload
 *
 * Also exports OverlayPayload wrappers (overlays.ts contract shape) for
 * kind: 'dice_result' | 'success_failure' | 'character_intro' | 'info_block'.
 */

// ── Dice roll previews ─────────────────────────────────────────────────────────

/** Critical success: natural 20 */
export const dice_roll_nat20 = Object.freeze({
  id: 'roll_001',
  charId: 'CH101',
  characterName: 'Kael',
  result: 20,
  sides: 20,
  modifier: 3,
  rollResult: 23,
  timestamp: '2026-03-24T21:00:00.000Z',
});

/** Critical failure: natural 1 */
export const dice_roll_nat1 = Object.freeze({
  id: 'roll_002',
  charId: 'CH102',
  characterName: 'Lyra',
  result: 1,
  sides: 20,
  modifier: 0,
  rollResult: 1,
  timestamp: '2026-03-24T21:05:00.000Z',
});

/** Normal d20 roll */
export const dice_roll_normal = Object.freeze({
  id: 'roll_003',
  charId: 'CH103',
  characterName: 'Brum',
  result: 14,
  sides: 20,
  modifier: 4,
  rollResult: 18,
  timestamp: '2026-03-24T21:10:00.000Z',
});

/** Damage roll (d8) */
export const dice_roll_damage = Object.freeze({
  id: 'roll_004',
  charId: 'CH104',
  characterName: 'Zara',
  result: 6,
  sides: 8,
  modifier: 3,
  rollResult: 9,
  timestamp: '2026-03-24T21:15:00.000Z',
});

// ── Announce previews ─────────────────────────────────────────────────────────

export const announce_location = Object.freeze({
  type: 'location',
  title: 'La Ciudad de Ironhaven',
  body: 'Un puerto bullicioso en la desembocadura del río Grisal.',
  image: null,
  duration: 8000,
});

export const announce_knowledge = Object.freeze({
  type: 'knowledge',
  title: 'Lore Descubierto',
  body: 'Los dragones de hielo hibernan durante cien años antes de despertar con hambre.',
  image: null,
  duration: null, // persistent until dismissed
});

export const announce_npc = Object.freeze({
  type: 'npc',
  title: 'Marisela, la Tabernera',
  body: 'Una enana corpulenta con ojos que han visto demasiado.',
  image: null,
  duration: 6000,
});

export const announce_custom = Object.freeze({
  type: 'custom',
  title: '¡Atención!',
  body: 'El servidor se reinicia en 5 minutos.',
  image: null,
  duration: 5000,
});

// ── Level-up payloads ─────────────────────────────────────────────────────────

export const level_up_kael = Object.freeze({
  charId: 'CH101',
  newLevel: 8,
  className: 'Guerrero',
});

export const level_up_brum = Object.freeze({
  charId: 'CH103',
  newLevel: 6,
  className: 'Mago',
});

// ── Player-down payloads ──────────────────────────────────────────────────────

export const player_down_unconscious = Object.freeze({
  charId: 'CH101',
  isDead: false, // unconscious / 0 HP
});

export const player_down_dead = Object.freeze({
  charId: 'CH103',
  isDead: true,
});

// ── Lower-third payloads ──────────────────────────────────────────────────────

export const lower_third_kael = Object.freeze({
  characterName: 'Kael Stoneblade',
  playerName: 'Mara',
  duration: 5000,
});

export const lower_third_lyra = Object.freeze({
  characterName: 'Lyra Nightwhisper',
  playerName: 'Nico',
  duration: 5000,
});

// ── Character focus payloads ──────────────────────────────────────────────────

export const character_focus_kael = Object.freeze({
  character: {
    id: 'CH101',
    name: 'Kael Stoneblade',
    player: 'Mara',
    hp_current: 38,
    hp_max: 45,
    conditions: [{ id: 'cond1', condition_name: 'Envenenado', intensity_level: 1 }],
    photo: null,
    class_primary: { name: 'Guerrero', level: 7 },
  },
});

// ── OverlayPayload contract wrappers (overlays.ts: { id, kind, payload, ttlMs }) ──

export const overlay_payload_dice_result = Object.freeze({
  id: 'ovr_001',
  kind: 'dice_result' as const,
  payload: dice_roll_nat20,
  ttlMs: 4000,
});

export const overlay_payload_dice_result_expired = Object.freeze({
  id: 'ovr_002',
  kind: 'dice_result' as const,
  payload: dice_roll_nat1,
  ttlMs: 0, // TTL expired
});

export const overlay_payload_character_intro = Object.freeze({
  id: 'ovr_003',
  kind: 'character_intro' as const,
  payload: character_focus_kael.character,
  ttlMs: 8000,
});

export const overlay_payload_info_block = Object.freeze({
  id: 'ovr_004',
  kind: 'info_block' as const,
  payload: { title: 'Ruinas del Bosque Gris', body: 'Restos de una torre élfica. El aire huele a magia antigua.' },
  ttlMs: 10000,
});
