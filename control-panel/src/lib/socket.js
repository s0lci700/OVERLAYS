import { io } from 'socket.io-client';
import { writable } from 'svelte/store';

const serverPort = 'http://192.168.1.82:3000';
const controlPanelPort = 'http://192.168.1.82:5173';
const socket = io(serverPort);

const characters = writable([]);
export const lastRoll = writable(null);

socket.on('connect', () => {
  console.log('Connected to server');
});


socket.on('initialData', (data) => {
  console.log('Received initial data:', data);
  characters.set(data.characters);
});

socket.on('hp_updated', ({ character }) => {
    characters.update(chars => {
        return chars.map(c => c.id === character.id ? character : c);
    });
});

socket.on('dice_rolled', (data) => {
    lastRoll.set(data);
});

export { characters };
export { socket };
export { serverPort };
export { controlPanelPort }

