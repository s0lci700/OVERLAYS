# TableRelay — GitHub Copilot Instructions

**Project**: Real-time D&D session management and streaming system for *Dados & Risas*

> This is a production system handling operator control, DM reference, player sheets, and broadcast overlays within a single deployment. Repo name `OVERLAYS` is legacy — project name is **TableRelay**.

---

## Build, Test, and Lint Commands

### Root Project

```powershell
# Type-check (Bun runs .ts natively, no transpilation)
bun run build

# Formatting
bun run lint          # Check with Prettier
bun run format        # Fix with Prettier

# Start full stack
bun run start-demo    # Starts PocketBase + Backend server
bun run stop-demo     # Stop demo processes

# Backend only (requires PocketBase running first)
bun server.ts         # Express + Socket.io on port 3000

# Utilities
bun scripts/setup-ip.js           # Auto-detect LAN IP and write .env files
bun run generate:tokens           # Regenerate CSS from design/tokens.json
```

### Control Panel (`/control-panel`)

```powershell
# Development
bun run dev -- --host            # Vite dev server with LAN exposure (:5173)
bun run dev:auto                 # Auto setup-ip + dev server

# Build
bun run build                    # Production build
bun run preview                  # Preview production build

# Testing
bun run test                     # Run Vitest tests
npx vitest run path/to/test.js   # Single test file

# Linting
bun run lint                     # ESLint + Prettier check
bun run format                   # Prettier fix

# Storybook
bun run storybook                # Dev server on :6006
bun run build-storybook          # Build static bundle
```

### E2E Testing

```powershell
npx playwright test app.test.js --config tests-log/playwright.config.js
```

**Required Start Order**: PocketBase → Backend (`bun server.ts`) → Control Panel (`bun run dev -- --host`)

---

## High-Level Architecture

### Four-Layer System

```
┌──────────────────────────────────────────────┐
│  STAGE (operator — only layer with write)    │
│  Pre-session setup + live session control    │
└──────────┬───────────────────┬───────────────┘
           │ state feed        │ event triggers
           ▼                   ▼
┌──────────────────┐   ┌────────────────────────┐
│  CAST (DM/Players│   │  AUDIENCE (overlays)   │
│  read-heavy)     │   │  Pure reactive output  │
└──────────────────┘   └────────────────────────┘
```

### Data Flow

```
Stage (operator action)
  → REST PUT/POST to server.ts
  → PocketBase write
  → Socket.io broadcast to ALL clients
       ├── Cast interfaces update read views
       └── Audience overlays react to events
```

**Critical Rules:**
- Stage is the only initiator
- Cast and Audience are consumers only
- Overlays (`(audience)/` routes) never send requests — listen-only via Socket.io
- All state mutations go through REST first, then Socket.io broadcasts the change

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Bun (always use `bun`, never `npm`) |
| **Backend** | Express + Socket.io 4.8, TypeScript |
| **Database** | PocketBase (SQLite) on port 8090 |
| **Frontend** | SvelteKit (Svelte 5), Vite 7 |
| **Overlays** | SvelteKit `(audience)` routes — OBS Browser Sources |
| **Component Dev** | Storybook 10 + Vitest |
| **UI Library** | bits-ui v2, tailwind-variants, shadcn-svelte |
| **Animations** | anime.js (animejs) + CSS transitions |

### Project Structure

```
OVERLAYS/
├── server.ts                    # Entry point — Express + Socket.io
├── backend/
│   ├── handlers/                # REST route handlers (characters, encounter, overlay, rolls)
│   ├── socket/                  # Socket.io init, broadcast, event stubs
│   ├── state/                   # In-memory encounter + scene state
│   └── pb.ts                    # PocketBase singleton
├── data/                        # PocketBase CRUD wrappers
│   ├── characters.js            # Character operations
│   ├── rolls.js                 # Roll logging
│   └── id.js                    # Short ID generator
├── pocketbase.exe               # PocketBase binary
├── control-panel/               # SvelteKit app (all 5 surfaces)
│   ├── src/routes/              # Route groups: (stage), (cast), (audience), (commons)
│   ├── src/lib/components/      # UI components organized by surface
│   ├── src/lib/services/        # pocketbase.ts, socket.ts, errors.ts
│   ├── src/lib/contracts/       # TypeScript interfaces (records, events, view models)
│   └── .storybook/              # Storybook config
├── design/tokens.json           # Canonical token source (never edit generated CSS)
└── docs/                        # Technical documentation
```

---

