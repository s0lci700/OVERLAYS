import { error, redirect, isHttpError, isRedirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { CharacterRecord } from '$lib/contracts/records';
import { getCharacter } from '$lib/services/character';

export const load: LayoutServerLoad = async ({ params: { id } }): Promise<{ character: CharacterRecord }> => {
	try {
		const character = await getCharacter(id);
		return { character };
	} catch (err) {
		// Let SvelteKit redirects pass through unchanged.
		if (isRedirect(err)) throw err;
		// NOT_FOUND → send user back to the roster instead of an error page.
		if (isHttpError(err, 404)) throw redirect(307, `/players?notFound=${id}`);
		// Any other HttpError (401, 500, etc.) — pass through as-is.
		if (isHttpError(err)) throw err;

		console.error(`[layout:players/[id]] Unexpected error fetching character ${id}:`, err);
		throw error(500, { message: 'Internal server error' });
	}
};
	



	
