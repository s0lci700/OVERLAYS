# Project Guidelines: DADOS & RISAS 🎲

## 🚀 Project Overview

**DADOS & RISAS** is a real-time production system for D&D streaming campaigns. It allows Dungeon Masters (DMs) and players to manage character states (HP, conditions, resources) and perform dice rolls from a mobile-friendly control panel, with OBS overlays updating instantly via Socket.io.

### Key Features:
- **Real-time Sync**: Sub-100ms updates using Socket.io.
- **Mobile-First Control Panel**: Built with Svelte 5 for a modern, reactive DM/player experience.
- **Persistent Storage**: Uses PocketBase (SQLite) for character data and roll history.
- **Vanilla Overlays**: High-performance OBS overlays using HTML/CSS/JS.

---

## 📁 Project Structure

```text
OVERLAYS/
├── server.js            # Express + Socket.io backend (port 3000)
├── pocketbase.exe       # PocketBase binary (port 8090)
├── data/                # Backend data access (PocketBase interactions)
├── public/              # OBS overlays (Vanilla JS/CSS)
├── control-panel/       # Svelte 5 Control Panel (Vite, port 5173)
│   ├── src/routes/      # SvelteKit routes
│   └── src/lib/         # Components and stores
├── scripts/             # Orchestration and setup scripts
└── tests/               # Backend and E2E tests
```

---

## 🛠 Tech Stack

- **Backend**: Node.js 18+, Express, Socket.io 4.8.
- **Database**: PocketBase (SQLite).
- **Frontend**: Svelte 5, Vite 7, Tailwind CSS 4.
- **Runtime**: Bun (recommended) or Node.js.

---

## 📋 Instructions for Junie

### 1. Code Style & Standards
- **Backend**: CommonJS (`require`) is used in `server.js` and `data/`. Follow the existing minimal, single-file service pattern in `server.js`.
- **Frontend**: Svelte 5 (Runes) is mandatory. Use Tailwind CSS for styling. Follow the existing component structure in `control-panel/src/lib/`.
- **Naming**: Follow existing camelCase for JavaScript variables and kebab-case for CSS classes.

### 2. Testing & Verification
- **Backend**: Run `node tests/backend-sanity.js` after making changes to API routes or PocketBase integrations.
- **Frontend**: Use `bun run test` inside the `control-panel` directory to run Vitest unit tests.
- **Manual Verification**: Ensure that Socket.io events are correctly broadcasted and received by both the control panel and overlays.

### 3. Development Workflow
- **Starting the Stack**: Use `bun run start-demo` from the root to start PocketBase and the backend.
- **Control Panel**: Run `bun run dev` (or `dev:auto` for local IP detection) inside `control-panel/`.
- **Database Changes**: If modifying characters or rolls structure, ensure the PocketBase schema (managed via `pocketbase.exe` admin UI) matches the `data/` module expectations.

### 4. Build Requirements
- Always check that `control-panel` builds successfully with `bun run build` before suggesting UI-heavy changes.
- Do not modify `pocketbase.exe` or `pb_data/` directly unless specifically requested.

---

## 🧪 Common Commands

| Task | Command |
| :--- | :--- |
| **Start Backend + DB** | `bun run start-demo` |
| **Start Control Panel** | `cd control-panel && bun run dev` |
| **Run Frontend Tests** | `cd control-panel && bun test` |
| **Run Backend Sanity** | `node tests/backend-sanity.js` |
