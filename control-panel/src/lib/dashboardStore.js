/**
 * Dashboard Store
 * ================
 * Svelte store for managing control panel UI state, action tracking, and
 * activity history across all game events.
 *
 * Features:
 * - Pending action queue for optimistic UI updates
 * - Activity history log (capped at 40 entries)
 * - Real-time sync status tracking
 * - Role-based access control state
 * - Socket.io event listeners for all game actions
 *
 * This store acts as a central hub for dashboard-level state that isn't
 * character-specific (character data lives in socket.js).
 */

import { writable, derived } from "svelte/store";
import { socket } from "./socket.js";

// ═══════════════════════════════════════════════════════════════════════════
// Store Definitions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Queue of pending actions awaiting server confirmation.
 * Used for optimistic UI updates and retry logic.
 * Each entry: { id: string, type: string, ...actionData }
 */
const pendingActions = writable([]);

/**
 * Activity history log of all game events (HP changes, rolls, conditions, etc.).
 * Capped at MAX_HISTORY entries (oldest are dropped).
 * Each entry: { timestamp: number, type: string, label: string, value: string, detail: string }
 */
const history = writable([]);

/**
 * Current user role for role-based UI rendering.
 * Values: "player" | "dm" | "spectator"
 * Currently set to "player" by default (not yet wired to auth).
 */
const currentRole = writable("player");

/**
 * Derived store that indicates whether any actions are pending.
 * True if pendingActions queue is non-empty.
 */
const isSyncing = derived(pendingActions, ($pending) => $pending.length > 0);

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

/** Maximum number of history entries to retain. Oldest entries are dropped. */
const MAX_HISTORY = 40;
/** Maximum action log entries shown on the dashboard. */
const MAX_ACTION_LOG = 10;
/** Maximum roll log entries shown on the dashboard. */
const MAX_ROLL_LOG = 10;

/**
 * Derived store: last N non-roll events, newest first.
 * Consuming components should import this instead of filtering `history` inline.
 */
export const actionHistory = derived(history, ($h) =>
  $h.filter((e) => e.type !== "roll").slice(-MAX_ACTION_LOG).reverse(),
);

/**
 * Derived store: last N roll events, newest first.
 */
export const rollHistory = derived(history, ($h) =>
  $h.filter((e) => e.type === "roll").slice(-MAX_ROLL_LOG).reverse(),
);

// ═══════════════════════════════════════════════════════════════════════════
// Action Queue Utilities
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Adds an action to the pending queue for optimistic UI updates.
 * Used when an action is initiated but hasn't been confirmed by the server yet.
 *
 * @param {Object} action - Action object with id, type, and relevant data
 * @param {string} action.id - Unique action identifier
 * @param {string} action.type - Action type (e.g., "hp_update", "roll")
 */
function enqueuePending(action) {
  pendingActions.update((list) => [...list, action]);
}

/**
 * Removes an action from the pending queue.
 * Called when server confirms the action or marks it as failed.
 *
 * @param {string} actionId - ID of the action to remove
 */
function dequeuePending(actionId) {
  pendingActions.update((list) =>
    list.filter((entry) => entry.id !== actionId),
  );
}

/**
 * Appends an entry to the activity history log.
 * Automatically adds a timestamp and enforces the MAX_HISTORY cap.
 *
 * @param {Object} entry - History entry object
 * @param {string} entry.type - Event type (hp, roll, condition, resource, rest)
 * @param {string} entry.label - Human-readable label for the event
 * @param {string} entry.value - Primary value display (e.g., HP amount, roll result)
 * @param {string} entry.detail - Additional context or detail text
 */
function recordHistory(entry) {
  history.update((list) => {
    const next = [...list, { timestamp: Date.now(), ...entry }];
    if (next.length > MAX_HISTORY) next.shift();
    return next;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Socket.io Event Listeners
// ═══════════════════════════════════════════════════════════════════════════
// These listeners record dashboard-level activity history for all game events.
// Character state updates are handled in socket.js; these only log to history.

/**
 * Logs HP changes to the activity history.
 * Triggered when any character's HP is updated from any client.
 *
 * Payload: { character: { id, name, hp_current, hp_max, ... }, hp_current }
 */
socket.on("hp_updated", ({ character, hp_current }) => {
  recordHistory({
    type: "hp",
    label: `${character.name} HP`,
    value: `${hp_current}/${character.hp_max}`,
    detail: "Health updated",
  });
});

/**
 * Logs resource pool changes (spell slots, action economy, etc.) to history.
 * Triggered when a character spends or recovers a resource.
 *
 * Payload: { charId, resource: { id, name, pool_current, pool_max, ... } }
 */
socket.on("resource_updated", ({ charId, resource }) => {
  recordHistory({
    type: "resource",
    label: `Character ${charId} resource`,
    value: `${resource.pool_current}/${resource.pool_max}`,
    detail: `Updated ${resource.name}`,
  });
});

/**
 * Logs condition additions (status effects) to history.
 * Triggered when a condition is applied to a character.
 *
 * Payload: { charId, condition: { id, condition_name, ... } }
 */
socket.on("condition_added", ({ charId, condition }) => {
  recordHistory({
    type: "condition",
    label: "Condition added",
    value: condition.condition_name,
    detail: charId,
  });
});

/**
 * Logs condition removals to history.
 * Triggered when a condition is removed from a character.
 *
 * Payload: { charId, conditionId }
 */
socket.on("condition_removed", ({ charId, conditionId }) => {
  recordHistory({
    type: "condition",
    label: "Condition removed",
    value: conditionId,
    detail: charId,
  });
});

/**
 * Logs rest events (short/long rest) to history.
 * Triggered when a character takes a rest and resources are restored.
 *
 * Payload: { charId, type: 'short' | 'long' }
 */
socket.on("rest_taken", ({ charId, type }) => {
  recordHistory({
    type: "rest",
    label: `Rest (${type})`,
    value: charId,
    detail: "Resources restored",
  });
});

/**
 * Logs dice rolls to history.
 * Triggered when any character rolls dice from the control panel.
 * Displays character name, final result, and roll breakdown.
 *
 * Payload: { charId, characterName, result, modifier, rollResult, sides }
 */
socket.on("dice_rolled", (payload) => {
  recordHistory({
    type: "roll",
    label: `${payload.characterName || payload.charId} rolled`,
    value: `${payload.rollResult}`,
    detail: `d${payload.sides} + ${payload.modifier ?? 0}`,
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Stores
  pendingActions, // Writable<Array> - Queue of pending actions
  isSyncing, // Derived<boolean> - True if any actions are pending
  history, // Writable<Array> - Activity history log (max 40 entries)
  currentRole, // Writable<string> - Current user role
  // actionHistory and rollHistory are exported above as named exports

  // Utilities
  enqueuePending, // Function - Add action to pending queue
  dequeuePending, // Function - Remove action from pending queue
  recordHistory, // Function - Append entry to history log
};
