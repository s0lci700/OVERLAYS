# Copilot instructions

## Quick index

- See `docs/INDEX.md` for the fast file map, entry points, and do-not-edit paths.
- See `docs/ARCHITECTURE.md` for data-flow diagrams and full file map.
- See `docs/SOCKET-EVENTS.md` for complete Socket.io event payloads.
- See `docs/DESIGN-SYSTEM.md` for CSS tokens, component states, and animation reference.

## Build, test, and lint commands

- **Root backend** (Node.js/Express/Socket.io):
  - `npm install`
  - `npm run setup-ip` — auto-detects local IP and generates root `.env` + `control-panel/.env`.
  - `node server.js` — starts Express + Socket.io on `PORT` (default 3000).
  - No automated tests on the backend; use `test.http` at the root or `curl http://localhost:3000/api/characters` for manual verification.
- **Control panel** (`cd control-panel` first):
  - `npm run dev -- --host` — Vite dev server with LAN exposure for phone access.
  - `npm run dev:auto` — runs `setup-ip` + `vite dev --host` in one step.
  - `npm run build` / `npm run preview` — production build.
  - `npm run lint` — ESLint (eslint-plugin-svelte + eslint v9 flat config).
  - `npm test` — Vitest (runs all unit tests).
  - `npx vitest run path/to/file.test.js` — run a single test file.
  - `npm run storybook` — Storybook dev server on port 6006.
- **Design tokens**: `bun run generate:tokens` (at repo root) — regenerates `control-panel/src/generated-tokens.css` and `public/tokens.css` from `design/tokens.json`. Always run after editing tokens.
- **Playwright E2E**: `npx playwright test app.test.js --config tests-log/playwright.config.js` (logs saved under `tests-log/`).

## High-level architecture

```
Phone / Tablet
  └── control-panel (SvelteKit + Vite, port 5173) – Socket.io client + REST calls for HP/rolls, mobile-first UI, reuses a singleton socket store.
        │
        │  HTTP PUT /api/characters/:id/hp  (CharacterCard)  &  POST /api/rolls (DiceRoller)
        ▼
  Node.js server (Express + Socket.io, port 3000)
        │
        │  REST API + `io.emit` broadcasts (`initialData`, `hp_updated`, `dice_rolled`)
        ▼
  `public/overlay-hp.html` + `public/overlay-dice.html` (OBS Browser Sources, load Socket.io via CDN and listen for `hp_updated` / `dice_rolled` to mutate DOM by `data-char-id` attributes)
```

- The server keeps `characters` and `rolls` in-memory and seeds each socket with `initialData` on connect; every REST update broadcasts via Socket.io so overlays and the control panel stay in sync.
- The `control-panel/src/lib/socket.js` file exports the singleton `socket`, `characters` store, and `lastRoll` store so every component shares the same connection and state.
- Overlays rely on the same `serverPort` host (and Socket.io v4.8.3 via CDN) and mutate DOM nodes marked with `data-char-id` to reflect live HP/roll updates.

## SvelteKit routing

- File-based routes live in `control-panel/src/routes`.
- Redirect: `src/routes/+page.svelte` routes `/` to `/control/characters`.
- Layout shell: `src/routes/+layout.svelte` provides the app chrome (header/sidebar).
- Control tabs: `src/routes/control/+layout.svelte` + pages at `/control/characters` and `/control/dice`.
- Management tabs: `src/routes/management/+layout.svelte` + pages at `/management/create` and `/management/manage`.

## Key conventions

- **IP alignment**: use `npm run setup-ip` to generate root `.env` and `control-panel/.env`. Overlays read the server URL from the `?server=` query parameter (default `http://localhost:3000`).
- **Socket flow**: `socket.on('initialData')` bootstraps the `characters` store. Components always send a REST request first, then rely on the resulting Socket.io broadcast to update shared state — never mutate stores directly from component logic.
- **DOM mapping**: Overlays use `data-char-id` attributes to locate nodes in the DOM. When `hp_updated` arrives, only the matching node is mutated. Keep `data-char-id` populated if adding new overlays.
- **Svelte 5 runes**: The control panel uses Svelte 5 runes (`$state`, `$derived`, `$effect`) throughout — not the legacy `writable`/`readable` store API inside components. The global `characters` and `lastRoll` stores in `socket.js` remain Svelte writable stores because they are shared singletons.
- **CSS architecture**: Each Svelte component has a paired `.css` file (e.g. `CharacterCard.svelte` + `CharacterCard.css`). Shared base classes (`.card-base`, `.btn-base`, `.label-caps`) live in `app.css` — extend them instead of re-implementing. Design tokens are defined in `design/tokens.json` and generated into `control-panel/src/generated-tokens.css` and `public/tokens.css`; never edit the generated files directly.
- **State modifier naming**: BEM-style `is-` prefix for all boolean state classes (`.is-critical`, `.is-selected`, `.is-crit`, `.is-fail`). The outlier `.collapsed` on `.char-card` is a known issue; use `.is-collapsed` on new work.
- **UI component library**: The control panel uses `bits-ui` v2 (headless primitives) + `tailwind-variants` for variant styling. shadcn/svelte aliases are set up in `app.css`.
- **Animations**: Use `anime.js` (already imported via the `animejs` package) for programmatic animations (damage flash, dice bounce). CSS transitions handle HP bar width and collapse height.
- **Manual testing helpers**: Use `test.http` at the root for quick `GET /api/characters`, `PUT /api/characters/:id/hp`, and `POST /api/rolls` requests with pre-filled demo payloads.

## Server handling

- **Running servers**: Start the Node.js server first (`node server.js`), then run the Svelte control panel on ./control-panel (`npm run dev -- --host`).
- **Closing Servers**: After running server instances remember to always close them properly (Ctrl+C in terminal) to free up ports and avoid conflicts on next run.
- **Agent reminder**: If you start a server during a task, stop it before you finish the response. This is mandatory for all agents.

## UI development

Before doing any UI or frontend work, call the Storybook MCP server to get component context and story URLs. Storybook runs at `http://localhost:6006` (`cd control-panel && npm run storybook`).

## Additional references

- The README and CLAUDE.md describe the demo priorities, OBS setup (1920×1080, transparent backgrounds, “refresh when scene becomes active”), and the project’s MVP checklist. Refer to them before updating the overlays or control panel UI.
- The `.github/workflows/check-progress.yml` job parses `PROGRESS.md` on every push; keep that file’s sections intact if you need the progress reporting to stay green.
