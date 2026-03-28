import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { CharacterRecord } from '$lib/contracts/records';
import { listCharacters } from '$lib/services/character';
import { ServiceError } from '$lib/services/errors';

export const load: PageServerLoad = async ({ url, ...rest}): Promise<{ characters: CharacterRecord[], notFoundId: string | null }> => {
	const notFoundId = url.searchParams.get('notFound');
	try {
		const characters = await listCharacters();
		return { characters, notFoundId };
	} catch (err) {
		if (err instanceof ServiceError) {
			switch (err.code) {
				case 'UNAUTHORIZED':
					console.error('[players] Unauthorized fetching character roster:', err);
					throw error(401, { message: 'Unauthorized' });
				case 'CONFIG':
				case 'NETWORK':
				default:
					console.error('[players] Error fetching character roster:', err);
					throw error(500, { message: 'Internal server error' });
			}
		}
		console.error('[players] Unexpected error fetching character roster:', err);
		throw error(500, { message: 'Internal server error' });
	}
};
