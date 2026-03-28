---
title: Project Index
type: reference
source_files: []
last_updated: 2026-03-25
---

# Project Index

> Last updated: 2026-03-25. Quick navigation for file locations, entry points, and how the system hangs together.

## Primary entry points

| Process | Command | Port |
| ------- | ------- | ---- |
| PocketBase | `.\pocketbase.exe serve` | 8090 |
| Backend server | `bun server.ts` | 3000 |
| Control panel (dev) | `cd control-panel && bun run dev -- --host` | 5173 |
| Storybook | `cd control-panel && bun run storybook` | 6006 |

**Start order:** PocketBase → `bun server.ts` → `bun run dev -- --host`

## Backend (`/`)

| File | Purpose |
| ---- | ------- |
| `server.ts` | Thin entry point — Express, Socket.io init, PocketBase auth, seed, token refresh |
| `src/server/pb.ts` | PocketBase singleton + `connectToPocketBase`, `ensureAuth` |
| `src/server/seed.ts` | Seeds empty collections on startup (`seedIfEmpty`) |
| `src/server/router.ts` | Express Router — all 20 REST routes mounted here |
| `src/server/handlers/characters.ts` | All `/api/characters/*` handlers |
| `src/server/handlers/encounter.ts` | `/api/encounter/*` handlers |
| `src/server/handlers/overlay.ts` | `announce`, `levelUp`, `playerDown`, `lowerThird` |
| `src/server/handlers/rolls.ts` | `POST /api/rolls` |
| `src/server/handlers/misc.ts` | info, tokens, sync-start, scene, character-focus |
| `src/server/socket/index.ts` | `initSocket(io)` — connection handler + `initialData` |
| `src/server/socket/rooms.ts` | `broadcast()` — all `io.emit` calls + JSONL sidecar logger |
| `src/server/socket/events/` | Phase 2 stubs: `character.ts`, `combat.ts`, `session.ts` |
| `src/server/state/encounter.ts` | In-memory encounter state (get/set) |
| `src/server/state/scene.ts` | In-memory scene + focused character state (get/set) |
| `src/server/data/characters.ts` | PocketBase character CRUD (`getAll`, `findById`, `createCharacter`, `updateHp`, `updatePhoto`, `updateCharacterData`, `addCondition`, `removeCondition`, `removeCharacter`, `updateResource`, `restoreResources`) |
| `src/server/data/rolls.ts` | PocketBase roll log (`getAll`, `logRoll`) |
| `src/server/data/id.ts` | 5-char ID generator (`createShortId`) |
| `scripts/setup-ip.js` | Detects LAN IP and writes root `.env` + `control-panel/.env` |

## Control panel (`control-panel/src/`)

### Routes

| Route | File | Surface |
| ----- | ---- | ------- |
| `/live/characters` | `routes/(stage)/live/characters/+page.svelte` | Stage |
| `/live/dice` | `routes/(stage)/live/dice/+page.svelte` | Stage |
| `/setup/create` | `routes/(stage)/setup/create/+page.svelte` | Stage |
| `/setup/manage` | `routes/(stage)/setup/manage/+page.svelte` | Stage |
| `/overview` | `routes/(stage)/overview/+page.svelte` | Stage |
| `/dm` | `routes/(cast)/dm/+page.svelte` | Cast/DM |
| `/players/[id]` | `routes/(cast)/players/[id]/+page.svelte` | Cast/Players |
| `/persistent/hp` | `routes/(audience)/persistent/hp/+page.svelte` | Audience |
| `/persistent/conditions` | `routes/(audience)/persistent/conditions/+page.svelte` | Audience |
| `/persistent/turn-order` | `routes/(audience)/persistent/turn-order/+page.svelte` | Audience |
| `/persistent/focus` | `routes/(audience)/persistent/focus/+page.svelte` | Audience |
| `/moments/dice` | `routes/(audience)/moments/dice/+page.svelte` | Audience |
| `/moments/level-up` | `routes/(audience)/moments/level-up/+page.svelte` | Audience |
| `/moments/player-down` | `routes/(audience)/moments/player-down/+page.svelte` | Audience |
| `/scene` | `routes/(audience)/scene/+page.svelte` | Audience |
| `/announcements` | `routes/(audience)/announcements/+page.svelte` | Audience |
| `/show/lower-third` | `routes/(audience)/show/lower-third/+page.svelte` | Audience |
| `/show/stats` | `routes/(audience)/show/stats/+page.svelte` | Audience |
| `/show/recording-badge` | `routes/(audience)/show/recording-badge/+page.svelte` | Audience |
| `/show/break` | `routes/(audience)/show/break/+page.svelte` | Audience |

### Services (`lib/services/`)

