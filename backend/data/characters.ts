/**
 * PocketBase data layer for the characters collection.
 * Replaces data/characters.js (legacy CJS).
 *
 * All functions take the pb singleton as first arg so they stay
 * testable and stateless. Business logic (clamping, ID generation)
 * lives in domain/character.ts — this layer is pure CRUD.
 */
import type PocketBase from 'pocketbase';
import type { CharacterRecord, Condition, ResourceSlot } from '@contracts/records';

// Re-export so consumers of this module don't need a separate import
export type { CharacterRecord, Condition } from '@contracts/records';
export type { ResourceSlot } from '@contracts/records';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Expands a PocketBase filename in `portrait` to a full file URL.
 * PocketBase stores only the filename; clients need the full URL.
 */
function withPortraitUrl(pb: PocketBase, record: CharacterRecord): CharacterRecord {
  if (!record.portrait || record.portrait.startsWith('http') || record.portrait.startsWith('data:')) {
    return record;
  }
  return {
    ...record,
    portrait: `${pb.baseURL}/api/files/characters/${record.id}/${record.portrait}`,
  };
}

/**
 * Converts a portrait string (base64 data URL, http URL, or /relative path)
 * into a Blob + filename ready for FormData upload to PocketBase.
 * Returns null for empty input.
 */
async function photoStringToBlob(
  photo: string,
): Promise<{ blob: Blob; filename: string } | null> {
  const trimmed = photo.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    const [, mimeType, b64] = match;
    const buffer = Buffer.from(b64, 'base64');
    const ext = mimeType.split('/')[1] ?? 'webp';
    return { blob: new Blob([buffer], { type: mimeType }), filename: `portrait.${ext}` };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const res = await fetch(trimmed);
    if (!res.ok) throw new Error(`Failed to fetch photo ${trimmed}: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'image/webp';
    const filename = trimmed.split('/').pop()?.split('?')[0] ?? 'portrait.webp';
    return { blob: new Blob([buffer], { type: contentType }), filename };
  }

  if (trimmed.startsWith('/')) {
    const { readFileSync } = await import('fs');
    const ext = trimmed.split('.').pop() ?? 'webp';
    const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
    const mimeType = mimeMap[ext] ?? 'image/webp';
    const buffer = readFileSync(`.${trimmed}`);
    const filename = trimmed.split('/').pop() ?? 'portrait.webp';
    return { blob: new Blob([buffer], { type: mimeType }), filename };
  }

  throw new Error(`Unsupported photo format: ${trimmed.slice(0, 40)}`);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAll(pb: PocketBase): Promise<CharacterRecord[]> {
  const result = await pb.collection('characters').getList<CharacterRecord>();
  return result.items.map((r) => withPortraitUrl(pb, r));
}

export async function findById(pb: PocketBase, id: string): Promise<CharacterRecord | null> {
  try {
    const record = await pb.collection('characters').getOne<CharacterRecord>(id);
    return withPortraitUrl(pb, record);
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
  const { portrait, ...rest } = input;
  const record = await pb.collection('characters').create<CharacterRecord>(rest);
  if (portrait) {
    const updated = await updatePhoto(pb, record.id, portrait);
    if (updated) return updated;
  }
  return withPortraitUrl(pb, record);
}

export async function updateHp(
  pb: PocketBase,
  id: string,
  hpCurrent: number,
): Promise<CharacterRecord | null> {
  try {
    const record = await pb.collection('characters').update<CharacterRecord>(id, { hp_current: hpCurrent });
    return withPortraitUrl(pb, record);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function updatePhoto(
  pb: PocketBase,
  id: string,
  photo: string,
): Promise<CharacterRecord | null> {
  const trimmed = typeof photo === 'string' ? photo.trim() : '';
  if (!trimmed) {
    const record = await pb.collection('characters').update<CharacterRecord>(id, { portrait: null });
    return withPortraitUrl(pb, record);
  }
  const fileData = await photoStringToBlob(trimmed);
  if (!fileData) {
    const record = await pb.collection('characters').update<CharacterRecord>(id, { portrait: null });
    return withPortraitUrl(pb, record);
  }
  const fd = new FormData();
  fd.append('portrait', fileData.blob, fileData.filename);
  const record = await pb.collection('characters').update<CharacterRecord>(id, fd as any);
  return withPortraitUrl(pb, record);
}

export async function updateCharacterData(
  pb: PocketBase,
  id: string,
  updates: Partial<CharacterRecord>,
): Promise<CharacterRecord | null> {
  const record = await pb.collection('characters').update<CharacterRecord>(id, updates);
  return withPortraitUrl(pb, record);
}

// ─── Conditions ───────────────────────────────────────────────────────────────

export async function addCondition(
  pb: PocketBase,
  id: string,
  condition: Condition,
): Promise<CharacterRecord | null> {
  const character = await findById(pb, id);
  if (!character) return null;
  const record = await pb.collection('characters').update<CharacterRecord>(id, {
    conditions: [...(character.conditions ?? []), condition],
  });
  return withPortraitUrl(pb, record);
}

export async function removeCondition(
  pb: PocketBase,
  charId: string,
  conditionId: string,
): Promise<CharacterRecord | null> {
  const character = await findById(pb, charId);
  if (!character) return null;
  const record = await pb.collection('characters').update<CharacterRecord>(charId, {
    conditions: (character.conditions ?? []).filter((c) => c.id !== conditionId),
  });
  return withPortraitUrl(pb, record);
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
  resource.pool_current = poolCurrent;
  await pb.collection('characters').update<CharacterRecord>(charId, {
    resources: character.resources,
  });
  return resource;
}

export async function restoreResources(
  pb: PocketBase,
  charId: string,
  resources: ResourceSlot[],
): Promise<CharacterRecord | null> {
  try {
    const record = await pb.collection('characters').update<CharacterRecord>(charId, { resources });
    return withPortraitUrl(pb, record);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function removeCharacter(pb: PocketBase, charId: string): Promise<boolean> {
  const character = await findById(pb, charId);
  if (!character) return false;
  await pb.collection('characters').delete(charId);
  return true;
}
