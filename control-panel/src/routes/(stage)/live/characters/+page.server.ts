import type { PageServerLoad } from './$types';
import { listCharacters } from '$lib/services/character';

export const load: PageServerLoad = async () => {
       try {
        const characters = await listCharacters();
        return { characters, charCount: characters.length };
       }
       catch (err) {
        console.error("Error loading characters in server load function:", err);
        return { characters: [], charCount: 0 };
       }
};