## Key Conventions

### Backend

**PocketBase Data Layer:**
- All functions in `data/characters.js` and `data/rolls.js` take `pb` as first argument and are `async`
- `pb.collection().getOne()` **throws** `ClientResponseError` on 404 — use try/catch, not `if (!result)` guards
- Available operations: `getAll`, `findById`, `createCharacter`, `updateHp`, `updatePhoto`, `updateCharacterData`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources`, `removeCharacter`, `logRoll`

**Socket.io Flow:**
1. Route handler validates input (reject with 400 for bad shapes)
2. Call `data/` function to write to PocketBase
3. On success: respond 2xx to caller + `io.emit()` to all clients
4. On error: respond 4xx/5xx (do NOT emit partial state)

**Key Socket Events:**
- `initialData` — sent to new connections only (unicast)
- `hp_updated`, `character_created`, `character_updated`, `condition_added`, `condition_removed`, `resource_updated`, `dice_rolled`, `scene_changed`, `announcement`
- See `docs/SOCKET-EVENTS.md` for complete payloads

### Frontend (control-panel)

**Svelte 5 Runes:**
- Components use `$props()`, `$state()`, `$derived()`, `$effect()`
- Global singletons (`characters`, `lastRoll` in `lib/services/socket.js`) stay as Svelte writable stores
- OBS overlay routes import from `lib/components/overlays/shared/overlaySocket.svelte.js` — NOT from `lib/services/socket.js`

**SvelteKit Routes:**
- Route groups use `(parens)` — organizational only, not in URLs
- `(stage)/` — Operator routes with write authority
- `(cast)/` — DM and player interfaces (read-heavy)
- `(audience)/` — OBS Browser Sources (listen-only)
- `(commons)/` — Shared room displays (passive, no controls)

**Component File Conventions:**
- Every component has a paired `.css` file in same directory
- Import CSS at top: `import "./ComponentName.css";`
- State classes use `is-` prefix: `.is-collapsed`, `.is-critical`, `.is-selected`
- Token variables from `generated-tokens.css`: `var(--token-name)`
- Shared base classes in `app.css`: `.card-base`, `.btn-base`, `.label-caps`

**TypeScript:**
- Import domain types from `$lib/contracts` — never inline ad-hoc types
- Key types: `Character`, `Condition`, `Resource`, `Roll` (see `lib/contracts/records.ts`)
- Service errors: All throws use `ServiceError` from `$lib/services/errors.ts` with codes: `CONFIG`, `NOT_FOUND`, `VALIDATION`, `UNAUTHORIZED`, `NETWORK`, `UNKNOWN`

**Socket Flow in Components:**
```typescript
// ✅ Correct — REST first, socket syncs state
async function updateHp(delta) {
  await fetch(`${SERVER_URL}/api/characters/${id}/hp`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  // Store update happens via socket.on('hp_updated') listener
}

// ❌ Wrong — mutating store directly
import { characters } from '$lib/services/socket.js';
characters.update(chars => chars.map(c => c.id === id ? {...c, hp_current: newHp} : c));
```

**Overlays:**
- Containers must have `data-char-id="{character.id}"` attribute
- Socket handlers use `document.querySelector('[data-char-id="..."]')` for efficient mutations
- Never remove or rename `data-char-id` attribute

**UI Library:**
- Use `bits-ui` v2 for headless primitives (button, dialog, tooltip, badge)
- Shared primitives in `lib/components/shared/`
- Check installed version before assuming API: `cat control-panel/package.json | grep bits-ui`
- bits-ui v2 has breaking changes from v0/v1

**Animations:**
- `anime.js` for programmatic effects (damage flash, dice bounce, level-up)
- CSS transitions for continuous state changes (HP bar width, collapse/expand)

**Storybook:**
- Every component should have `ComponentName.stories.svelte`
- Use `defineMeta` from `@storybook/addon-svelte-csf`
- Include `tags: ['autodocs']`
- Stories use mock view-models — no PocketBase, no Socket.io
- Mock character data uses stable IDs: `"CH101"`, `"CH102"`, etc.

### CSS Tokens

**Never edit generated CSS files directly:**
- `design/tokens.json` is the canonical source
- Run `bun run generate:tokens` at repo root after editing tokens
- Reference via `var(--token-name)` in component CSS files

---

## Environment Configuration

### Backend `.env` (root)

```env
POCKETBASE_URL=http://127.0.0.1:8090
PB_MAIL=admin@example.com
PB_PASS=yourpassword
PORT=3000
CONTROL_PANEL_ORIGIN=http://localhost:5173
```

### Control Panel `.env` (control-panel/)

```env
VITE_SERVER_URL=http://localhost:3000
VITE_PORT=5173
```

**LAN Access:**
Run `bun scripts/setup-ip.js` to auto-detect LAN IP and write both `.env` files.

---

## Windows Environment

**OS:** Windows 11 with PowerShell
- Use PowerShell syntax for shell commands (not bash/zsh)
- Always use `bun` package manager (never `npm`)
- Config file location: `$PROFILE` (run `echo $PROFILE` to locate)

---

## Documentation

| File | Contents |
|------|----------|
| `docs/INDEX.md` | Fast file map — entry points, routes, services |
| `docs/ARCHITECTURE.md` | Data flows, module map, design decisions |
| `docs/SOCKET-EVENTS.md` | Complete Socket.io event payloads |
| `docs/DESIGN-SYSTEM.md` | CSS tokens, typography, component style guide |
| `docs/ENVIRONMENT.md` | `.env` setup, IP configuration |
| `PROJECT.md` | Four-layer architecture overview |
| `CLAUDE.md` | Detailed guidance (backend, workflow rules) |
| `control-panel/CLAUDE.md` | Frontend-specific conventions |
| `control-panel/.storybook/README.md` | Story writing guide and mock strategy |

---

## GitNexus Code Intelligence

This project is indexed by GitNexus (1424 symbols, 2000 relationships, 38 execution flows).

**Before editing any function/class/method:**
```javascript
gitnexus_impact({target: "symbolName", direction: "upstream"})
```

**Before committing:**
```javascript
gitnexus_detect_changes({scope: "staged"})
```

**When exploring code:**
```javascript
gitnexus_query({query: "concept or feature"})
gitnexus_context({name: "symbolName"})
```

See `AGENTS.md` for complete GitNexus workflow.

---

## Common Pitfalls

1. **Never edit generated CSS files** — edit `design/tokens.json` and run `bun run generate:tokens`
2. **Don't mutate stores directly** — always REST first, let Socket.io broadcast updates
3. **Overlay routes use separate socket** — import from `overlaySocket.svelte.js`, not `socket.js`
4. **PocketBase getOne() throws on 404** — use try/catch, not `if (!result)`
5. **Always use `bun`** — not `npm` or `yarn`
6. **Check bits-ui version** — v2 has breaking API changes from v0/v1
7. **Start order matters** — PocketBase → Backend → Control Panel
---

## Design Context

### Users
- **Stream Operators (Stage):** Power users requiring high-density, low-latency control surfaces. Task: Real-time game state management (HP, rolls, conditions).
- **Players (Cast):** Mobile-first users. Task: Character sheet reference and live resource tracking during play.
- **Audience:** Purely reactive, listen-only OBS overlays. Task: Visual immersion and data transparency.

### Brand Personality
- **Voice & Tone:** Professional, technical, yet immersive and mystical.
- **3-Word Personality:** Digital, Grimoire, Production-Grade.
- **Emotional Goals:** Empowerment for operators, immersion for players, and "magical data" clarity for the audience.

### Aesthetic Direction
- **Visual Tone:** "The Technical Occult." High-end production tool aesthetic combined with tabletop mysticism.
- **Theme:** Dark Mode (Absolute black `--black` for OBS transparency) with glowing accents.
- **Signature Geometry:** Heavy use of **Hex-clips** (`polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`) for portraits and UI elements.
- **Color Logic:** 
  - **Amber (`--cast-amber`):** Structural chrome, navigation, and permanent labels.
  - **Cyan (`--cyan` / `--cast-cyan`):** Live state, active connections, and healing.
  - **Red (`--red`):** Damage, critical states, and active conditions.
- **Localization:** Strictly Spanish (Flagship standard: "VIT", "CA", "FUE", etc.).

### Design Principles
1. **Glanceability First:** High contrast between data (Data Fonts) and chrome (UI Fonts) to ensure readability during live streams.
2. **Rhythmic Density:** Use standardized spacing (`gap: var(--space-3)`) to group related TTRPG data without causing boxy visual noise.
3. **Immersive Utility:** Functional controls (Stage) must feel like part of the "Digital Grimoire" universe, avoiding generic AI-generated "SaaS" fingerprints.
4. **Adaptive Context:** The interface must transition from high-speed desktop operation (Stage) to thumb-friendly mobile reference (Cast) seamlessly.
