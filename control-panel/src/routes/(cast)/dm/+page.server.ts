import type { PageServerLoad } from './$types';
import { listCharacterRecords } from '$lib/services/pocketbase';

export const load: PageServerLoad = async () => {
	try {
		const characters = await listCharacterRecords();
		return { characters };
	} catch {
		// DM page degrades gracefully — socket will fill characters once connected
		return { characters: [] };
	}
};
