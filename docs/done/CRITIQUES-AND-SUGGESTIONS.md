# Codebase Critiques & Suggestions: Dados & Risas 🎲

This document contains a deep-dive analysis of the **Dados & Risas** project as of March 2026. It highlights architectural gaps, technical debt, and tactical suggestions for moving toward a production-ready, BG3-style streaming system.

---

## 1. Architectural Integrity: The "Broadcast Bridge"
The system uses a **Control Panel (REST) → Backend (PocketBase) → Socket.io Broadcast → Thin Clients (Overlays)** flow.

### Critique
- **Stateless Overlays**: Overlays rely on the initial `connection` event. If a viewer joins mid-stream or the overlay is refreshed, it depends entirely on the last broadcast. There is no "heartbeat" or incremental sync to recover from dropped packets or network jitter.
- **Client-Side Dependency**: The server doesn't "know" the current state of an overlay; it just fires events.

### Suggestions
- **State Rejuvenation**: Implement a background "State Snapshot" broadcast every 30-60 seconds to ensure all overlays are perfectly in sync.
- **Server-Side Rendering (SSR) for Overlays**: Move some of the overlay logic to the server so they load with the current state already populated.

---

## 2. Data Persistence: Transactional Risks
The system integrates with **PocketBase**, but the logic in `data/characters.js` is potentially unsafe for multi-user scenarios.

### Critique
- **Read-Modify-Write (RMW) Pattern**: Current functions fetch the full object, modify it in JS, and save it back. This risks "Last Writer Wins" data loss if the DM and a Player update the same character at the same time.
- **No Atomic Increments**: HP changes should be atomic at the database level.

### Suggestions
- **Atomic Database Operations**: Use PocketBase's ability to increment/decrement values directly in the query (`hp_current+5`) rather than saving the whole object.
- **Optimistic Locking**: Implement a version check or timestamp check for critical state updates.

---

## 3. Frontend State: The Hybrid Rune Model
The project is currently transitioning from Svelte 4 stores to Svelte 5 runes.

### Critique
- **Global Store vs. Local Runes**: `lib/socket.js` uses Svelte 4 `writable` stores, while components use `$state`. This "Hybrid" model forces unnecessary boilerplate (`$store` syntax) inside modern Svelte 5 components.
- **Reactivity Fragmentation**: Using two different reactivity systems in the same project can lead to subtle bugs and harder maintenance.

### Suggestions
- **Refactor Global State to Runes**: Create a `createCharactersState.svelte.js` module that uses `$state` and `$derived` for the character list. This makes the data source native to Svelte 5.
- **Standardize Modifiers**: Rename state classes like `.collapsed` to `.is-collapsed` to match the project's own `is-` prefix convention.

---

## 4. Testing & Reliability
Automated test coverage is currently a major gap in the project.

### Critique
- **Zero Domain Logic Tests**: There are no unit tests for HP clamping, resource restoration, or condition logic. A single logic bug in `restoreResources` could break a live session.
- **Missing E2E for Overlays**: We don't verify if the overlays actually *show* what the Socket.io event sends.

### Suggestions
- **Vitest for Domain Logic**: Add unit tests specifically for `data/characters.js` and `data/rolls.js`.
- **Playwright Visual Testing**: Use Playwright to take screenshots of overlays during simulated Socket.io events to verify animations and layout.

---

## 5. Security & Access Control
The system is designed for a trusted LAN environment but lacks protection for broader use.

### Critique
- **Permissive CORS**: `CORS: "*"` is active.
- **No Authentication**: There is no "DM Key" or Player authentication. Anyone on the network can damage or delete characters.

### Suggestions
- **Simple Role-Based Access Control (RBAC)**: Add a simple API key requirement for `PUT/POST/DELETE` operations.
- **Read-Only Overlays**: Ensure overlays cannot trigger any state changes on the server.

---

## 6. BG3-Style Dynamics (The "Agency" Gap)
Comparing D&R to *Baldur's Gate 3* reveals a lack of contextual storytelling.

### Critique
- **Passive Broadcasting**: The system shows "What" (HP dropped) but not "Why" (Fireball).
- **Contextless Rolls**: Dice rolls lack the "Reason" field, making them feel like random numbers rather than story events.

### Suggestions
- **Contextualize Every Event**: Update the `POST /api/rolls` and `PUT /api/characters/:id/hp` endpoints to accept a `reason` or `skill` field.
- **Initiative Ribbon**: Build a dedicated overlay for turn order (`overlay-initiative.html`) to anchor the combat flow.
- **Viewer Interactivity**: Repurpose the `/dashboard` as a "Party Inspector" that viewers can explore independently.
