/**
 * PocketBase data layer for the rolls collection.
 * Replaces data/rolls.js (legacy CJS).
 */
import type PocketBase from 'pocketbase';

export interface RollRecord {
  id: string;
  charId: string;
  characterName: string;
  result: number;
  modifier: number;
  rollResult: number;
  sides: number;
  created?: string;
}

export async function getAll(pb: PocketBase): Promise<RollRecord[]> {
  return await pb.collection('rolls').getFullList<RollRecord>({ sort: '-created' });
}

export async function logRoll(
  pb: PocketBase,
  payload: {
    charId: string;
    characterName: string;
    result: number;
    modifier?: number;
    sides: number;
  },
): Promise<RollRecord> {
  const { charId, characterName, result, modifier = 0, sides } = payload;
  return await pb.collection('rolls').create<RollRecord>({
    charId,
    characterName,
    result,
    modifier,
    rollResult: result + modifier,
    sides,
  });
}