| File | Purpose |
| ---- | ------- |
| `pocketbase.ts` | Typed PocketBase client singleton + `getCharacterRecord`, `updateCharacterRecord` |
| `socket.ts` | Typed Socket.io client — `connectSocket`, `disconnectSocket`, `subscribe`, `emit`, `socketStatus` |
| `character.ts` | Character facade — `getCharacter`, `subscribeToCharacterUpdates` |
| `errors.ts` | `ServiceError` class — codes: `CONFIG`, `NOT_FOUND`, `VALIDATION`, `UNAUTHORIZED`, `NETWORK`, `UNKNOWN` |
| `broadcast/index.ts` | `getBroadcastAdapter(config)` factory — returns `MockBroadcastAdapter` for mock, throws for obs/vmix (TASK-5.6) |
| `broadcast/mock.ts` | `MockBroadcastAdapter` — logs all calls, no real connection; use for dev and Storybook |
| `broadcast/obs.ts` | OBS WebSocket adapter stub — TASK-5.6 |
| `broadcast/vmix.ts` | vMix TCP adapter stub — TASK-5.6 |
| `socket.js` | Legacy singleton + `characters` / `lastRoll` Svelte stores (stage routes only) |
| `utils.js` | `cn()` (class merge), `resolvePhotoSrc()` |
| `router.js` | Route/hash helpers |

### Contracts (`lib/contracts/`)

| File | Purpose |
| ---- | ------- |
| `broadcast.ts` | `BroadcastAdapter` interface, `BroadcastConfig`, `BroadcastStatus`, `BroadcastEvent`, `TallyState` |
| `records.ts` | `CharacterRecord`, `ResourceSlot`, `CampaignRecord`, `SessionRecord` |
| `events.ts` | `EventPayloadMap` + all Socket.io payload interfaces + event name constants |
| `stage.ts` | Stage surface view-model types |
| `cast.ts` | `CharacterLiveState` and Cast surface types |
| `overlays.ts` | Overlay surface view-model types |
| `rolls.ts` | Roll record types |
| `commons.ts` | Commons surface types |
| `index.ts` | Barrel re-export |

### Components (`lib/components/`)

| Directory | Components |
| --------- | ---------- |
| `stage/` | `CharacterCard`, `DiceRoller`, `CharacterCreationForm`, `CharacterManagement`, `CharacterProfileForm`, `MultiSelect`, `PhotoSourcePicker`, `AssetsGallery` |
| `cast/dm/` | `InitiativeStrip`, `SessionCard`, `SessionBar`, `DMPanel` |
| `cast/player-sheet/` | Player sheet components |
| `overlays/` | `OverlayHP`, `OverlayDice`, `OverlayConditions`, `OverlayTurnOrder`, `OverlayCharacterFocus`, `OverlaySceneTitle`, `OverlayAnnounce`, `OverlayLevelUp`, `OverlayPlayerDown`, `OverlayLowerThird`, `OverlayStats`, `OverlayBreak`, `OverlayRecordingBadge` |
| `overlays/shared/` | `overlaySocket.svelte.ts` — socket factory for OBS overlay routes |
| `shared/` | `button`, `badge`, `dialog`, `tooltip`, `condition-pill`, `stat-display`, `stepper`, `read-only-field`, `selection-pill-list`, and others |

### Derived state (`lib/derived/`)

| File | Purpose |
| ---- | ------- |
| `overviewStore.js` | Activity history + computed dashboard state |

## Storybook (`.storybook/`)

| File | Purpose |
| ---- | ------- |
| `main.js` | Framework config — `@storybook/sveltekit`, story glob, addons |
| `preview.js` | Global styles import (`app.css`), a11y config |
| `manager.js` | Branded dark theme (Dados & Risas colors) |
| `README.md` | Story writing guide, mock data strategy, surface map |

Stories are colocated with components as `ComponentName.stories.svelte`.

## Core flows

- **HP update:** `CharacterCard` → `PUT /api/characters/:id/hp` → `hp_updated` event → all clients
- **Dice roll:** `DiceRoller` → `POST /api/rolls` → `dice_rolled` event → all clients
- **Overlays:** listen-only; never send requests; socket via `createOverlaySocket(serverUrl)`

## Configuration

| File | Purpose |
| ---- | ------- |
| `.env` (root) | `PORT`, `POCKETBASE_URL`, `PB_MAIL`, `PB_PASS`, `CONTROL_PANEL_ORIGIN` |
| `control-panel/.env` | `VITE_SERVER_URL`, `VITE_PORT` |
| `design/tokens.json` | Canonical token source — run `bun run generate:tokens` after editing |

## References

- `docs/API.md` — REST endpoints + frontend services reference (auto-generated)
- `docs/ARCHITECTURE.md` — data flows, API routes, design decisions
- `docs/DATA-FLOW.md` — full PocketBase → server → client flow, SSR vs live paths, key boundaries
- `docs/SOCKET-EVENTS.md` — complete Socket.io event payloads
- `docs/DESIGN-SYSTEM.md` — CSS tokens, typography, component style guide
- `docs/ENVIRONMENT.md` — `.env` setup, IP configuration, Railway deployment
- `control-panel/.storybook/README.md` — Storybook usage and mock data strategy
