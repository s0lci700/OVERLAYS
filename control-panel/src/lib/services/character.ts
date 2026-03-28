//Imports types from $lib/contracts/records.ts
// and $lib/contracts/cast.ts
import type {
	RecordID,
	CharacterRecord,
} from '$lib/contracts/records';
import { getCharacterRecord, listCharacterRecords } from '$lib/services/pocketbase';
import { subscribe } from '$lib/services/socket.svelte';
import { error } from '@sveltejs/kit';
import { ServiceError } from './errors';
import type { CharacterLiveState } from '$lib/contracts/cast';

//Exports getCharacter(id) —
// fetches persistent record from PocketBase via pocketbase.ts

export async function listCharacters(): Promise<CharacterRecord[]> {
	try {
		return await listCharacterRecords();
	} catch (err) {
		if (err instanceof ServiceError) {
			switch (err.code) {
				case 'NOT_FOUND':
					console.error('Character not found:', err);
					throw error(404, { message: 'Character not found' });
				case 'UNAUTHORIZED':
					console.error('Unauthorized access:', err);
					throw error(401, { message: 'Unauthorized' });
				case 'VALIDATION':
				case 'CONFIG':
				case 'NETWORK':
				default:
					console.error('Error fetching characters:', err);
					throw error(500, { message: 'Internal server error' });
			}
		}

		console.error('Unexpected error fetching characters:', err);
		throw error(500, { message: 'Internal server error' });
	}
}

export async function getCharacter(id: RecordID): Promise<CharacterRecord> {
	try {
		return await getCharacterRecord(id);
	} catch (err) {
		if (err instanceof ServiceError) {
			switch (err.code) {
				case 'NOT_FOUND':
					console.error(`Character ${id} not found:`, err);
					throw error(404, { message: 'Character not found' });
				case 'UNAUTHORIZED':
					console.error(`Unauthorized access to character ${id}:`, err);
					throw error(401, { message: 'Unauthorized' });
				default:
					console.error(`Error fetching character ${id}:`, err);
					throw error(500, { message: 'Internal server error' });
			}
		}
		console.error(`Unexpected error fetching character ${id}:`, err);
		throw error(500, { message: 'Internal server error' });
	}
}

//Exports subscribeToCharacterUpdates(id, handler) —
// subscribes to live state via socket.ts;
// returns unsubscribe function
export function subscribeToCharacterUpdates(
	id: RecordID,
	handler: (state: CharacterLiveState) => void
): () => void {
	//Initial fetch of character state from PocketBase
	return subscribe(`character:${id}:updated` as any, handler);
}

//Does not import PocketBase or
// [socket.io](http://socket.io)-client directly —
// routes through service modules only
