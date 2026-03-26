/**
 * PocketBase data layer for the characters collection.
 * Replaces data/characters.js (legacy CJS).
 *
 * All functions take the pb singleton as first arg so they stay
 * testable and stateless. Business logic (clamping, ID generation)
 * lives here — handlers own only validation and HTTP responses.
 */
import type PocketBase from 'pocketbase';
import type { CharacterRecord, Condition, ResourceSlot } from '@contracts/records';
import { createShortId } from './id';

// Re-export so consumers of this module don't need a separate import
export type { CharacterRecord, Condition } from '@contracts/records';
export type { ResourceSlot } from '@contracts/records';

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAll(pb: PocketBase): Promise<CharacterRecord[]> {
  return await pb.collection('characters').getFullList<CharacterRecord>({ sort: 'name' });
}

export async function findById(pb: PocketBase, id: string): Promise<CharacterRecord | null> {
  try {
    return await pb.collection('characters').getOne<CharacterRecord>(id);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function getCharacterName(pb: PocketBase, id: string): Promise<string> {
  const character = await findById(pb, id);
  return character ? character.name : 'Unknown';
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createCharacter(
  pb: PocketBase,
  input: Partial<CharacterRecord>,
): Promise<CharacterRecord> {
  return await pb.collection('characters').create<CharacterRecord>(input);
}

export async function updateHp(
  pb: PocketBase,
  id: string,
  hpCurrent: number,
): Promise<CharacterRecord | null> {
  const character = await findById(pb, id);
  if (!character) return null;
  const clamped = Math.max(0, Math.min(hpCurrent, character.hp_max));
  return await pb.collection('characters').update<CharacterRecord>(id, { hp_current: clamped });
}

export async function updatePhoto(
  pb: PocketBase,
  id: string,
  photo: string,
): Promise<CharacterRecord | null> {
  const trimmed = typeof photo === 'string' ? photo.trim() : '';
  return await pb.collection('characters').update<CharacterRecord>(id, { portrait: trimmed });
}

export async function updateCharacterData(
  pb: PocketBase,
  id: string,
  updates: Partial<CharacterRecord>,
): Promise<CharacterRecord | null> {
  return await pb.collection('characters').update<CharacterRecord>(id, updates);
}

// ─── Conditions ───────────────────────────────────────────────────────────────

export async function addCondition(
  pb: PocketBase,
  id: string,
  { condition_name, intensity_level = 1 }: { condition_name: string; intensity_level?: number },
): Promise<CharacterRecord | null> {
  const character = await findById(pb, id);
  if (!character) return null;
  const condition: Condition = {
    id: createShortId(),
    condition_name,
    intensity_level,
    applied_at: new Date().toISOString(),
  };
  return await pb.collection('characters').update<CharacterRecord>(id, {
    conditions: [...(character.conditions ?? []), condition],
  });
}

export async function removeCondition(
  pb: PocketBase,
  charId: string,
  conditionId: string,
): Promise<CharacterRecord | null> {
  const character = await findById(pb, charId);
  if (!character) return null;
  return await pb.collection('characters').update<CharacterRecord>(charId, {
    conditions: (character.conditions ?? []).filter((c) => c.id !== conditionId),
  });
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function updateResource(
  pb: PocketBase,
  charId: string,
  resourceId: string,
  poolCurrent: number,
): Promise<ResourceSlot | null> {
  const character = await findById(pb, charId);
  if (!character) return null;
  const resource = (character.resources ?? []).find((r) => r.id === resourceId);
  if (!resource) return null;
  resource.pool_current = Math.max(0, Math.min(poolCurrent, resource.pool_max));
  await pb.collection('characters').update<CharacterRecord>(charId, {
    resources: character.resources,
  });
  return resource;
}

export async function restoreResources(
  pb: PocketBase,
  charId: string,
  restType: 'short' | 'long',
): Promise<{ character: CharacterRecord; restored: string[] } | null> {
  const character = await findById(pb, charId);
  if (!character) return null;
  const restored: string[] = [];
  for (const res of character.resources ?? []) {
    const shouldRestore =
      res.reset_on === 'short_rest' ||
      (restType === 'long' && res.reset_on === 'long_rest');
    if (shouldRestore) {
      res.pool_current = res.pool_max;
      restored.push(res.name);
    }
  }
  const updated = await pb.collection('characters').update<CharacterRecord>(charId, {
    resources: character.resources,
  });
  return { character: updated, restored };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function removeCharacter(pb: PocketBase, charId: string): Promise<boolean> {
  const character = await findById(pb, charId);
  if (!character) return false;
  await pb.collection('characters').delete(charId);
  return true;
}
