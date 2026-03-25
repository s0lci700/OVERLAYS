/**
 * Commons / shared-display fixture data for Storybook stories and Vitest tests.
 *
 * Shapes consumed by:
 *   - Party status wallboard (Commons surface)
 *   - OverlayHP (mockCharacters prop — lightweight HP + conditions only)
 *   - Location/terrain reveal components
 *
 * Uses the OverlayHP wire shape: { id, name, hp_current, hp_max, conditions, photo }
 */

// ── Default: full party, healthy ─────────────────────────────────────────────

export const party_status_healthy = Object.freeze([
  { id: 'CH101', name: 'Kael', hp_current: 45, hp_max: 45, conditions: [], photo: null },
  { id: 'CH102', name: 'Lyra', hp_current: 32, hp_max: 32, conditions: [], photo: null },
  { id: 'CH103', name: 'Brum', hp_current: 28, hp_max: 28, conditions: [], photo: null },
  { id: 'CH104', name: 'Zara', hp_current: 32, hp_max: 32, conditions: [], photo: null },
]);

// ── Edge case 1: mid-session wear — mixed HP + conditions ─────────────────────

export const party_status_mixed = Object.freeze([
  { id: 'CH101', name: 'Kael', hp_current: 38, hp_max: 45,
    conditions: [{ id: 'c1', condition_name: 'Envenenado', intensity_level: 1 }], photo: null },
  { id: 'CH102', name: 'Lyra', hp_current: 14, hp_max: 32, conditions: [], photo: null },
  { id: 'CH103', name: 'Brum', hp_current: 2,  hp_max: 28,
    conditions: [
      { id: 'c2', condition_name: 'Aturdido', intensity_level: null },
      { id: 'c3', condition_name: 'Asustado', intensity_level: 2 },
    ], photo: null },
  { id: 'CH104', name: 'Zara', hp_current: 32, hp_max: 32, conditions: [], photo: null },
]);

// ── Edge case 2: combat crisis — one down, two critical ───────────────────────

export const party_status_crisis = Object.freeze([
  { id: 'CH101', name: 'Kael', hp_current: 0,  hp_max: 45,
    conditions: [{ id: 'c4', condition_name: 'Inconsciente', intensity_level: null }], photo: null },
  { id: 'CH102', name: 'Lyra', hp_current: 8,  hp_max: 32,
    conditions: [{ id: 'c5', condition_name: 'Envenenado', intensity_level: 1 }], photo: null },
  { id: 'CH103', name: 'Brum', hp_current: 2,  hp_max: 28,
    conditions: [{ id: 'c6', condition_name: 'Paralizado', intensity_level: null }], photo: null },
  { id: 'CH104', name: 'Zara', hp_current: 19, hp_max: 32, conditions: [], photo: null },
]);

// ── Edge case 3: empty party (no characters loaded yet) ───────────────────────

export const party_status_empty = Object.freeze([]);

// ── Location records ──────────────────────────────────────────────────────────

export const location_ironhaven = Object.freeze({
  id: 'loc_001',
  name: 'La Ciudad de Ironhaven',
  type: 'city',
  description: 'Un puerto bullicioso en la desembocadura del río Grisal. Conocida por sus mercados de especias y sus callejones peligrosos.',
  terrain: 'urban',
  is_current: true,
});

export const location_forest_ruins = Object.freeze({
  id: 'loc_002',
  name: 'Ruinas del Bosque Gris',
  type: 'ruins',
  description: 'Restos de una torre élfica cubierta de musgo. El aire huele a magia antigua y peligro.',
  terrain: 'wilderness',
  is_current: false,
});
