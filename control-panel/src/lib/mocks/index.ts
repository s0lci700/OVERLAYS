/**
 * Canonical mock fixture barrel export.
 *
 * Usage: import { player_sheet_kael, combat_state, dice_roll_nat20 } from '$lib/mocks'
 *
 * NEVER import this in production code. Mocks are for Storybook stories and Vitest tests only.
 */

export * from './players';
export * from './combat';
export * from './commons';
export * from './overlays';
export * from './stage';
export * from './dm';
export * from './dice';
export * from './npc';
