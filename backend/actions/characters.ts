import type PocketBase from 'pocketbase';
import * as data from '../data/characters';
import * as domain from '../domain/character';
import {
  HP_UPDATED,
  CONDITION_ADDED,
  CONDITION_REMOVED,
  RESOURCE_UPDATED,
} from '@contracts/events';
import type { CharacterRecord, ResourceSlot } from '@contracts/records';

type BroadcastFn = (event: string, data: Record<string, unknown>) => void;

export class CharacterActions {
  constructor(
    private pb: PocketBase,
    private broadcast: BroadcastFn,
  ) {}

  // ── HP ──────────────────────────────────────────────────────────────────────

  async updateHp(charId: string, hp: number): Promise<CharacterRecord | null> {
    const char = await data.findById(this.pb, charId);
    if (!char) return null;
    const clamped = domain.clampHp(hp, char.hp_max);
    const updated = await data.updateHp(this.pb, charId, clamped);
    if (!updated) return null;
    this.broadcast(HP_UPDATED, { character: updated, hp_current: updated.hp_current });
    return updated;
  }

  // ── Conditions ───────────────────────────────────────────────────────────────

  async addCondition(
    charId: string,
    name: string,
    intensity = 1,
  ): Promise<CharacterRecord | null> {
    const condition = domain.buildCondition(name, intensity);
    const character = await data.addCondition(this.pb, charId, condition);
    if (!character) return null;
    this.broadcast(CONDITION_ADDED, { charId, condition, character });
    return character;
  }

  /** Name-based removal — used by Socket.io events (payload carries condition name). */
  async removeCondition(charId: string, conditionName: string): Promise<boolean> {
    const current = await data.findById(this.pb, charId);
    if (!current) return false;
    const match = (current.conditions ?? []).find(
      (c) => c.condition_name.toLowerCase() === conditionName.toLowerCase(),
    );
    if (!match) return false;
    const character = await data.removeCondition(this.pb, charId, match.id);
    if (!character) return false;
    this.broadcast(CONDITION_REMOVED, { charId, character, conditionId: match.id });
    return true;
  }

  /** ID-based removal — used by REST handlers (URL carries conditionId). */
  async removeConditionById(charId: string, conditionId: string): Promise<boolean> {
    const character = await data.removeCondition(this.pb, charId, conditionId);
    if (!character) return false;
    this.broadcast(CONDITION_REMOVED, { charId, character, conditionId });
    return true;
  }

  // ── Resources ────────────────────────────────────────────────────────────────

  /** Name-based update — used by Socket.io events (payload carries resource name). */
  async updateResource(
    charId: string,
    resourceName: string,
    newValue: number,
  ): Promise<boolean> {
    const current = await data.findById(this.pb, charId);
    if (!current) return false;
    const resource = (current.resources ?? []).find((r) => r.name === resourceName);
    if (!resource) return false;
    const clamped = domain.clampResource(newValue, resource.pool_max);
    const updated = await data.updateResource(this.pb, charId, resource.id, clamped);
    if (!updated) return false;
    this.broadcast(RESOURCE_UPDATED, { charId, resource: updated });
    return true;
  }

  /** ID-based update — used by REST handlers (URL carries resourceId). */
  async updateResourceById(
    charId: string,
    resourceId: string,
    newValue: number,
  ): Promise<ResourceSlot | null> {
    const current = await data.findById(this.pb, charId);
    if (!current) return null;
    const resource = (current.resources ?? []).find((r) => r.id === resourceId);
    if (!resource) return null;
    const clamped = domain.clampResource(newValue, resource.pool_max);
    const updated = await data.updateResource(this.pb, charId, resourceId, clamped);
    if (!updated) return null;
    this.broadcast(RESOURCE_UPDATED, { charId, resource: updated });
    return updated;
  }

  async takeRest(
    charId: string,
    restType: 'short' | 'long',
  ): Promise<{ character: CharacterRecord; restored: string[] } | null> {
    const current = await data.findById(this.pb, charId);
    if (!current) return null;
    const { resources, restored } = domain.applyRest(current.resources ?? [], restType);
    const character = await data.restoreResources(this.pb, charId, resources);
    if (!character) return null;
    this.broadcast('restTaken', { charId, type: restType, restored, character });
    return { character, restored };
  }
}

// Production singleton — pb and broadcast are module-level singletons that are
// safe to capture here because broadcast() reads _io at call-time, not import-time.
import { pb } from '../pb';
import { broadcast } from '../socket/rooms';
export const characterActions = new CharacterActions(pb, broadcast);
