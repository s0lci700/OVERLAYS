# Control Panel Dashboard Plan

## Goal
Describe how the new DM/Player dashboard should live inside `control-panel` while leveraging the existing Socket.io + REST flow, and document the scaffolding files already laid out so you can finish implementation tomorrow.

## Architecture notes
- Keep the dashboard as a new tab within `App.svelte`, sharing the same `characters`, `socket`, and transaction helpers already powering the standard control panel.
- Introduce dedicated state stores (`dashboardStore.js`) for pending actions, history, sync status, and role awareness; these stores tap the existing socket events so the dashboard always reflects the authoritative state while still showing “recent activity” metadata.
- Plan to build a `dashboard/` component bundle that renders stat cards, status chips, and a history feed or mini timeline sourced from `history` store entries.
- Add visual indicators (sync badge, pending action counts, history items grouping by type) so the DM and players can immediately see last hits/rolls/resources.
- Keep the onboarding simple: the dashboard only consumes data and doesn’t mutate state directly—use the existing REST/transaction helpers via the control panel (e.g., HP buttons still live in `CharacterCard`).

## Files touched so far
- `control-panel/src/App.svelte` — added a dashboard tab button and conditional render for the new `Dashboard` component alongside characters/dice views; the nav bar now switches between characters, dice, and dashboard panels inside the same Svelte shell.
- `control-panel/src/lib/dashboardStore.js` — exposes `pendingActions`, `history`, `isSyncing`, and `currentRole` stores; listeners consume Socket.io events to record timestamped history items (HP/res/resource/condition/rest/roll) and the file includes helpers to enqueue/dequeue pending actions while capping history length for performant UI rendering.
- `control-panel/src/lib/dashboard/Dashboard.svelte` (initial scaffold) — outlines the layout (header, stats grid, status badges) and imports the `HistoryPanel` plus styles. Finish tomorrow by implementing `HistoryPanel` and fleshing out the UI.

## Next steps for tomorrow
1. Create `control-panel/src/lib/dashboard/HistoryPanel.svelte` and accompanying CSS to list items from the `history` store, grouping by activity type and highlighting pending rolls or items.
2. Finalize `Dashboard.svelte` with accessible controls (filters, role toggle for DM vs player view) and ensure it reads from `pendingActions`, `isSyncing`, and `history`.
3. Extend `dashboardStore.js` to expose helper functions for marking pending actions, enqueueing roll queues, and clearing history entries older than a session threshold.
4. Add lightweight unit tests or storybook stories to validate the dashboard renders when `characters` or `history` stores update.
5. Optionally sync the dashboard with OBS overlays (e.g., emit a `dashboard_update` event) once the UI is stable.
