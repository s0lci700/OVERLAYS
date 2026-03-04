# CLAUDE.md — TableRelay

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Project name:** TableRelay (repo currently named `OVERLAYS`, rename pending).

<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **OVERLAYS** (2700 symbols, 10383 relationships, 221 execution flows).

## Always Start Here

1. **Read `gitnexus://repo/{name}/context`** — codebase overview + check index freshness
2. **Match your task to a skill below** and **read that skill file**
3. **Follow the skill's workflow and checklist**

> If step 1 warns the index is stale, run `npx gitnexus analyze` in the terminal first.

## Skills

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

---

## Commands

Always use `bun` instead of `npm` for running scripts.

**PocketBase (start before the server):**
- `./pocketbase serve` — starts PocketBase on port 8090; admin UI at `http://127.0.0.1:8090/_/`
- `bun run scripts/seed.js` — seeds the `characters` collection from `data/template-characters.json`; skips if records already exist

**Backend (root):**
- `bun server.js` — start Express + Socket.io on port 3000 (requires PocketBase running + `.env` set)
- `bun run setup-ip` — auto-detect LAN IP and write root `.env` + `control-panel/.env`
- `bun run generate:tokens` — regenerate `control-panel/src/generated-tokens.css` and `public/tokens.css` from `design/tokens.json`; run after editing tokens

**Control panel (`cd control-panel` first):**
- `bun run dev -- --host` — Vite dev server with LAN exposure (port 5173)
- `bun run dev:auto` — runs `setup-ip` + `vite dev --host` in one step
- `bun run lint` — ESLint (eslint-plugin-svelte, flat config v9)
- `bun run test` — Vitest unit tests
- `npx vitest run path/to/file.test.js` — single test file
- `bun run storybook` — Storybook dev server on port 6006
- `bun run build` / `bun run preview` — production build

**E2E:**
- `npx playwright test app.test.js --config tests-log/playwright.config.js`
- Manual API: use `test.http` at the repo root

**Required `.env` variables (root):**
```
POCKETBASE_URL=http://127.0.0.1:8090
PB_MAIL=admin@example.com
PB_PASS=yourpassword
PORT=3000
CONTROL_PANEL_ORIGIN=http://localhost:5173
```

**Start order:** PocketBase → `bun server.js` → `bun run dev -- --host` in control-panel.

---

## Architecture

```
Phone / Tablet
  └── control-panel (SvelteKit + Vite, :5173)
        │  REST fetch + Socket.io client
        ▼
  Node.js server (Express + Socket.io, :3000)
  [data/characters.js] [data/rolls.js]  ← PocketBase SDK wrappers
        │  io.emit broadcasts to ALL clients
        ▼
  PocketBase (:8090, SQLite)
        │
     ┌──┴───────────────────┐
     ▼                      ▼
(audience)/persistent/hp        (audience)/moments/dice
(audience)/persistent/conditions   (OBS Browser Sources — Svelte 5 SvelteKit routes)
(audience)/announcements, /moments/player-down, /moments/level-up
(audience)/show/lower-third, /show/stats, /show/recording-badge, /show/break
```

> **Note:** The vanilla `public/overlay-hp.html`, `overlay-dice.html`, and `overlay-conditions.html` files have been removed. All overlays are now SvelteKit routes under `(audience)/`.

State is persisted in PocketBase (SQLite). `server.js` authenticates as superuser on startup via `connectToPocketBase()`. Every socket connection receives `initialData` (full character roster + roll history fetched live from PocketBase). Overlays **never** send requests — they only listen to Socket.io broadcasts.

**SvelteKit routes** (`control-panel/src/routes/`):

Route groups use `(parens)` — organizational only, not part of URLs.

**(stage)/ — Operator routes:**
- `/` → redirects to `/live/characters`
- `/live/characters` — HP, conditions, resources management
- `/live/dice` — dice roller
- `/setup/create` — character creation form
- `/setup/manage` — photo/data editing, bulk controls
- `/overview` — live read-only operator dashboard

**(cast)/ — DM & Player routes:**
- `/dm` — initiative tracker + SessionCards + SessionBar
- `/players/[id]` — player character sheet (mobile-first)

