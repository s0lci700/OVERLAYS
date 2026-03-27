import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { CharacterRecord } from '$lib/contracts/records';

// Use the backend Express server (localhost) instead of PocketBase directly.
// VITE_POCKETBASE_URL points to the network IP which is unreachable from SSR
// (Node.js fetch → undici → TypeError: fetch failed). The Express server at
// localhost:3000 is always reachable from SSR on the same machine.
const SERVER_INTERNAL = import.meta.env.VITE_SERVER_INTERNAL_URL || 'http://localhost:3000';

export const load: LayoutServerLoad = async ({
	params,
	fetch
}): Promise<{ character: CharacterRecord | null }> => {
	try {
		const res = await fetch(`${SERVER_INTERNAL}/api/characters/${params.id}`);
		if (res.status === 404) error(404, 'Character not found');
		if (!res.ok) {
			console.error(`[layout:players/[id]] Express returned ${res.status} for character ${params.id}`);
			return { character: null };
		}
		const character: CharacterRecord = await res.json();
		return { character };
	} catch (err) {
		console.error('[layout:players/[id]] fetch error:', err);
		return { character: null };
	}
};
