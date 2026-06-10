/**
 * Pure domain functions for character state.
 * No PocketBase, no Socket.io — only game rules.
 * All side-effectful orchestration lives in actions/CharacterActions.
 */
import type { Condition, ResourceSlot } from '@contracts/records';
import { createShortId } from '../data/id';

export function clampHp(hp: number, max: number): number {
  return Math.max(0, Math.min(hp, max));
}

export function buildCondition(name: string, intensity = 1): Condition {
  return {
    id: createShortId(),
    condition_name: name,
    intensity_level: intensity,
    applied_at: new Date().toISOString(),
  };
}

export function clampResource(value: number, max: number): number {
  return Math.max(0, Math.min(value, max));
}

export function applyRest(
  resources: ResourceSlot[],
  restType: 'short' | 'long',
): { resources: ResourceSlot[]; restored: string[] } {
  const restored: string[] = [];
  const updated = resources.map((r) => {
    const should =
      r.reset_on === 'short_rest' || (restType === 'long' && r.reset_on === 'long_rest');
    if (should) {
      restored.push(r.name);
      return { ...r, pool_current: r.pool_max };
    }
    return r;
  });
  return { resources: updated, restored };
}
