import type { LayoutServerLoad } from "./$types";
import { listCharacterRecords } from "$lib/services/pocketbase";

export const load: LayoutServerLoad = async () => {
    try {
        const characters = await listCharacterRecords();
        return { charCount: characters.length };
    } catch (error) {
        console.error("Error loading character count in layout load function:", error);
        return { charCount: 0 };
    }
};
