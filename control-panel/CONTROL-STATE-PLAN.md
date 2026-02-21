# Control Panel Data Safety Plan

## Goal
Build a transaction-oriented state layer inside `control-panel` that keeps HP, resources, conditions, rests, and roll actions resilient, synced, and safe for a 5-hour live stream without SQL persistence.

## Key proposals
1. **Centralized transaction manager** (`src/lib/transactions.js`):
   * Expose helpers for `updateHp`, `toggleResource`, `takeRest`, `addCondition`, `removeCondition`, and `logRoll`.
   * Each helper:
     * Validates inputs and computes the desired payload.
     * Marks corresponding writable stores (`characters`, `pendingActions`, `isSyncing`) before firing the request.
     * Sends the REST call with exponential backoff/retries (3 attempts, base delay 150ms, multiplier 1.5).
     * On success leaves updates to the incoming Socket.io events; on failure rolls back pending flags and records the error.
   * Rate-limit per-character actions (e.g., 2 updates/sec per character) by queuing actions when inputs arrive faster.

2. **Optimistic UI + authoritative socket**:
   * Immediately mark UI elements as `pending` (e.g., dim buttons, show spinner) when a transaction starts.
   * Do not mutate the `characters` store directly—only allow patches when socket emissions arrive, ensuring desync doesn’t accumulate.
   * Maintain a `pendingActions` store that maps action IDs to their type/state so modals/toasts can show status and allow cancellation.

3. **Derived status stores**:
   * `isSyncing` (boolean) toggles while REST calls are in-flight.
   * `lastError` (string) updates when retries exhaust, shown in a toast overlay.
   * `rollQueue` keeps pending dice requests so high-frequency roll buttons can display “queued”.

4. **Observability hooks**:
   * Wrap `transactions` helpers with simple logging (success/failure + latency).
   * Emit a `socket.emit("pending_action", {...})` event optionally so overlays can highlight pending requests if needed.

## Integration steps
1. **Create transaction module**:
   * New file `control-panel/src/lib/transactions.js`.
   * Import fetch wrapper and stores (`characters`, `lastRoll`, `socket`, new `pendingActions`, `isSyncing`, `lastError`).
   * Export functions that encapsulate request/backoff/retry plus pending handling.
2. **Extend stores**:
   * Add derived stores in `socket.js` or new `stores.js` for `pendingActions`, `isSyncing`, `rollQueue`, `lastError`.
   * Update existing components (CharacterCard, DiceRoller) to use these stores instead of calling fetch directly.
3. **UI updates**:
   * Add visual cues (spinners, rate-limit warnings, disable while pending) in Svelte components referencing the new status stores.
   * Introduce a queued dice roll indicator and toast for errors.
4. **Testing/validation**:
   * Mock the REST layer (using e.g., MSW or manual node script) to simulate delays/failures and confirm transactions roll back correctly.
   * Validate pending markers clear when socket events rehydrate the authoritative state.

## Next steps
* Optionally expose these transactions to other components (e.g., future DM view) by exporting from a singleton store.
* When persistence lands, keep the transaction API while switching the backend to SQLite—behavior stays unchanged for the control panel.
