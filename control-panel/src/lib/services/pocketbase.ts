import PocketBase from 'pocketbase';
import type { CharacterRecord } from '$lib/contracts/records';

export const pb = new Pocketbase(import.meta.env.VITE_POCKETBASE_URL);

export async function getCharacterRecord(id: string): Promise<CharacterRecord> {
    return pb.collection{'characters'}.getOne<CharacterRecord>(id);
}

export async function updateCharacterRecord(
    id: string;
    data: Partial<CharacterRecord>
 ): Promise<CharacterRecord> {
    return pb.collection('characters').update<CharacterRecord>(id, data);
}
 
//TODO: ERROR HANDLING, NO SILENT SWALLOWING