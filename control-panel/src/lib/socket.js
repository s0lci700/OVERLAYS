import { io } from "socket.io-client";
import { writable } from "svelte/store";

/**
 * Singleton socket shared by every control panel component.
 * Set VITE_SERVER_URL in control-panel/.env to point at your server (default: http://localhost:3000).
 */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const socket = io(SERVER_URL);

// Internal writable — only this module mutates character state.
// Components receive a read-only view via the exported `characters` store.
const _characters = writable([]);

/**
 * Read-only characters store. Subscribe to this; never call .set() or .update() directly.
 * All mutations flow through Socket.io events handled below.
 */
const characters = { subscribe: _characters.subscribe };
// Re-exported for use in DiceRoller.svelte to display the most recent dice result.
export const lastRoll = writable(null);

socket.on("connect", () => {
  console.log("Connected to server");
});

// Initial snapshot from the server that boots the characters store.
socket.on("initialData", (data) => {
  console.log("Received initial data:", data);
  _characters.set(data.characters);
});

// ── Character state updates ──────────────────────────────────

// Keep the character list up to date when HP changes arrive from the server.
socket.on("hp_updated", ({ character }) => {
  _characters.update((chars) =>
    chars.map((c) => (c.id === character.id ? character : c)),
  );
});

// Append newly created characters so every connected panel updates in real time.
socket.on("character_created", ({ character }) => {
  _characters.update((chars) => [...chars, character]);
});

socket.on("character_updated", ({ character }) => {
  _characters.update((chars) =>
    chars.map((c) => (c.id === character.id ? character : c)),
  );
});

// Append condition payloads so the UI can render updated status badges.
socket.on("condition_added", ({ charId, condition }) => {
  _characters.update((chars) =>
    chars.map((c) =>
      c.id === charId
        ? { ...c, conditions: [...(c.conditions || []), condition] }
        : c,
    ),
  );
});

// Remove a condition entry when the server signals it has expired.
socket.on("condition_removed", ({ charId, conditionId }) => {
  _characters.update((chars) =>
    chars.map((c) =>
      c.id === charId
        ? {
            ...c,
            conditions: (c.conditions || []).filter(
              (cond) => cond.id !== conditionId,
            ),
          }
        : c,
    ),
  );
});

// Update a single resource pool so the UI can immediately reflect the remaining uses.
socket.on("resource_updated", ({ charId, resource }) => {
  _characters.update((chars) =>
    chars.map((c) =>
      c.id === charId
        ? {
            ...c,
            resources: (c.resources || []).map((r) =>
              r.id === resource.id ? resource : r,
            ),
          }
        : c,
    ),
  );
});

// Replace the entire character after a rest to atomically refresh all resource pools.
socket.on("rest_taken", ({ charId, character }) => {
  _characters.update((chars) =>
    chars.map((c) => (c.id === charId ? character : c)),
  );
});

// Remove the character from the list when the server confirms deletion.
socket.on("character_deleted", ({ charId }) => {
  _characters.update((chars) => chars.filter((c) => c.id !== charId));
});

// ── Dice ─────────────────────────────────────────────────────

// Keep the last-roll store current so the UI can highlight recent dice activity.
socket.on("dice_rolled", (data) => {
  lastRoll.set(data);
});

export { characters };
export { socket };
export { SERVER_URL };
