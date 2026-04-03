// import { socket, subscribe, socketStatus } from '$lib/services/socket.svelte';
// import type { CharacterRecord } from '$lib/contracts';
// import { ServiceError } from '$lib/services/errors';

// export function join_character(characterId: CharacterRecord['id']): void {
// 	if (socket?.connected) {
// 		socket.emit('joinCharacter', { characterId });
// 	} else {
// 		console.warn(`[Socket] join_character dropped — not connected`);
//         // TODO:
//         // Server needs 'joinCharacter' handler
// 	}
// }
