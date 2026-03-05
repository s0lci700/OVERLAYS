# Copilot instructions

Real-time D&D streaming overlay for DADOS & RISAS. **Stack:** Bun + Express + Socket.io · Svelte 5 / SvelteKit · PocketBase.

## Quick index

- `SPRINT.md` — current sprint tasks (auto-generated, always up to date)
- `docs/INDEX.md` — fast file map, entry points, do-not-edit paths
- `docs/ARCHITECTURE.md` — data-flow diagrams and full file map
- `docs/SOCKET-EVENTS.md` — complete Socket.io event payloads
- `docs/DESIGN-SYSTEM.md` — CSS tokens, component states, animation reference

## Build, test, and lint commands

- **Start order:** PocketBase first (`./pocketbase serve`), then `bun server.js`, then control panel.
- **Root backend:** `bun server.js` — Express + Socket.io on port 3000. Auto-seeds PocketBase on first boot.
- **IP setup:** `bun run setup-ip` — detects LAN IP, writes root `.env` + `control-panel/.env`.
- **Control panel** (`cd control-panel` first):
  - `bun run dev -- --host` — Vite dev server with LAN exposure (port 5173)
  - `bun run build` / `bun run preview` — production build
  - `bun run lint` — ESLint (eslint-plugin-svelte, flat config v9)
  - `bun run test` — Vitest unit tests
  - `bun run storybook` — Storybook dev server (port 6006)
- **Design tokens:** `bun run generate:tokens` at repo root — regenerates CSS from `design/tokens.json`. Always run after editing tokens.
- **Playwright E2E:** `bunx playwright test app.test.js --config tests-log/playwright.config.js`

## Architecture

```
Phone / Tablet
  └── control-panel (SvelteKit + Vite, :5173) — REST + Socket.io client
        │
        ▼
  Bun server (Express + Socket.io, :3000)
  [data/characters.js] [data/rolls.js]  ← PocketBase SDK wrappers
        │  io.emit broadcasts to ALL clients
        ▼
  PocketBase (:8090, SQLite)
        ▼
  SvelteKit overlay routes (served at :5173)
  /persistent/hp  /persistent/conditions  /moments/dice  /announcements  …
  (OBS Browser Sources — Svelte 5, listen-only via Socket.io)
```

## SvelteKit routing

Route groups use `(parens)` — organizational only, not part of URLs.

- `(stage)/live/characters` — HP, conditions, resources management
- `(stage)/live/dice` — dice roller
- `(stage)/setup/create` — character creation
- `(stage)/setup/manage` — photo/data editing
- `(stage)/overview` — live read-only operator dashboard
- `(cast)/dm` — initiative tracker + Session Panel
- `(cast)/players/[id]` — player character sheet
- `(audience)/persistent/hp` — HP overlay (OBS)
- `(audience)/persistent/conditions` — conditions overlay (OBS)
- `(audience)/moments/dice` — dice roll moment (OBS)
- `(audience)/announcements` — announcement overlay (OBS)

## Key conventions

- **Runtime:** Use `bun` everywhere — `bun install`, `bun server.js`, `bun run dev`.
- **PocketBase:** All `data/` functions take `pb` as first arg and are `async`. `getOne()` throws on 404 — use try/catch.
- **Socket flow:** Components send REST first; Socket.io broadcast updates shared state. Never mutate stores directly.
- **Svelte 5 runes:** Use ``, ``, `` in components. Global `characters` / `lastRoll` in `socket.js` stay as writable stores (shared singletons).
- **CSS:** Each component has a paired `.css` file. State classes use `is-` prefix. Token variables from `generated-tokens.css` via `var(--token-name)`.
- **UI library:** `bits-ui` v2 (headless primitives) + `tailwind-variants`. Shared base classes (`.card-base`, `.btn-base`, `.label-caps`) in `app.css`.
- **Animations:** `anime.js` for programmatic effects; CSS transitions for HP bar / collapse.
- **Storybook:** Run `bun run storybook` in `control-panel/` before any UI work — component context at `http://localhost:6006`.
- **Servers:** Always stop servers (Ctrl+C) before finishing a task.

## When you find a bug or improvement

Open a GitHub Issue — Notion syncs automatically.

**Area:** `area:frontend` (Svelte, CSS, overlays) · `area:backend` (server.js, API, Socket.io, PocketBase)
**Priority:** `p0` blocking · `p1` this sprint · `p2` next · `p3` someday
**Size:** `size:quick` <1hr · `size:small` 1–3hr · `size:medium` 3–8hr · `size:large` 8+hr

Assign to current milestone: **Sprint 1 — Bug Fix & Stability**

For non-tech items (outreach, session planning) → add directly to Notion, not GitHub.