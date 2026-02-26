# DADOS & RISAS — Codebase Reference

> **Purpose:** Shareable reference document for collaborators, LLMs, and planning conversations.
> **As of:** February 26, 2026
> **Branch:** `claude/create-codebase-docs-iJHMu`
> **Repo:** https://github.com/s0lci700/OVERLAYS

---

## Index

1. [Project Overview & Current Status](#1-project-overview--current-status)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Backend — `server.js`](#4-backend--serverjs)
5. [Data Layer — `data/`](#5-data-layer--data)
6. [OBS Overlays — `public/`](#6-obs-overlays--public)
7. [Control Panel — `control-panel/`](#7-control-panel--control-panel)
   - [App Shell & Routing](#71-app-shell--routing)
   - [Socket Layer — `socket.js`](#72-socket-layer--socketjs)
   - [Dashboard Store](#73-dashboard-store--dashboardstorejs)
   - [UI Components (lib/)](#74-ui-components--lib)
   - [shadcn-svelte Components](#75-shadcn-svelte-components)
8. [Real-Time Data Flow](#8-real-time-data-flow)
9. [REST API Reference](#9-rest-api-reference)
10. [Socket.io Events Reference](#10-socketio-events-reference)
11. [Character Data Schema](#11-character-data-schema)
12. [Supporting Files & Scripts](#12-supporting-files--scripts)
13. [Testing & QA Infrastructure](#13-testing--qa-infrastructure)
14. [Current Limitations & Known Gaps](#14-current-limitations--known-gaps)
15. [Game-Dev System Inspirations for Future Development](#15-game-dev-system-inspirations-for-future-development)
    - [Slay the Spire Systems](#151-slay-the-spire-systems)
    - [Baldur's Gate 3 Systems](#152-baldurs-gate-3-systems)
    - [Integration Roadmap](#153-integration-roadmap)

---

## 1. Project Overview & Current Status

**DADOS & RISAS** is a real-time D&D session management system built as a technical pitch demo for ESDH (El Show de Héctor, 400K+ YouTube channel). The goal was to prove capability to build custom production tools for live-streaming tabletop RPG sessions.

### What it is

A three-layer system:
- **Server** — Node.js backend that is the single source of truth for all game state
- **Control Panel** — Mobile-first Svelte web app used by the DM/players during play
- **OBS Overlays** — Transparent HTML pages loaded as Browser Sources in OBS Studio

### Current Status: MVP Complete ✅

All core MVP features are working and have been tested end-to-end:

| Feature | Status |
|---|---|
| Express + Socket.io server | ✅ Stable |
| Real-time HP updates (phone → OBS, <100ms) | ✅ Working |
| HP bar overlay with color states | ✅ Working |
| Dice roll overlay with crit/fail animations | ✅ Working |
| Svelte control panel (mobile + desktop) | ✅ Working |
| Character creation form | ✅ Working |
| Character management (edit, photo, delete) | ✅ Working |
| Conditions system (add/remove status effects) | ✅ Working |
| Resource pool system (spell slots, ki, etc.) | ✅ Working |
| Short/long rest resource restoration | ✅ Working |
| Live dashboard view | ✅ Working |
| Multi-client real-time sync | ✅ Working |
| LAN access (phone on local network) | ✅ Working |

**What's NOT built yet (post-demo):**
- Database persistence (all state is in-memory — restarting server resets data)
- User authentication / role-based access
- Initiative / combat turn tracker
- NPC/enemy stat blocks
- Campaign notes / session log
- Spell compendium
- SQLite or external DB
- Conditions overlay for OBS

---

## 2. Technology Stack

### Backend
| Dependency | Version | Role |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.x | HTTP server and REST API |
| Socket.io | 4.8.x | WebSocket server |
| cors | 2.8.x | Cross-origin headers |
| dotenv | 17.x | Environment config |

### Control Panel (Frontend)
| Dependency | Version | Role |
|---|---|---|
| Svelte | 5.x | UI framework (uses runes: `$state`, `$derived`, `$props`) |
| SvelteKit | 2.x | Routing, SSR adapter |
| Vite | 7.x | Dev server and bundler |
| socket.io-client | 4.8.x | WebSocket client |
| animejs | 4.3.x | Animations (HP flash, dice bounce) |
| Tailwind CSS | 4.x | Utility CSS |
| bits-ui | 2.x | Headless UI primitives |
| shadcn-svelte | (via bits-ui) | Component library (Dialog, Button, Input, Label, etc.) |

### Overlays
| Technology | Role |
|---|---|
| Vanilla HTML/CSS/JS | Overlay pages (lightweight, OBS-compatible) |
| socket.io CDN v4.8.3 | Real-time updates inside OBS Browser Sources |

### Dev / Tooling
| Tool | Role |
|---|---|
| Bun | Package manager and script runner |
| Playwright | End-to-end tests |
| Vitest | Unit tests (control panel) |
| Storybook 10.x | Component development and visual testing |
| Prettier | Code formatting |

---

## 3. Directory Structure

```
OVERLAYS/                          ← Project root
│
├── server.js                      ← Main backend entry point (Express + Socket.io)
├── package.json                   ← Root dependencies (server + tooling)
├── bun.lock                       ← Bun lockfile
├── .env.example                   ← Environment variable template
├── CLAUDE.md                      ← AI context file (project rules for LLMs)
├── CODEBASE-REFERENCE.md          ← This file
├── PROGRESS.md                    ← Day-by-day dev log
├── TODO.md                        ← Feature checklist
├── TRACKER.md                     ← One-page status tracker for sharing
├── README.md                      ← Full project README
├── app.test.js                    ← Root-level API integration tests (Playwright)
├── playwright.config.js           ← Playwright test configuration
├── jsdoc.json                     ← JSDoc generation config
├── test.http                      ← HTTP scratch file for manual API testing
├── test_response.json             ← Saved API test response
├── start-demo.sh / .bat           ← One-command demo startup scripts (Linux/Windows)
├── create-page-snapshot.yaml      ← Playwright snapshot config
├── manage-snapshot.yaml           ← Playwright snapshot config
│
├── data/                          ← In-memory data modules (server-side)
│   ├── characters.js              ← Character store + all CRUD helpers
│   ├── rolls.js                   ← Dice roll log
│   ├── resources.js               ← Standalone resource definitions (unused, legacy)
│   ├── state.js                   ← Snapshot aggregator (unused by server, available for future)
│   ├── id.js                      ← Short ID generator (5-char, no-ambiguity alphabet)
│   ├── photos.js                  ← Random photo assignment utility
│   ├── template-characters.json   ← Default demo character roster (4 characters)
│   └── test_characters.js         ← Test fixtures for automated tests
│
├── public/                        ← Served statically at http://server:3000/
│   ├── index.html                 ← Landing page (dynamically shows server IP/URLs)
│   ├── overlay-hp.html            ← HP bars overlay (OBS Browser Source)
│   ├── overlay-hp.css             ← HP overlay styles
│   ├── overlay-dice.html          ← Dice result popup overlay (OBS Browser Source)
│   ├── overlay-dice.css           ← Dice overlay styles
│   ├── overlay-conditions.html    ← Conditions overlay (exists, not yet wired)
│   └── tokens.css                 ← Shared CSS design tokens
│
├── assets/
│   └── img/                       ← Character portrait images
│       ├── barbarian.png
│       ├── dwarf.png
│       ├── elf.png
│       ├── thiefling.png
│       └── wizard.png
│
├── scripts/
│   ├── setup-ip.js                ← Auto-detects LAN IP, writes .env + control-panel/.env
│   ├── build-dist.sh / .bat       ← Build scripts for distribution
│
├── docs/                          ← Extended documentation and design files
│   ├── INDEX.md                   ← Docs directory index
│   ├── ARCHITECTURE.md            ← System architecture deep-dive
│   ├── API-STRUCTURE.md           ← API design reference
│   ├── SOCKET-EVENTS.md           ← Socket.io event reference
│   ├── DESIGN-SYSTEM.md           ← Visual design tokens and principles
│   ├── DESIGN-CRITIQUE.md         ← UI/UX review notes
│   ├── SHADCN-MIGRATION.md        ← Migration log for shadcn-svelte components
│   ├── UI-PATTERN-ANALYSIS.md     ← UI pattern research
│   ├── UI-PATTERN-LOCATIONS.md    ← Where UI patterns appear in code
│   ├── DEVELOPER-HANDOFF.md       ← Onboarding guide for new developers
│   ├── CHARACTER-CREATION-PLAN.md ← Character creation feature design
│   ├── BUN-MIGRATION.md           ← npm → Bun migration notes
│   ├── ENVIRONMENT.md             ← Environment variable reference
│   ├── DAY2_COMPLETION_REPORT.md  ← Day 2 build report
│   ├── CONTEXTO_COMPLETO_PITCH.md ← Full pitch context (Spanish)
│   ├── DnD 5e OBS Overlay Database Design.md ← DB schema design for future persistence
│   ├── character-options.template.json ← All valid values for dropdowns (class, species, etc.)
│   └── testing.md                 ← Testing strategy notes
│
├── ROADMAPS/                      ← .docx roadmap files
│   ├── COMPLETE_DEVELOPMENT_ROADMAP.docx
│   └── CRASH_COURSE_3_DAY_DEMO.docx
│
├── backups/                       ← Auto-saved file backups
│   └── Dialog.stories.svelte.backup.2026-02-26T150000.txt
│
├── stress/                        ← k6 load test scripts
│   ├── api.js                     ← API endpoint stress tests
│   └── control-panel.js           ← Control panel load tests
│
└── control-panel/                 ← Svelte/SvelteKit frontend application
    ├── package.json               ← Frontend dependencies
    ├── vite.config.js             ← Vite + Tailwind config
    ├── svelte.config.js           ← SvelteKit adapter config (bun adapter)
    ├── .env / .env.example        ← VITE_SERVER_URL config
    │
    └── src/
        ├── app.html               ← HTML shell with %sveltekit.body%
        ├── app.css                ← Global CSS (reset, typography, app shell)
        ├── app.d.ts               ← TypeScript ambient declarations
        ├── main.js                ← Entry point (mounts App.svelte)
        ├── App.svelte             ← Root Svelte component
        │
        ├── routes/                ← SvelteKit file-based routing
        │   ├── +layout.svelte     ← Root layout: header, sidebar, shell
        │   ├── +page.svelte       ← Root redirect → /control/characters
        │   ├── control/           ← /control/* — active gameplay routes
        │   │   ├── +layout.svelte ← Control section layout
        │   │   ├── characters/    ← /control/characters
        │   │   │   └── +page.svelte  ← Character cards list + HP/conditions/resources
        │   │   └── dice/          ← /control/dice
        │   │       └── +page.svelte  ← Dice roller interface
        │   ├── management/        ← /management/* — character admin routes
        │   │   ├── +layout.svelte ← Management section layout
        │   │   ├── create/        ← /management/create
        │   │   │   └── +page.svelte  ← Character creation form
        │   │   └── manage/        ← /management/manage
        │   │       └── +page.svelte  ← Edit existing characters + delete
        │   └── dashboard/         ← /dashboard
        │       └── +page.svelte   ← Read-only live dashboard (TV/monitor view)
        │
        ├── lib/                   ← Shared components, stores, utilities
        │   ├── socket.js          ← Socket.io singleton + character/lastRoll stores
        │   ├── dashboardStore.js  ← Pending actions queue + activity history log
        │   ├── router.js          ← Client-side routing helpers
        │   ├── utils.js           ← resolvePhotoSrc and other helpers
        │   │
        │   ├── CharacterCard.svelte       ← Per-character HP, conditions, resources, rest
        │   ├── CharacterCard.css
        │   ├── CharacterCreationForm.svelte ← Full character creation form
        │   ├── CharacterCreationForm.css
        │   ├── CharacterManagement.svelte   ← Edit/delete characters
        │   ├── CharacterManagement.css
        │   ├── CharacterBulkControls.svelte ← Multi-select bulk actions
        │   ├── CharacterBulkControls.css
        │   ├── DiceRoller.svelte            ← d4–d20 roller with modifiers
        │   ├── DiceRoller.css
        │   ├── DashboardCard.svelte         ← Character summary card for dashboard
        │   ├── DashboardCard.css
        │   ├── Dashboard.css                ← Dashboard layout styles
        │   ├── MultiSelect.svelte           ← Accessible multi-select dropdown
        │   ├── MultiSelect.css
        │   ├── PhotoSourcePicker.svelte     ← Preset/URL/local file photo selector
        │   ├── PhotoSourcePicker.css
        │   │
        │   ├── components/ui/              ← shadcn-svelte + custom UI primitives
        │   │   ├── alert-dialog/           ← Confirmation dialogs
        │   │   ├── badge/                  ← Status badges
        │   │   ├── button/                 ← Button variants
        │   │   ├── collapsible/            ← Collapsible sections
        │   │   ├── condition-pill/         ← Removable condition tag
        │   │   ├── dialog/                 ← Modal dialogs
        │   │   ├── form/                   ← Form field wrappers
        │   │   ├── input/                  ← Text inputs
        │   │   ├── label/                  ← Form labels
        │   │   ├── pills/                  ← Level pills, selection pills
        │   │   ├── read-only-field/        ← Display-only form field
        │   │   ├── selection-pill-list/    ← List of selectable pills
        │   │   ├── stat-display/           ← Stat block display (AC, speed)
        │   │   ├── stepper/                ← Numeric +/- stepper input
        │   │   └── tooltip/               ← Hover tooltips
        │   │
        │   └── stories/                    ← Storybook component stories
        │       └── *.stories.svelte
```

---

## 4. Backend — `server.js`

**Location:** `/server.js`
**Role:** Single entry point for the entire backend. Handles HTTP, REST, and WebSocket.

### Startup sequence

1. Loads `dotenv` from `.env`
2. Creates an `http.Server` wrapping Express
3. Attaches `socket.io` to the HTTP server (CORS open: `"*"`)
4. Sets up static file serving for `public/` and `assets/`
5. Registers all REST routes
6. Starts listening on `PORT` (default: 3000)
7. Logs local and LAN URLs to console

### Key design decisions

- **Single file.** All routes are defined inline in `server.js`. No separate router files. This keeps the demo simple and readable.
- **In-memory state.** No database. `data/characters.js` and `data/rolls.js` hold arrays in Node's process memory. State is lost on server restart.
- **Broadcast everything.** Every mutation (`PUT`, `POST`, `DELETE`) emits a Socket.io event to all connected clients immediately after updating the in-memory state.
- **No auth.** CORS is fully open (`"*"`). Designed for LAN demo use only.

### `getMainIP()`

Utility function that reads `os.networkInterfaces()` and returns the first non-internal IPv4 address. Used to print the LAN URL on startup and expose it via `GET /api/info` for the landing page.

---

## 5. Data Layer — `data/`

### `data/characters.js` — Core character store

The most important data module. Exports functions used by every character route.

**In-memory store:**
```js
const characters = ensureCharactersPhotos(structuredClone(loadCharacterTemplate()));
```
The template is loaded from `data/template-characters.json` (or a custom file pointed to by `CHARACTERS_TEMPLATE` env var), deep-cloned, and photo-enriched at startup.

**Exported functions:**

| Function | Description |
|---|---|
| `getAll()` | Returns the full character array |
| `findById(id)` | Finds a character by stable ID |
| `getCharacterName(id)` | Returns name string for logging |
| `updateHp(id, hpCurrent)` | Clamps HP (0 → hp_max) and updates |
| `updatePhoto(id, photo)` | Sets photo URL, re-runs photo fallback |
| `updateCharacterData(id, updates)` | Partial update for any editable fields |
| `addCondition(id, {condition_name, intensity_level})` | Appends a condition with a new short ID |
| `removeCondition(charId, condId)` | Filters out a condition by its ID |
| `removeCharacter(charId)` | Splices character from array |
| `updateResource(charId, resourceId, pool_current)` | Clamps resource pool current value |
| `restoreResources(charId, type)` | Refills resources matching recharge type |
| `createCharacter(input)` | Full character factory with all defaults |

**Helper: `clamp(value, max)`** — `Math.max(0, Math.min(value, max))`. HP is always clamped to [0, hp_max].

---

### `data/rolls.js` — Dice roll log

Simple append-only in-memory array of dice roll records.

```js
{ id, charId, characterName, result, modifier, rollResult, sides, timestamp }
```

- `result` = raw die result (1–sides)
- `modifier` = applied modifier (can be negative)
- `rollResult` = `result + modifier`

---

### `data/id.js` — Short ID generator

Generates 5-character random IDs using a 32-character alphabet that excludes visually ambiguous characters (no `0`, `1`, `I`, `O`). Used for condition IDs, roll IDs, and new character IDs.

---

### `data/photos.js` — Photo fallback utility

If a character has no photo, assigns a random one from `["barbarian.png", "elf.png", "wizard.png"]` under `/assets/img/`. Called at server startup and after any photo update.

---

### `data/template-characters.json` — Demo roster

Four pre-built characters used for the demo:

| ID | Name | Player | Class | HP |
|---|---|---|---|---|
| CH101 | Hector | Hector | Fighter Lv.1 | 12/12 |
| CH102 | Luis | Luis | Bard Lv.1 | 8/8 |
| CH103 | Marcelo | Marcelo | Cleric Lv.1 | 9/9 |
| CH104 | Cynthia | Cynthia | Warlock Lv.1 | 8/8 |

---

### `data/resources.js` — Legacy standalone resource store (UNUSED)

Early design experiment with a flat resource table separate from characters. **Not used by the server.** The active resource system is embedded in `character.resources[]`. Kept for reference in case of a future relational DB migration.

---

### `data/state.js` — Snapshot aggregator (not yet wired)

Convenience module that aggregates all data modules under a single `getSnapshot()` call. Not currently imported by `server.js`. Available for future use (e.g., save/restore endpoint, admin dashboard).

---

## 6. OBS Overlays — `public/`

All files in `public/` are served statically from the Express server. OBS Browser Sources can point to `http://<server-ip>:3000/overlay-hp.html` instead of a local file path.

### `overlay-hp.html` — HP Bars Overlay ✅

**Dimensions:** 1920×1080, transparent background
**Socket:** Connects to server via CDN `socket.io` v4.8.3

**Behavior:**
- On `initialData`: renders one HP bar per character
- On `hp_updated`: finds the bar by `data-char-id`, recalculates width percentage, applies CSS class
- On `character_created` / `character_updated`: re-renders the bar list
- On `character_deleted`: removes the bar

**HP color states:**
| Threshold | Class | Color |
|---|---|---|
| > 60% | `.hp-healthy` | Green gradient |
| 30–60% | `.hp-injured` | Orange gradient |
| < 30% | `.hp-critical` | Red gradient + CSS pulse animation |

---

### `overlay-dice.html` — Dice Result Popup ✅

**Dimensions:** 1920×1080, transparent background
**Socket:** Same pattern as HP overlay

**Behavior:**
- On `dice_rolled`: shows a popup with character name, die type, and result
- **Nat 20:** applies `.crit` class → golden glow + "¡CRÍTICO!" text
- **Nat 1:** applies `.fail` class → red glow + "¡PIFIA!" text
- Popup auto-dismisses after a timeout

---

### `overlay-conditions.html` — Conditions Overlay (exists, not wired)

The file exists in `public/` but is not fully implemented as an active OBS overlay. It's a candidate for the next development phase.

---

### `public/index.html` — Landing Page

Served at `http://server:3000/`. Calls `GET /api/info` to get the server's LAN IP and dynamically renders the correct URLs for:
- OBS Browser Source paths
- Control panel link
- Quick-start instructions

---

## 7. Control Panel — `control-panel/`

A SvelteKit app that runs on port 5173. Uses Svelte 5's runes syntax (`$state`, `$derived`, `$props`).

### 7.1 App Shell & Routing

**`src/routes/+layout.svelte`** — Root layout
- Renders the app header, sidebar navigation, and `{@render children()}`
- Tracks Socket.io `connect`/`disconnect` to show a live connection dot
- Sidebar links: `/control/characters`, `/dashboard`, `/management/create`

**Routes:**
| URL | Component | Purpose |
|---|---|---|
| `/` | `+page.svelte` | Redirects to `/control/characters` |
| `/control/characters` | `+page.svelte` | Main play view — character cards |
| `/control/dice` | `+page.svelte` | Dice roller |
| `/dashboard` | `+page.svelte` | Read-only live view for TV/monitor |
| `/management/create` | `+page.svelte` | Create new character |
| `/management/manage` | `+page.svelte` | Edit/delete existing characters |

---

### 7.2 Socket Layer — `socket.js`

**Location:** `control-panel/src/lib/socket.js`
**Role:** Singleton Socket.io client + Svelte stores for reactive game state

```js
const socket = io(VITE_SERVER_URL || "http://localhost:3000");
export const characters = writable([]);
export const lastRoll = writable(null);
```

All components that need character data import `characters` from here. The store is kept in sync by listening to every server event:

| Event received | Store action |
|---|---|
| `initialData` | Replace entire `characters` array |
| `hp_updated` | Map-replace the affected character |
| `character_created` | Append to array |
| `character_updated` | Map-replace the affected character |
| `condition_added` | Immutable update: spread new condition onto character |
| `condition_removed` | Filter out condition by ID |
| `resource_updated` | Map-replace the specific resource within character |
| `rest_taken` | Replace entire character object |
| `character_deleted` | Filter out character by ID |
| `dice_rolled` | Set `lastRoll` store |

---

### 7.3 Dashboard Store — `dashboardStore.js`

**Location:** `control-panel/src/lib/dashboardStore.js`
**Role:** Dashboard-level state that is NOT character-specific

**Stores exported:**
- `pendingActions` — writable array of in-flight API calls (for optimistic UI)
- `isSyncing` — derived boolean: `pendingActions.length > 0`
- `history` — writable array, capped at 40 entries
- `currentRole` — `"player" | "dm" | "spectator"` (not yet wired to auth)

**Functions exported:**
- `enqueuePending(action)` / `dequeuePending(actionId)` — optimistic update queue
- `recordHistory(entry)` — appends `{timestamp, type, label, value, detail}` to history

Listens to all Socket.io events and calls `recordHistory` for each. The dashboard route reads from `history` to display the activity feed.

---

### 7.4 UI Components — `lib/`

#### `CharacterCard.svelte`

The primary gameplay component. Renders one card per character.

**Features:**
- Character photo, name, player, class/level pill, species
- HP bar with color threshold (green/orange/red)
- Damage / Heal buttons with amount stepper
- Armor Class and speed stats via `StatDisplay`
- Conditions list with `ConditionPill` (add by name, remove by click)
- Resource pools with `Stepper` controls (e.g., spell slots, ki points)
- Short/Long Rest buttons
- Collapsible body with anime.js height animation
- Hit flash animation (red overlay on damage) via anime.js
- Loading guard (`isUpdating`) prevents spam-clicking
- Inline card error messages (no `window.alert`)

**All actions go through the server** (controlled component pattern). No optimistic local state updates for HP/conditions/resources.

---

#### `DiceRoller.svelte`

**Features:**
- Character selector dropdown (defaults to first character)
- Modifier stepper (−20 to +20)
- Buttons for d4, d6, d8, d10, d12, d20
- On roll: POSTs to `POST /api/rolls`, server emits `dice_rolled`
- Result display with elastic bounce animation
- Critical (d20 = 20) and fail (d20 = 1) visual states

---

#### `CharacterCreationForm.svelte`

Full character creation form covering:
- Name, player, class, level, subclass
- Species, size, speed
- Background, feat, alignment
- Languages (from `character-options.template.json`)
- Proficiencies: skills, saving throws, armor, weapons, tools
- Equipment items + trinket
- HP max + starting HP
- Armor class
- Photo source

Uses `MultiSelect.svelte` for multi-value fields. Submits to `POST /api/characters`.

---

#### `CharacterManagement.svelte`

Full character editing + deletion interface.

**Per-character editing includes:**
- All fields from creation form
- Photo source picker (preset / URL / local file)
- Edit/save via `PUT /api/characters/:id`
- Photo save via `PUT /api/characters/:id/photo`
- Delete via `DELETE /api/characters/:id` (with `AlertDialog` confirmation)

**Imports `character-options.template.json`** from `docs/` for dropdown option values (all valid class names, species, alignments, etc.)

---

#### `DashboardCard.svelte`

Read-only character summary card for the `/dashboard` view. Shows portrait, name, player, class, HP bar, AC, conditions, resources. No edit controls.

---

#### `CharacterBulkControls.svelte`

Multi-character select + bulk actions. Allows applying the same HP change or rest to multiple selected characters at once.

---

#### `MultiSelect.svelte`

Accessible, keyboard-navigable multi-value select component. Used extensively in the character form for languages, skills, proficiencies, etc. Items are selectable pills with add/remove behavior.

---

#### `PhotoSourcePicker.svelte`

Three-mode photo picker:
1. **Preset** — select from built-in portraits
2. **URL** — paste a remote image URL
3. **Local file** — upload from device (converts to data URI)

---

### 7.5 shadcn-svelte Components

Located under `src/lib/components/ui/`. Migrated progressively from custom implementations.

| Component | Usage |
|---|---|
| `Button` | All action buttons (Damage, Heal, Rest, Save, etc.) |
| `Input` | Text/number inputs in forms |
| `Label` | Form field labels |
| `Dialog` | Edit character modals |
| `AlertDialog` | Delete confirmation |
| `Tooltip` | Stat explanations |
| `Collapsible` | Card body collapse |
| `badge` | Status badges |
| `pills/*` | Level pills, selection pills |
| `condition-pill` | Removable condition tags |
| `stat-display` | AC/Speed stat display |
| `stepper` | Numeric +/- controls |
| `read-only-field` | Non-editable display fields |

---

## 8. Real-Time Data Flow

```
┌─────────────────────────────────────────────────┐
│              CONTROL PANEL (browser)            │
│  User taps "Damage 5" on CharacterCard          │
│  → PUT http://server:3000/api/characters/CH101/hp│
└─────────────────────────┬───────────────────────┘
                          │ HTTP REST
                          ▼
┌─────────────────────────────────────────────────┐
│                   SERVER (Node.js)              │
│  characterModule.updateHp("CH101", 7)           │
│  → io.emit("hp_updated", { character, 7 })      │
└─────────────────────────┬───────────────────────┘
                          │ Socket.io broadcast (all clients)
          ┌───────────────┼───────────────────────┐
          ▼               ▼                       ▼
┌──────────────┐  ┌───────────────┐  ┌─────────────────────┐
│ Control Panel│  │Other browsers │  │  OBS overlay-hp.html │
│ socket.js    │  │ (any device)  │  │  Updates HP bar DOM  │
│ characters   │  │ Same update   │  │  in < 100ms          │
│ store updates│  │               │  │                      │
└──────────────┘  └───────────────┘  └─────────────────────┘
```

**On initial connection:**
Server immediately emits `initialData` with the full character + rolls snapshot so every client boots with the current game state.

---

## 9. REST API Reference

Base URL: `http://localhost:3000` (or LAN IP)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/info` | — | Returns `{ ip, port }` |
| GET | `/api/characters` | — | All characters |
| POST | `/api/characters` | Character fields | Create character, emit `character_created` |
| PUT | `/api/characters/:id` | Partial fields | Update editable fields, emit `character_updated` |
| PUT | `/api/characters/:id/hp` | `{ hp_current }` | Update HP, emit `hp_updated` |
| PUT | `/api/characters/:id/photo` | `{ photo }` | Update photo, emit `character_updated` |
| DELETE | `/api/characters/:id` | — | Delete character, emit `character_deleted` |
| POST | `/api/characters/:id/conditions` | `{ condition_name, intensity_level? }` | Add condition, emit `condition_added` |
| DELETE | `/api/characters/:id/conditions/:condId` | — | Remove condition, emit `condition_removed` |
| PUT | `/api/characters/:id/resources/:rid` | `{ pool_current }` | Update resource, emit `resource_updated` |
| POST | `/api/characters/:id/rest` | `{ type: "short"\|"long" }` | Take rest, emit `rest_taken` |
| POST | `/api/rolls` | `{ charId, result, sides, modifier? }` | Log roll, emit `dice_rolled` |

**Validation:** Every endpoint validates inputs and returns descriptive `400` errors. HP is clamped to [0, hp_max] server-side. Short IDs must match `/^[A-Z0-9]{5}$/i`.

---

## 10. Socket.io Events Reference

| Event | Direction | Payload |
|---|---|---|
| `initialData` | server → client | `{ characters: Character[], rolls: Roll[] }` |
| `hp_updated` | server → all | `{ character: Character, hp_current: number }` |
| `character_created` | server → all | `{ character: Character }` |
| `character_updated` | server → all | `{ character: Character }` |
| `character_deleted` | server → all | `{ charId: string }` |
| `condition_added` | server → all | `{ charId: string, condition: Condition }` |
| `condition_removed` | server → all | `{ charId: string, conditionId: string }` |
| `resource_updated` | server → all | `{ charId: string, resource: Resource }` |
| `rest_taken` | server → all | `{ charId: string, type: string, restored: string[], character: Character }` |
| `dice_rolled` | server → all | `{ id, charId, characterName, result, modifier, rollResult, sides, timestamp }` |

---

## 11. Character Data Schema

```js
{
  id: string,              // e.g. "CH101" (stable, 5-char for template, short ID for created)
  name: string,            // Character name
  player: string,          // Player's real name
  hp_current: number,      // 0 – hp_max
  hp_max: number,          // > 0
  hp_temp: number,         // Temporary HP (not counted in hp_current)
  armor_class: number,     // AC value
  speed_walk: number,      // Walking speed in feet

  class_primary: {
    name: string,          // e.g. "fighter", "bard", "warlock"
    level: number,         // 1–20
    subclass: string,      // e.g. "Champion", "" if none
  },

  background: {
    name: string,          // e.g. "soldier", "acolyte"
    feat: string,          // Background feat (5e 2024 style)
    skill_proficiencies: string[],
    tool_proficiency: string,
  },

  species: {
    name: string,          // e.g. "human", "elf", "tiefling"
    size: string,          // "small" | "medium" | "large"
    speed_walk: number,
    traits: string[],      // e.g. ["darkvision", "hellish_resistance"]
  },

  languages: string[],     // e.g. ["common", "elvish"]
  alignment: string,       // e.g. "lg", "ng", "cn", "ln"

  proficiencies: {
    skills: string[],
    saving_throws: string[],
    armor: string[],       // e.g. ["light", "medium", "heavy", "shields"]
    weapons: string[],
    tools: string[],
  },

  equipment: {
    items: string[],       // e.g. ["chain_mail", "longsword"]
    coins: { gp: number, sp: number, cp: number },
    trinket: string,
  },

  ability_scores: {        // All default to 10 for created characters
    str: number, dex: number, con: number,
    int: number, wis: number, cha: number,
  },

  conditions: [            // Active status effects
    {
      id: string,          // 5-char short ID
      condition_name: string,
      intensity_level: number,   // Default 1
      applied_at: string,        // ISO 8601
    }
  ],

  resources: [             // Limited-use class resources
    {
      id: string,          // e.g. "RS201"
      name: string,        // e.g. "SPELL SLOTS", "CHANNEL DIVINITY", "RAGE"
      pool_max: number,
      pool_current: number,
      recharge: "SHORT_REST" | "LONG_REST" | "TURN" | "DM",
    }
  ],

  photo: string,           // URL path, e.g. "/assets/img/barbarian.png" or data URI
}
```

---

## 12. Supporting Files & Scripts

### `scripts/setup-ip.js`
Detects the machine's LAN IP and writes two `.env` files:
- `OVERLAYS/.env` with `SERVER_IP` and `PORT`
- `control-panel/.env` with `VITE_SERVER_URL=http://<ip>:3000`

Run with `npm run setup-ip` before starting the server on a new network.

### `start-demo.sh` / `start-demo.bat`
One-command demo launchers. Runs `setup-ip.js`, starts the server in one terminal, and starts the control panel dev server in another. Cross-platform (Bash + Windows Batch).

### `scripts/build-dist.sh` / `.bat`
Builds the control panel for production (`vite build`) and copies the output into `public/` so the entire app can be served from the Express server without needing the Vite dev server.

### `docs/character-options.template.json`
Exhaustive list of valid values for all dropdown/multi-select fields in character creation and management. Imported directly by `CharacterCreationForm.svelte` and `CharacterManagement.svelte`. Covers: class names, species names, alignments, languages, skill names, background names, equipment items, etc.

### `test.http`
Manual API test file (compatible with VS Code REST Client extension). Includes sample requests for all endpoints.

### `.env.example`
```
PORT=3000
CONTROL_PANEL_ORIGIN=http://localhost:5173
CHARACTERS_TEMPLATE=template-characters
```

---

## 13. Testing & QA Infrastructure

### End-to-End Tests (`app.test.js`, `playwright.config.js`)
Playwright tests run against the live server. Test full HTTP flows: character creation, HP update, condition add/remove, dice rolls. Uses `test_characters.js` for fixtures.

### Control Panel Unit Tests (Vitest)
Located in `control-panel/src/__mocks__/` and alongside components as `.test.js` files. Uses jsdom + Vitest for fast headless testing.

### Storybook (`control-panel`)
Component stories in `src/lib/stories/*.stories.svelte` and alongside components as `.stories.svelte`. Run with `npm run storybook` on port 6006. Covers: CharacterCard, DiceRoller, DashboardCard, MultiSelect, PhotoSourcePicker, CharacterBulkControls.

### Stress Tests (`stress/`)
k6 load test scripts targeting:
- `stress/api.js` — API endpoints under load
- `stress/control-panel.js` — Control panel under concurrent users

Run with: `npm run stress`

### Playwright Snapshots
`create-page-snapshot.yaml` and `manage-snapshot.yaml` — page-level Playwright visual snapshot configs for regression testing.

---

## 14. Current Limitations & Known Gaps

| Area | Limitation |
|---|---|
| **Persistence** | All data is in-memory. Server restart wipes everything. |
| **Auth** | No authentication. Anyone on the LAN can modify any character. |
| **Ability scores** | Stored on character but not editable in the UI. All new characters default to 10 in every score. |
| **Derived stats** | HP, spell slots, proficiency bonus, attack rolls, saving throw modifiers are NOT auto-calculated from ability scores. Must be entered manually. |
| **Combat tracker** | No initiative order, turn tracking, or action economy management. |
| **NPC/Enemies** | No separate entity type for NPCs or monsters. Could use same character schema but no DM-only visibility. |
| **Multi-class** | Only one class slot (`class_primary`). No multi-classing support. |
| **Spell system** | No spell compendium, spell slots are only tracked as a generic resource pool. |
| **Campaign management** | No session notes, encounter builder, or campaign arc tracking. |
| `conditions_overlay` | `overlay-conditions.html` exists but is not connected to Socket.io. |
| `data/resources.js` | Exists as legacy but is entirely disconnected. |
| `data/state.js` | Snapshot aggregator exists but not wired to any endpoint. |
| **Roll history** | Roll log is in-memory only. No persistence. |
| **Notes** | Character `notes` object in template (appearance, personality, etc.) is stored but not surfaced in any UI. |

---

## 15. Game-Dev System Inspirations for Future Development

This section maps proven game engineering patterns from shipped titles to what could be built into DADOS & RISAS. Each subsection identifies the source pattern, explains the concept, and proposes a concrete implementation path.

---

### 15.1 Slay the Spire Systems

Slay the Spire (MegaCrit, 2019) is one of the best examples of a data-driven, composable game system in modern game dev.

#### Card System → Abilities, Spells & Features as Data Objects

**StS concept:** Every card is a JSON-like data object with `cost`, `type` (Attack/Skill/Power), `target`, and an array of `effects`. Cards can be upgraded, copied, and modified. The game engine iterates over effects and resolves them in order.

**D&D application:**

Replace hardcoded "SPELL SLOTS" resources with a full `abilities[]` array on each character. Each ability is a data object:

```js
// Proposed schema for data/abilities.js
{
  id: "AB_FIREBALL",
  name: "Fireball",
  type: "SPELL",            // SPELL | CLASS_FEATURE | RACIAL_TRAIT | ITEM | FEAT
  action_cost: "ACTION",    // ACTION | BONUS_ACTION | REACTION | FREE
  resource_cost: [{
    resource_name: "SPELL_SLOTS",
    slot_level: 3
  }],
  range: 150,               // feet
  target: "AREA",           // SELF | SINGLE | AREA | ALL_ENEMIES
  effects: [
    { type: "DAMAGE", die: "8d6", damage_type: "fire" },
    { type: "SAVE", ability: "dex", dc_base: "SPELL_DC" }
  ],
  concentration: false,
  duration: null,           // null = instant
  overlay_animation: "explosion",
}
```

**What this unlocks:**
- DM clicks ability in control panel → server resolves effects → emits to all clients
- OBS overlay displays the ability name, damage, animation trigger
- Resources auto-deduct based on `resource_cost`
- Abilities panel in control panel renders like a "hand of cards"

**Current foundation to build on:** `character.resources[]` already tracks resource pools. `conditions` already tracks status effects. The missing piece is the ability definition layer and an execution engine.

---

#### Relic/Passive System → Racial Traits, Feats & Passive Features

**StS concept:** Relics are persistent passive modifiers. Some trigger "on hit", "at start of turn", "when HP drops below 50%". They are stored as a list on the player and evaluated at specific game events.

**D&D application:**

Create a `passives[]` array on each character:

```js
{
  id: "PASS_DARKVISION",
  name: "Darkvision",
  source: "species",        // species | class | background | feat | item
  trigger: "ALWAYS",        // ALWAYS | ON_DAMAGE_TAKEN | ON_REST | ON_ATTACK
  effect: {
    type: "SENSE",
    range: 60
  }
}
```

- Species traits (darkvision, hellish resistance) are passives
- Class features (Second Wind, Uncanny Dodge) are passives with triggers
- These can drive conditional overlays (e.g., show "Hellish Resistance" badge when fire damage taken)

---

#### Intent System → Enemy Action Display Overlay

**StS concept:** Enemies display their next action as an icon ("this enemy will attack for 12" or "this enemy will shield"). This gives players information to make tactical decisions.

**D&D application:**

Add an `intent` field to NPC/enemy characters:

```js
{
  id: "NPC_GOBLIN_01",
  type: "ENEMY",
  intent: {
    action: "ATTACK",
    target_id: "CH101",
    estimated_damage: "1d6+2",
    display_label: "Stabbing Hector!"
  }
}
```

The DM sets enemy intents from the control panel. A new `overlay-combat.html` shows enemy intents to the stream audience, building tension.

---

#### Power/Buff-Debuff Stack → Enhanced Conditions System

**StS concept:** Powers are stackable, durationed effects that modify combat calculations. They tick each turn and some expire. Each power has a `stack_count`, `expires_at`, and a resolution function.

**Current system:** Conditions are just `{ id, condition_name, intensity_level, applied_at }` — flat, no duration, no mechanical effect.

**Upgrade path:**

```js
{
  id: "COND_BLESS",
  condition_name: "Bless",
  type: "BUFF",             // BUFF | DEBUFF | CONDITION | ENVIRONMENTAL
  intensity_level: 1,
  stacks: 1,                // for stackable conditions like Poison, Burning
  duration: {
    type: "TURNS",          // TURNS | ROUNDS | UNTIL_REST | CONCENTRATION | PERMANENT
    remaining: 10
  },
  effects: [
    { type: "ROLL_BONUS", bonus_die: "1d4", applies_to: ["attack", "saving_throw"] }
  ],
  applied_by: "CH103",      // Who cast/applied it
  concentration: true,
  applied_at: "2026-02-26T19:00:00Z"
}
```

The server could tick down `duration.remaining` on `rest_taken` or a new `turn_ended` event.

---

### 15.2 Baldur's Gate 3 Systems

BG3 (Larian Studios, 2023) is the closest to a computerized faithful D&D 5e implementation. Its systems are directly applicable.

#### Action Economy System — Actions, Bonus Actions, Reactions

**BG3 concept:** Each character has a turn consisting of trackable action slots: `action_count`, `bonus_action_count`, `reaction_count`, `movement_remaining`. Spending an action deducts from the pool. Turn end resets all.

**Implementation for DADOS & RISAS:**

Add turn-state to the character object:

```js
turn_state: {
  actions_remaining: 1,
  bonus_actions_remaining: 1,
  reactions_remaining: 1,
  movement_remaining: 30,   // feet
  is_active_turn: false,
}
```

New Socket.io events: `turn_started`, `turn_ended`, `action_spent`, `movement_spent`

The HP overlay or a new `overlay-combat.html` shows remaining actions as icons (sword = action, lightning = bonus action, shield = reaction). The DM panel has a "Start Turn / End Turn" button.

---

#### Initiative Tracker → Combat Order System

**BG3 concept:** Combat runs in initiative order. The server tracks a `combat_round`, `turn_index`, and an ordered list of participants. The UI shows "Whose turn is it".

**Implementation:**

```js
// data/combat.js (new module)
{
  active: false,
  round: 1,
  turn_index: 0,
  order: [
    { char_id: "CH101", initiative: 18 },
    { char_id: "NPC_01", initiative: 15 },
    { char_id: "CH102", initiative: 12 },
  ]
}
```

New endpoints:
- `POST /api/combat/start` — roll initiative, emit `combat_started`
- `POST /api/combat/next-turn` — advance turn_index, emit `turn_changed`
- `POST /api/combat/end` — clear combat state, emit `combat_ended`

New overlay: `overlay-initiative.html` showing the turn order with the active character highlighted. This is a high-impact demo feature.

---

#### Concentration Tracking

**BG3 concept:** Concentration spells break if the caster takes damage and fails a Constitution saving throw (DC 10 or half damage, whichever is higher). BG3 shows a visual warning when concentration breaks.

**Implementation:**

Tag conditions that require concentration:
```js
{ ..., concentration: true, caster_id: "CH103" }
```

When `hp_updated` fires for a character with active concentration spells, the server checks and emits `concentration_check_required` with the DC. The control panel prompts for a Con save. If failed, emits `concentration_broken`, removing all tagged conditions.

---

#### Death Saving Throws

**BG3 concept:** When HP reaches 0, a character enters the "dying" state and must roll death saving throws each turn (3 successes = stable, 3 failures = dead).

**Implementation:**

Add to character:
```js
death_state: {
  is_dying: false,
  successes: 0,
  failures: 0,
  is_stable: false,
  is_dead: false
}
```

When `hp_updated` results in `hp_current === 0`, server emits `character_dying`. The dice overlay shows the death save animation. The HP bar shows a skull icon. This is a dramatic streaming moment.

---

#### Spell Slot System (Leveled)

**BG3 concept:** Spellcasters have slots organized by level (1st through 9th). Using a higher-level slot for a lower-level spell (upcast) is common.

**Current system:** Resources are flat pools. A warlock has "SPELL_SLOTS: 1/1".

**Upgrade:**

```js
spell_slots: {
  1: { max: 4, current: 3 },
  2: { max: 3, current: 3 },
  3: { max: 2, current: 0 },
  // ...
}
```

The control panel's resource section can render a grid of slots by level. Long rest restores all. Short rest only restores warlock pact magic slots.

---

#### NPC / Enemy Stat Blocks

**BG3 concept:** Enemies are full stat block objects stored in a compendium. The DM can spawn instances into the encounter. Enemies share the same HP/conditions/resources system but have `type: "ENEMY"` and are hidden from players in the overlay until revealed.

**Implementation:**

Extend the character schema with `entity_type`:
```js
entity_type: "PC" | "NPC" | "ENEMY" | "SUMMON"
visible_to_players: boolean
```

- `ENEMY` entities don't appear on the player-facing HP overlay unless `visible_to_players: true`
- A DM-only overlay (`overlay-dm.html`) shows ALL entities
- The server filters `GET /api/characters` based on a `?role=dm` or `?role=player` query param

---

#### Camp Resources / Party-Wide Pools

**BG3 concept:** Some resources are party-wide (camp supplies, inspiration, group advantage). They don't belong to a single character.

**Implementation:**

New `data/party.js` module:
```js
{
  camp_supplies: { current: 40, max: 80 },
  group_inspiration: { current: 0, max: 4 },
  party_level: 1,
  session_number: 3,
  active_campaign: "The Lost Mine"
}
```

`GET /api/party` endpoint. Dashboard shows party stats alongside character cards.

---

#### Reaction System

**BG3 concept:** Reactions (Shield, Counterspell, Opportunity Attack) interrupt the normal action flow. BG3 pauses combat and prompts the player "Do you want to use Counterspell?".

**Implementation for streaming:**

When a spell is cast in the session, the DM can emit a `reaction_opportunity` event:
```js
{
  type: "COUNTERSPELL",
  triggering_spell: "Fireball",
  available_reactors: ["CH103"]
}
```

The control panel shows a "Use Reaction?" prompt for CH103's player. The outcome is broadcast via a new `reaction_resolved` event with OBS overlay animation.

---

### 15.3 Integration Roadmap

The following table maps each game system to its implementation complexity and streaming/demo impact, to help prioritize development.

| System | Source Inspiration | Backend Complexity | Frontend Complexity | Demo Impact | Suggested Phase |
|---|---|---|---|---|---|
| **Initiative tracker** | BG3 | Low (new `combat.js` module) | Medium (turn order UI) | ⭐⭐⭐⭐⭐ | Phase 2 — highest priority |
| **Action economy** | BG3 | Low (add fields to character) | Medium (icons on card) | ⭐⭐⭐⭐ | Phase 2 |
| **Enhanced conditions with duration** | StS Powers | Medium (tick logic) | Low (extend existing UI) | ⭐⭐⭐⭐ | Phase 2 |
| **Death saving throws** | BG3 | Low (new `death_state` field) | Low (extend CharacterCard) | ⭐⭐⭐⭐⭐ | Phase 2 |
| **Leveled spell slots** | BG3 | Medium (new resource schema) | Medium (slot grid UI) | ⭐⭐⭐ | Phase 3 |
| **Ability/spell as data objects** | StS Cards | High (ability engine) | High (card hand UI) | ⭐⭐⭐⭐ | Phase 3–4 |
| **NPC/enemy stat blocks** | BG3 | Medium (entity type) | Medium (DM panel) | ⭐⭐⭐⭐ | Phase 3 |
| **Concentration tracking** | BG3 | Low (add flag + hook) | Low (badge on condition) | ⭐⭐⭐ | Phase 3 |
| **Passive/relic system** | StS Relics | Medium (passives array) | Low (trait list display) | ⭐⭐ | Phase 4 |
| **Enemy intent display** | StS Intent | Low (add intent field) | Medium (new overlay) | ⭐⭐⭐⭐ | Phase 3 |
| **Party-wide resources** | BG3 Camp | Low (new party module) | Low (dashboard widget) | ⭐⭐ | Phase 4 |
| **Reaction system** | BG3 | High (event interruption) | High (prompt UI) | ⭐⭐⭐ | Phase 4–5 |
| **Ability score modifiers driving derived stats** | BG3 character sheet | Medium (formula engine) | Low (read-only display) | ⭐⭐⭐ | Phase 3 |
| **Database persistence** | — | Medium (SQLite migration) | None | Required for Phase 3+ |

---

### Architectural note: Data-Driven vs Hardcoded

Both Slay the Spire and BG3 are extremely data-driven. Abilities, items, enemies, and status effects are defined in JSON/data tables and resolved by a general-purpose engine. This is the key architectural evolution for DADOS & RISAS beyond its current MVP state:

> **Current:** Business logic is scattered in API endpoints and components (e.g., "Short rest restores SHORT_REST resources" is hardcoded in `restoreResources()`).
>
> **Target:** A small rules engine on the server that takes an `action` object, resolves its effects against the current game state, applies all side effects (damage, resource deduction, condition application, overlay animation triggers), and emits a single `action_resolved` event with the full delta.

This pattern — sometimes called an **Entity-Component-System (ECS)** or a **Command pattern with an effect resolver** — is used in both StS and BG3 and would make DADOS & RISAS dramatically easier to extend without touching core logic.

---

*Last updated: February 26, 2026*
*Document authored by Claude Sonnet 4.6 as part of branch `claude/create-codebase-docs-iJHMu`*
