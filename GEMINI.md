# GEMINI.md - DADOS & RISAS 🎲

This file provides architectural context, development guidelines, and operational procedures for the **DADOS & RISAS** project.

## Project Overview

**DADOS & RISAS** is a real-time production system for D&D streaming campaigns. It allows DMs and players to control character states (HP, conditions, resources) and roll dice via a mobile-first control panel, with instant updates reflected in OBS overlays.

### Core Architecture

- **Backend**: Node.js (Express + Socket.io) serves as the central hub. It provides a REST API for state mutations and broadcasts updates to all connected clients via WebSockets.
- **Frontend (Control Panel)**: A Svelte 5 application built with Vite, optimized for mobile use. It consumes the REST API and listens for real-time updates.
- **Database**: PocketBase (SQLite) handles persistence for characters and roll history.
- **Overlays**: Vanilla HTML/CSS/JS files (located in `public/`) that connect directly to the Socket.io server to display real-time animations and data in OBS.

## Technical Stack

- **Runtime**: [Bun](https://bun.sh/) (preferred over npm/node for scripts).
- **Backend**: Express 5, Socket.io 4.8.
- **Frontend**: Svelte 5, Vite 7, Tailwind CSS 4, Bits UI.
- **Database**: PocketBase (running on port 8090).
- **Styling**: Design tokens in `design/tokens.json`, BEM-style CSS modules.
- **Animations**: `anime.js` for programmatic effects; CSS transitions for state changes.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- [PocketBase](https://pocketbase.io/) executable in the root directory.

### Environment Setup

Run the following command to auto-detect your LAN IP and configure `.env` files for both the root and control panel:

```bash
bun run setup-ip
```

### Development Workflow

Start the components in this specific order:

1.  **PocketBase**:
    ```bash
    ./pocketbase serve
    ```
    *(Admin UI: http://127.0.0.1:8090/_/)*

2.  **Seed Data** (First time only):
    ```bash
    bun run scripts/seed.js
    ```

3.  **Backend Server**:
    ```bash
    bun server.js
    ```
    *(Runs on port 3000)*

4.  **Control Panel**:
    ```bash
    cd control-panel
    bun run dev -- --host
    ```
    *(Runs on port 5173)*

## Development Conventions

### General Rules
- **Always use `bun`** for running scripts and managing dependencies.
- **Svelte 5 Runes**: Use `$state`, `$derived`, and `$effect` for component logic.
- **Real-time Flow**: Components must send a REST request to the server first. The server then broadcasts the update via Socket.io. Do **not** mutate global stores directly from components.
- **CSS**: Each Svelte component should have a paired `.css` file. Use BEM-style prefixes for state (e.g., `.is-critical`, `.is-active`).
- **Design Tokens**: Never edit generated CSS files directly. Edit `design/tokens.json` and run `bun run generate:tokens`.

### Data Layer (`data/`)
- All functions in `data/characters.js` and `data/rolls.js` are `async` and take the `pb` (PocketBase) instance as the first argument.
- Use try/catch blocks when calling PocketBase methods, as they throw `ClientResponseError` on 404s.

### OBS Overlays
- Overlays are served from the `public/` directory.
- Configure OBS Browser Sources with `1920x1080` resolution.
- Pass the server URL via query parameter: `overlay-hp.html?server=http://<IP>:3000`.

## Key Commands

| Command | Description |
| :--- | :--- |
| `bun run setup-ip` | Detects IP and updates `.env` files. |
| `bun run generate:tokens` | Regenerates CSS from `tokens.json`. |
| `bun run scripts/seed.js` | Seeds PocketBase with initial characters. |
| `cd control-panel && bun run test` | Runs Vitest unit tests. |
| `cd control-panel && bun run lint` | Runs ESLint for the frontend. |
| `cd control-panel && bun run storybook` | Starts Storybook (port 6006). |

## Directory Structure

- `server.js`: Main entry point for the Express/Socket.io server.
- `data/`: PocketBase SDK wrappers and seed data.
- `public/`: OBS overlay assets and entry points.
- `control-panel/`: SvelteKit source code.
- `design/`: Canonical design tokens and themes.
- `scripts/`: Tooling for IP setup, seeding, and token generation.
- `docs/`: In-depth documentation for architecture, API, and socket events.
  - `docs/CRITIQUES-AND-SUGGESTIONS.md`: Deep-dive architectural critiques and roadmap suggestions.
  - `docs/BG3-COMPARISON-REPORT.md`: Detailed comparison with modern RPG dynamics.
  - `docs/ESDH-RESEARCH-REPORT.md`: Strategic research on production practices and visual aesthetic of ESDH Producciones.
  - `docs/ESDH-BRAND-GUIDELINES.md`: Formal brand manual for colors, typography, and "ESDH-style" interaction design.
