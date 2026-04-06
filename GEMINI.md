# 🎲 GEMINI.md - Dados & Risas / TableRelay

This file serves as the primary instructional context for Gemini CLI when working on the **Dados & Risas** (software product: **TableRelay**) project. It outlines the project's architecture, development standards, and operational workflows.

---

## 🚀 Project Overview

**TableRelay** is a real-time production system for live D&D streaming. It manages game state (HP, dice rolls, conditions) and synchronizes it across four distinct layers using a low-latency architecture (Bun + Socket.io + PocketBase).

### The Four Layers
1.  **Stage (`(stage)`):** Operator control surface. The only layer with **write** authority (REST API).
2.  **Cast (`(cast)`):** DM reference panel and Player character sheets. Mobile-first, read-heavy.
3.  **Audience (`(audience)`):** OBS Browser Source overlays. Purely reactive, listen-only.
4.  **Commons (`(commons)`):** Shared room mirror/wallboard.

---

## 🛠 Tech Stack & Environment

-   **Runtime:** Bun (Primary) / Node.js 18+.
-   **Backend:** Bun + Express + Socket.io (Port 3000).
-   **Database:** PocketBase (SQLite) (Port 8090).
-   **Frontend:** Svelte 5 (SvelteKit) + Vite 7 (Port 5173).
-   **Styling:** Tailwind CSS 4, Vanilla CSS (per-component), Design Tokens (`design/tokens.json`).
-   **UI Library:** `shadcn-svelte`, `bits-ui` v2 (headless), `tailwind-variants`.
-   **Testing:** Vitest (unit), Playwright (E2E), Storybook 10 (component isolation).
-   **OS:** Windows 11 (Use PowerShell syntax for CLI).

---

## 🏃 Running the Project

Always start services in this order:

1.  **PocketBase:** `./pocketbase serve` (Admin UI at `http://127.0.0.1:8090/_/`).
2.  **Backend:** `bun server.ts` (Requires `.env`).
3.  **Frontend:** `cd control-panel && bun run dev -- --host`.

### Useful Scripts
-   `bun run setup-ip`: Auto-detects LAN IP and updates `.env` files for mobile access.
-   `bun run start-demo`: Starts PB and Backend together.
-   `bun run generate:tokens`: Regenerates CSS from `design/tokens.json`.

---

## 📐 Development Conventions

### 1. Svelte 5 Standards
-   Use **Runes** (`$state`, `$derived`, `$props`, `$effect`) exclusively.
-   Follow the **Svelte 5 component pattern**: `.svelte` file + paired `.css` file for complex styles.
-   Use `bits-ui` v2 for accessible headless primitives.

### 2. Data Flow & State
-   **Writes:** Always use REST API (`POST`/`PUT`/`DELETE`) from the Stage layer.
-   **Sync:** The server broadcasts state changes via **Socket.io**.
-   **Reads:** Clients listen to socket events to update local Svelte stores (`characters`, `lastRoll`).
-   **Stores:** Global singletons in `lib/services/socket.js`.

### 3. Backend & Database
-   All data layer functions in `src/server/data/` take `pb` as the first argument.
-   PocketBase SDK throws `ClientResponseError` on 404s—always use `try/catch`.
-   Use `createShortId()` from `src/server/data/id.ts` for 5-character entity IDs.

### 4. Code Intelligence (GitNexus)
-   **Impact Analysis:** Before editing a symbol, run `gitnexus_impact` to assess the blast radius.
-   **Refactoring:** Use `gitnexus_rename` instead of find-and-replace.
-   **Verification:** Run `gitnexus_detect_changes()` before committing.

### 5. Error Handling
-   Use the `ServiceError` class from `$lib/services/errors` for all service-layer throws.
-   Standardized codes: `'NOT_FOUND'`, `'UNAUTHORIZED'`, `'VALIDATION'`, `'NETWORK'`, `'CONFIG'`.

---

## 🎨 Design Concepts & Future Ideas

- **Advanced Dice Visuals:** Use Blender-rendered dice outlines (all faces) converted to SVGs for complex animations.
- **Morphing Loader:** Create a loading icon featuring various die shapes (d20, d12, etc.) morphing into one another.

---

## 📁 Key File Map

-   `server.ts`: Backend entry point (Express + Socket.io).
-   `src/server/handlers/`: REST route controllers.
-   `control-panel/src/routes/`: SvelteKit route groups (`(stage)`, `(cast)`, `(audience)`).
-   `control-panel/src/lib/contracts/`: TypeScript interfaces (Single Source of Truth for types).
-   `design/tokens.json`: Canonical design tokens.
-   `CLAUDE.md`: Detailed environment-specific instructions (Root and Control Panel).

---

## 🧪 Testing Strategy

-   **Isolation:** Develop components in **Storybook** using mock view-models.
-   **Unit:** Use **Vitest** for logic and service testing.
-   **E2E:** Use **Playwright** for critical path verification (e.g., Stage write -> Audience update).
-   **Type Check:** `bun run build` at root runs `tsc --noEmit`.

---

*Note: This file is a living document. Update it when architectural patterns evolve or new major dependencies are added.*
