import { io } from 'socket.io-client';
import { onDestroy } from 'svelte';

export function createOverlaySocket(serverUrl) {
    const socket = io(serverUrl, {
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
    });

    let characters = $state([]);
    const charMap = {};

    socket.on('initialData', ({ characters: chars }) => {
        characters = chars ?? [];
        chars?.forEach(c => { charMap[c.id] = c; });
    });

    socket.on('character_updated', ({ character }) => {
        charMap[character.id] = character;
        characters = characters.map(c => c.id === character.id ? character : c);
    });

    socket.on('hp_updated', ({ character }) => {
        charMap[character.id] = character;
        characters = characters.map(c => c.id === character.id ? character : c);
    });

    // Silent reconnect — overlays must never show error UI
    socket.on('connect_error', err => console.warn('[overlay]', err.message));

    onDestroy(() => socket.disconnect());

    return {
        get socket()     { return socket; },
        get characters() { return characters; },
        getChar: id      => charMap[id] ?? null,
    };
}