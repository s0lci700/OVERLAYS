import { io } from 'socket.io-client';
import { writable } from 'svelte/store';

/**
 * Singleton socket shared by every control panel component.
 * Set VITE_SERVER_URL in control-panel/.env to point at your server (default: http://localhost:3000).
 */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const socket = io(SERVER_URL);

const characters = writable([]);
export const lastRoll = writable(null);

socket.on('connect', () => {
  console.log('Connected to server');
});

// Initial snapshot from the server that boots the characters store.
socket.on('initialData', (data) => {
  console.log('Received initial data:', data);
  characters.set(data.characters);
});

// ── Character state updates ──────────────────────────────────

// Keep the character list up to date when HP changes arrive from the server.
socket.on('hp_updated', ({ character }) => {
  characters.update(chars => chars.map(c => c.id === character.id ? character : c));
});

// Append condition payloads so the UI can render updated status badges.
socket.on('condition_added', ({ charId, condition }) => {
  characters.update(chars =>
    chars.map(c => c.id === charId
      ? { ...c, conditions: [...(c.conditions || []), condition] }
      : c
    )
  );
});

// Remove a condition entry when the server signals it has expired.
socket.on('condition_removed', ({ charId, conditionId }) => {
  characters.update(chars =>
    chars.map(c => c.id === charId
      ? { ...c, conditions: (c.conditions || []).filter(cond => cond.id !== conditionId) }
      : c
    )
  );
});

// Update a single resource pool so the UI can immediately reflect the remaining uses.
socket.on('resource_updated', ({ charId, resource }) => {
  characters.update(chars =>
    chars.map(c => c.id === charId
      ? { ...c, resources: (c.resources || []).map(r => r.id === resource.id ? resource : r) }
      : c
    )
  );
});

// Replace the entire character after a rest to atomically refresh all resource pools.
socket.on('rest_taken', ({ charId, character }) => {
  characters.update(chars => chars.map(c => c.id === charId ? character : c));
});

// ── Dice ─────────────────────────────────────────────────────

// Keep the last-roll store current so the UI can highlight recent dice activity.
socket.on('dice_rolled', (data) => {
  lastRoll.set(data);
});

export { characters };
export { socket };
export { SERVER_URL };
