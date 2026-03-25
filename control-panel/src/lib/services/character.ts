//Imports types from $lib/contracts/records.ts
// and $lib/contracts/cast.ts
import type {
	RecordID,
	CharacterRecord,
} from '$lib/contracts/records';
import { getCharacterRecord } from '$lib/services/pocketbase';
import { subscribe } from '$lib/services/socket';
import type { CharacterLiveState } from '$lib/contracts/cast';

//Exports getCharacter(id) —
// fetches persistent record from PocketBase via pocketbase.ts

export async function getCharacter(id: RecordID): Promise<CharacterRecord> {
	return await getCharacterRecord(id);
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
