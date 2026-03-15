# Copilot instructions

Real-time D&D session management and streaming overlay system for DADOS & RISAS (project name: **TableRelay**). **Stack:** Bun + Express + Socket.io · Svelte 5 / SvelteKit · PocketBase.

## Quick index

- `SPRINT.md` — current sprint tasks (auto-generated, always up to date)
- `PROJECT.md` — authoritative project definition and the four-layer architecture
- `docs/INDEX.md` — fast file map, entry points, do-not-edit paths
- `docs/ARCHITECTURE.md` — data-flow diagrams and full file map
- `docs/SOCKET-EVENTS.md` — complete Socket.io event payloads
- `docs/DESIGN-SYSTEM.md` — CSS tokens, component states, animation reference
- `control-panel/docs/` docs for control panel layer (SvelteKit routing, Storybook, testing, linting, contracts)

## Build, test, and lint commands

- **Start order:** PocketBase first (`./pocketbase serve`), then `bun server.js`, then control panel.
- **Root backend:** `bun server.js` — Express + Socket.io on port 3000.
- **IP setup:** `bun run setup-ip` — detects LAN IP, writes root `.env` + `control-panel/.env`.
- **Control panel** (`cd control-panel` first):
  - `bun run dev -- --host` — Vite dev server with LAN exposure (port 5173)
  - `bun run dev:auto` — runs `setup-ip` + `vite dev --host` in one step
  - `bun run build` / `bun run preview` — production build
  - `bun run lint` — ESLint (eslint-plugin-svelte, flat config v9)
  - `bun run test` — Vitest unit tests
  - `bun run storybook` — Storybook dev server (port 6006)
- **Design tokens:** `bun run generate:tokens` at repo root — regenerates CSS from `design/tokens.json`. Always run after editing tokens.
- **Playwright E2E:** `bunx playwright test app.test.js --config tests-log/playwright.config.js`

## Architecture

Four distinct layers: **Stage** (write-only operator), **Cast** (DM + player reference), **Audience** (OBS overlays), **Commons** (shared UI).

```
Phone / Tablet / Desktop
  └── control-panel (SvelteKit + Vite, :5173) — REST + Socket.io client
        │
        ▼
  Bun server (Express + Socket.io, :3000)
  [data/characters.js] [data/rolls.js]  ← PocketBase SDK wrappers
        │  io.emit broadcasts to ALL clients
        ▼
  PocketBase (:8090, SQLite)
        │
        ▼
  SvelteKit overlay routes (served at :5173)
  /persistent/hp  /persistent/conditions  /moments/dice  /scene  …
  (OBS Browser Sources — Svelte 5, listen-only via Socket.io)
```

State is persisted in PocketBase. Every socket connection receives `initialData` (full character roster + roll history). Overlays **never** send requests — they only listen.

## SvelteKit routing

Route groups use `(parens)` — organizational only, not part of URLs.

**Stage (operator):**
- `(stage)/live/characters` — HP, conditions, resources management
- `(stage)/live/dice` — dice roller
- `(stage)/setup/create` — character creation
- `(stage)/setup/manage` — photo/data editing
- `(stage)/overview` — live read-only operator dashboard

**Cast (DM & players):**
- `(cast)/dm` — initiative tracker + Session Panel
- `(cast)/players/[id]` — player character sheet (mobile-first)

**Audience (OBS overlays):**
- `(audience)/persistent/hp` — HP bars
- `(audience)/persistent/conditions` — status conditions
- `(audience)/persistent/turn-order` — initiative strip
- `(audience)/persistent/focus` — character focus card
- `(audience)/moments/dice` — dice roll reveal
- `(audience)/moments/level-up` — level-up celebration
- `(audience)/moments/player-down` — player down alert
- `(audience)/scene` — scene title card
- `(audience)/announcements` — general announcements
- `(audience)/show/lower-third` — lower third graphics
- `(audience)/show/stats` — session stats
- `(audience)/show/recording-badge` — recording indicator
- `(audience)/show/break` — break screen