> **Deprecated routes:** Old routes (`/control/`, `/management/`, `/dashboard/`, `/session/`) have been moved to `control-panel/src/routes/_deprecated/` and are gitignored. They exist as reference only — do not restore them.

**Key files:**
- `server.js` — all Express routes, Socket.io setup, and PocketBase auth on startup
- `data/characters.js` — PocketBase CRUD wrappers: every function takes `(pb, ...)` as first arg and is `async`; exports `getAll`, `createCharacter`, `updateHp`, `updatePhoto`, `updateCharacterData`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources`
- `data/rolls.js` — PocketBase roll log: `getAll(pb)`, `logRoll(pb, {...})`
- `data/template-characters.json` — seed fixture data (4 characters with stable 5-char IDs like `"CH101"`)
- `scripts/seed.js` — one-shot seeder; reads template, authenticates, and creates records idempotently
- `control-panel/src/lib/socket.js` — singleton Socket.io client + shared `characters` (writable) and `lastRoll` (writable) stores
- `design/tokens.json` — canonical token source (never edit the generated CSS files)

---

## Key Conventions

**PocketBase data layer:** All functions in `data/characters.js` and `data/rolls.js` take `pb` as their first argument and are `async` — always `await` them and always pass the `pb` instance. `pb.collection().getOne()` **throws** a `ClientResponseError` on 404 rather than returning `null`, so `if (!result)` guards won't catch missing records — use try/catch for proper 404 handling.

**Socket flow:** Components always send REST first, then the server's Socket.io broadcast updates shared state. Never mutate `characters` or `lastRoll` stores directly from component logic.

**Svelte 5 runes vs stores:** Use `$state`, `$derived`, `$effect` inside components. The global `characters` and `lastRoll` in `socket.js` stay as Svelte writable stores because they are shared singletons across components.

**CSS:** Each component has a paired `.css` file (e.g. `CharacterCard.svelte` + `CharacterCard.css`). Shared base classes (`.card-base`, `.btn-base`, `.label-caps`) live in `app.css`. State classes use BEM-style `is-` prefix (`.is-critical`, `.is-selected`). Token variables come from `generated-tokens.css` via `app.css` — reference as `var(--token-name)`.

**UI library:** `bits-ui` v2 (headless primitives) + `tailwind-variants` for variant styling.

**Animations:** Use `anime.js` (`animejs` package) for programmatic effects (damage flash, dice bounce). CSS transitions handle HP bar width and collapse height.

**Overlay URLs:** Overlays are SvelteKit routes served at `http://[IP]:5173/[path]?server=http://[IP]:3000`. Key routes: `/persistent/hp`, `/persistent/conditions`, `/persistent/turn-order`, `/persistent/focus`, `/moments/dice`, `/moments/player-down`, `/moments/level-up`, `/scene`, `/announcements`, `/show/lower-third`, `/show/stats`, `/show/recording-badge`, `/show/break`. Never hardcode IPs — use `bun run setup-ip` to generate `.env` files.

**OBS setup:** Browser Sources at 1920×1080 with transparent background and "refresh when scene becomes active" enabled.

**DOM mapping:** Overlays use `data-char-id` attributes to locate nodes. When `hp_updated` arrives, only the matching node is mutated. Preserve `data-char-id` on any new overlay elements.

---

## Server Management

- **Start order:** PocketBase first (`./pocketbase serve`), then Node.js server (`bun server.js`), then control panel (`bun run dev -- --host`). The server will `process.exit(1)` if PocketBase auth fails on startup.
- **Always close servers** (Ctrl+C) to free ports before finishing a task. If you start a server during a task, stop it before you end the response. This is mandatory.

---

## UI Development

Before doing any UI or frontend work, check Storybook for component context and story URLs. Storybook runs at `http://localhost:6006` (`cd control-panel && bun run storybook`).

## Additional References

- `docs/ARCHITECTURE.md` — full data-flow diagrams and file map
- `docs/SOCKET-EVENTS.md` — complete Socket.io event payloads
- `docs/DESIGN-SYSTEM.md` — CSS tokens, component states, animation reference
- `docs/ENVIRONMENT.md` — `.env` setup, IP configuration
- `docs/THEMING.md` — token generator usage and live theme editor
- `docs/INDEX.md` — fast file map and entry points
