# CLAUDE.md — control-panel

This file provides guidance to Claude Code (claude.ai/code) when working inside `control-panel/`.

> Frontend layer of the **Dados & Risas / TableRelay** system. SvelteKit + Svelte 5 app serving all five product surfaces (Stage, Cast/DM, Cast/Players, Commons, Audience overlays). See the root `CLAUDE.md` for backend, architecture, and agent rules.

---

## Commands

Run from `control-panel/`:

- `bun run dev -- --host` — Vite dev server with LAN exposure (port 5173)
- `bun run dev:auto` — runs `setup-ip` + `vite dev --host` in one step
- `bun run lint` — ESLint (eslint-plugin-svelte, flat config v9)
- `bun run format` — Prettier write pass
- `bunx svelte-check` — type-check all Svelte files (use before committing UI changes)
- `bun run test` — Vitest unit tests
- `npx vitest run path/to/file.test.js` — single test file
- `bun run storybook` — Storybook dev server on port 6006
- `bun run build` / `bun run preview` — production build

Before any UI work, check Storybook (`bun run storybook`) for existing component context.

---

## SvelteKit Routes

Route groups use `(parens)` — organizational only, not part of URLs.

**`(stage)/` — Operator (write authority):**

- `/live/characters` — HP, conditions, resources management
- `/live/dice` — dice roller
- `/setup/create` — character creation form
- `/setup/manage` — photo/data editing, bulk controls
- `/overview` — live read-only operator dashboard

**`(cast)/` — DM & Players:**

- `/dm` — initiative tracker + SessionCards + SessionBar
- `/players/[id]` — player character sheet (mobile-first)

**`(commons)/` — Shared room display (passive, no controls):**

- `/session-display` — party status wallboard (to be created — Phase 3)

**`(audience)/` — OBS Browser Sources (listen-only):**

- `/persistent/hp`, `/persistent/conditions`, `/persistent/turn-order`, `/persistent/focus`
- `/moments/dice`, `/moments/level-up`, `/moments/player-down`
- `/scene`, `/announcements`
- `/show/lower-third`, `/show/stats`, `/show/recording-badge`, `/show/break`

> Deprecated routes (`/control/`, `/management/`, `/dashboard/`, `/session/`) are in `src/routes/_deprecated/` — do not restore them.

**Overlay URLs** are served as `http://[IP]:5173/[path]?server=http://[IP]:3000`. Never hardcode IPs — use `bun run setup-ip`.

**OBS setup:** Browser Sources at 1920×1080, transparent background, "refresh when scene becomes active" enabled.

---

## Component Library (`src/lib/`)

```text
lib/
  components/
    stage/          ← CharacterCard, DiceRoller, CharacterCreationForm,
                       CharacterManagement, MultiSelect, PhotoSourcePicker
    cast/
      dm/           ← InitiativeStrip, SessionBar, SessionCard
      players/      ← player sheet components
    commons/        ← cross-surface shared components
    overlays/       ← OverlayHP, OverlayDice, OverlayConditions,
                       OverlayTurnOrder, OverlaySceneTitle, OverlayCharacterFocus
      moments/      ← OverlayLevelUp, OverlayPlayerDown
      show/         ← OverlayLowerThird, OverlayStats, OverlayBreak, OverlayRecordingBadge
      shared/       ← overlaySocket.svelte.js (singleton for OBS routes only)
    shared/         ← headless primitives (button, dialog, badge, tooltip, DieSpinner, etc.)
  services/
    errors.ts       ← ServiceError class — standard error shape for all service throws
    socket.ts       ← typed Socket.io client (new canonical; socket.js is legacy)
    pocketbase.ts   ← typed PocketBase client wrapper
    socket.js       ← legacy singleton Socket.io client + `characters` / `lastRoll` stores
    utils.js        ← cn(), resolvePhotoSrc()
  contracts/        ← TypeScript boundary modules (records.ts, events.ts, stage.ts,
                       cast.ts, overlays.ts, rolls.ts, commons.ts)
  derived/
    overviewStore.js  ← computed store for the live overview dashboard
  data/
    character-options.template.json  ← classes, species, backgrounds, languages
```

---

## Key Conventions

**Current vs Legacy Patterns:**

| Pattern | Current (use this) | Legacy (do not extend) |
| ------- | ------------------ | ---------------------- |
| Socket client | `lib/services/socket.ts` | `lib/services/socket.js` |
| Stage mutations | `lib/derived/stage.svelte.ts` | Direct REST calls in CharacterCard |
| Overlay socket | `lib/components/overlays/shared/overlaySocket.svelte.ts` | Any direct socket.io import in overlay files |

Rule: `.ts` = current, `.js` = legacy. Never add logic to `.js` files.

**Svelte 5 runes:** Use `$state`, `$derived`, `$effect`, `$props` inside components. The global `characters` and `lastRoll` in `lib/services/socket.js` stay as Svelte writable stores — they are shared singletons across the entire app.

**Socket flow:** Components send REST first; Socket.io broadcast updates shared state. Never mutate `characters` or `lastRoll` directly from component logic.

**Overlay socket:** OBS routes (`(audience)/`) import from `lib/components/overlays/shared/overlaySocket.svelte.js` — **not** from `lib/services/socket.js`.

**TypeScript contracts:** Import all domain types from `$lib/contracts`. Do not define ad-hoc inline type shapes.

**Service errors:** All service throws use `ServiceError` from `$lib/services/errors`. Catch with `instanceof ServiceError` and branch on `err.code` (`'NOT_FOUND'` | `'UNAUTHORIZED'` | `'VALIDATION'` | `'NETWORK'` | `'CONFIG'` | `'UNKNOWN'`).

**Socket event types:** `EventPayloadMap` in `$lib/contracts/events` maps every Socket.io event name to its payload type. Use it as the generic parameter in typed subscribe/emit calls.

**CSS:** Each component has a paired `.css` file (e.g. `CharacterCard.svelte` + `CharacterCard.css`). Shared base classes (`.card-base`, `.btn-base`, `.label-caps`) live in `app.css`. State classes use `is-` prefix (`.is-critical`, `.is-selected`). Token variables come from `generated-tokens.css` via `app.css` — reference as `var(--token-name)`. Never edit generated CSS — edit `design/tokens.json` and run `bun run generate:tokens` at the repo root.

**DOM mapping:** Overlays use `data-char-id` attributes to locate nodes. When `hp_updated` arrives, only the matching node is mutated. Preserve `data-char-id` on any new overlay elements.

**UI library:** `bits-ui` v2 (headless primitives) + `tailwind-variants` for variant styling.

**Animations:** Use `anime.js` (`animejs`) for programmatic effects (damage flash, dice bounce). CSS transitions for HP bar width and collapse height.

**GSAP gotcha:** When using MorphSVG in a conditionally rendered component, reset tracking variables (e.g. `prevX = null`) inside `onDestroy` / the cleanup return of `$effect`. Without this, remounting renders a blank path.

**SSR gotcha:** `$state` and other runes cannot be initialized in plain `.ts` files — Vite will crash at SSR. Move reactive files to `.svelte.ts` and import them with the `.svelte.ts` extension explicitly.

---

## Storybook

Storybook mirrors the product surfaces: `Stage/`, `Cast/DM/`, `Cast/Players/`, `Commons/`, `Audience/`, `Shared/`.

Stories use **mock view-models** — no PocketBase, no Socket.io. Stories must run in full isolation. See `docs/` inside `control-panel/` for canonical mock fixture specs.
