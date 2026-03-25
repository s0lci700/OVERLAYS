import { io, type Socket } from 'socket.io-client';
import { onDestroy } from 'svelte';
import type { CharacterRecord } from '$lib/contracts/records';

export interface OverlaySocketInstance {
	readonly socket: Socket;
	readonly characters: CharacterRecord[];
	getChar: (id: string) => CharacterRecord | null;
}

export function createOverlaySocket(serverUrl: string): OverlaySocketInstance {
	const socket = io(serverUrl, {
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000
	});

	let characters: CharacterRecord[] = $state([]);
	const charMap: Record<string, CharacterRecord> = {};

	socket.on('initialData', ({ characters: chars }: { characters: CharacterRecord[] }) => {
		characters = chars ?? [];
		chars?.forEach((c) => {
			charMap[c.id] = c;
		});
	});

	socket.on('character_updated', ({ character }: { character: CharacterRecord }) => {
		charMap[character.id] = character;
		characters = characters.map((c) => (c.id === character.id ? character : c));
	});

	socket.on('hp_updated', ({ character }: { character: CharacterRecord }) => {
		charMap[character.id] = character;
		characters = characters.map((c) => (c.id === character.id ? character : c));
	});

	// Silent reconnect — overlays must never show error UI
	socket.on('connect_error', (err: Error) => console.warn('[overlay]', err.message));

	onDestroy(() => socket.disconnect());

	return {
		get socket() {
			return socket;
		},
		get characters() {
			return characters;
		},
		getChar: (id: string) => charMap[id] ?? null
	};
}