## Component library (`control-panel/src/lib/`)

```
lib/
  components/
    stage/          ← CharacterCard, DiceRoller, CharacterCreationForm,
                       CharacterManagement, MultiSelect, PhotoSourcePicker
    cast/
      dm/           ← InitiativeStrip, SessionBar, SessionCard
      players/      ← player sheet components
    overlays/       ← OverlayHP, OverlayDice, OverlayConditions,
                       OverlayTurnOrder, OverlaySceneTitle, OverlayCharacterFocus
      moments/      ← OverlayLevelUp, OverlayPlayerDown
      show/         ← OverlayLowerThird, OverlayStats, OverlayBreak, OverlayRecordingBadge
      shared/       ← overlaySocket.svelte.js (singleton for OBS routes)
    shared/         ← headless UI primitives (button, dialog, badge, tooltip, etc.)
    commons/        ← cross-layer shared components
  services/
    socket.js       ← singleton Socket.io client + `characters` / `lastRoll` stores
    utils.js        ← cn(), resolvePhotoSrc()
    router.js       ← hash-based router (legacy, prefer SvelteKit routing)
  contracts/        ← TypeScript type definitions for all domain objects
    records.ts      ← PocketBase record types (Character, NPC, Campaign…)
    events.ts       ← Socket.io event payload types
    stage.ts / cast.ts / overlays.ts / rolls.ts / commons.ts
  data/
    character-options.template.json  ← classes, species, backgrounds, languages
  derived/
    overviewStore.js  ← computed store for the live overview dashboard
```

## Key conventions

- **Runtime:** Use `bun` everywhere — `bun install`, `bun server.js`, `bun run dev`.
- **PocketBase:** All `data/` functions take `pb` as first arg and are `async`. `getOne()` throws on 404 — use try/catch.
- **Socket flow:** Components send REST first; Socket.io broadcast updates shared state. Never mutate stores directly from component logic.
- **Svelte 5 runes:** Use `$state`, `$derived`, `$effect` inside components. Global `characters` / `lastRoll` in `lib/services/socket.js` stay as Svelte writable stores (shared singletons).
- **Overlay socket:** OBS routes import from `lib/components/overlays/shared/overlaySocket.svelte.js` — not from `services/socket.js`.
- **CSS:** Each component has a paired `.css` file. State classes use `is-` prefix. Token variables from `generated-tokens.css` via `var(--token-name)`. Never edit generated CSS directly — edit `design/tokens.json` and run `generate:tokens`.
- **UI library:** `bits-ui` v2 (headless primitives) + `tailwind-variants`. Shared base classes (`.card-base`, `.btn-base`, `.label-caps`) in `app.css`.
- **Animations:** `anime.js` for programmatic effects; CSS transitions for HP bar / collapse.
- **Types:** Import from `$lib/contracts` for all domain types. Do not inline ad-hoc type shapes.
- **Storybook:** Run `bun run storybook` in `control-panel/` before any UI work — component context at `http://localhost:6006`.
- **Servers:** Always stop servers (Ctrl+C) before finishing a task. This is mandatory.

## Required `.env` (root)

```
POCKETBASE_URL=http://127.0.0.1:8090
PB_MAIL=admin@example.com
PB_PASS=yourpassword
PORT=3000
CONTROL_PANEL_ORIGIN=http://localhost:5173
```

## When you find a bug or improvement

Open a GitHub Issue — Notion syncs automatically.

**Area:** `area:frontend` (Svelte, CSS, overlays) · `area:backend` (server.js, API, Socket.io, PocketBase)
**Priority:** `p0` blocking · `p1` this sprint · `p2` next · `p3` someday
**Size:** `size:quick` <1hr · `size:small` 1–3hr · `size:medium` 3–8hr · `size:large` 8+hr

For non-tech items (outreach, session planning) → add directly to Notion, not GitHub.
