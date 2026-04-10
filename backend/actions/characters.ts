import type PocketBase from 'pocketbase';
import * as characterData from '../data/characters';
import {
  HP_UPDATED,
  CONDITION_ADDED,
  CONDITION_REMOVED,
  RESOURCE_UPDATED,
} from '@contracts/events';
import type { CharacterRecord } from '@contracts/records';

/**
 * Higher-level character actions that combine data persistence (PocketBase)
 * with real-time synchronization (Socket.io broadcast).
 *
 * Pattern: action(pb, broadcast, ...args)
 * - pb: The PocketBase client instance.
 * - broadcast: The broadcast helper function (typed to avoid circular imports).
 */

type BroadcastFn = (event: string, data: Record<string, unknown>) => void;

// ── HP ──────────────────────────────────────────────────────────────────────

export async function updateHp(
  pb: PocketBase,
  broadcast: BroadcastFn,
  charId: string,
  hp: number,
): Promise<CharacterRecord | null> {
  const character = await characterData.updateHp(pb, charId, hp);
  if (!character) return null;

  broadcast(HP_UPDATED, { character, hp_current: character.hp_current });
  return character;
}

// ── Conditions ───────────────────────────────────────────────────────────────

export async function addCondition(
  pb: PocketBase,
  broadcast: BroadcastFn,
  charId: string,
  { condition_name, intensity_level }: { condition_name: string; intensity_level?: number },
): Promise<CharacterRecord | null> {
  const character = await characterData.addCondition(pb, charId, {
    condition_name,
    intensity_level,
  });
  if (!character) return null;

  const condition = character.conditions[character.conditions.length - 1];
  broadcast(CONDITION_ADDED, { charId, condition, character });
  return character;
}

/**
 * Removes a condition by name.
 * Note: Performs a findById round-trip to resolve name -> ID before deletion.
 */
export async function removeCondition(
  pb: PocketBase,
  broadcast: BroadcastFn,
  charId: string,
  conditionName: string,
): Promise<boolean> {
  const current = await characterData.findById(pb, charId);
  if (!current) return false;

  const match = (current.conditions ?? []).find(
    (c) => c.condition_name.toLowerCase() === conditionName.toLowerCase(),
  );
  if (!match) return false;

  const character = await characterData.removeCondition(pb, charId, match.id);
  if (!character) return false;

  broadcast(CONDITION_REMOVED, { charId, character, conditionId: match.id });
  return true;
}

// ── Resources ────────────────────────────────────────────────────────────────

/**
 * Updates a resource pool by name.
 * Note: Performs a findById round-trip to resolve name -> ID before update.
 */
export async function updateResource(
  pb: PocketBase,
  broadcast: BroadcastFn,
  charId: string,
  { resourceName, newValue }: { resourceName: string; newValue: number },
): Promise<boolean> {
  const current = await characterData.findById(pb, charId);
  if (!current) return false;

  const resource = (current.resources ?? []).find((r) => r.name === resourceName);
  if (!resource) return false;

  const updatedResource = await characterData.updateResource(pb, charId, resource.id, newValue);
  if (!updatedResource) return false;

  broadcast(RESOURCE_UPDATED, { charId, resource: updatedResource });
  return true;
}
