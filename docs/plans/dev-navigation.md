# Dev Navigation Improvement Plan

> Goal: Eliminate codebase disorientation through better docs and structural clarity.
> VS Code extension work is deferred to a separate discussion after these phases land.

---

## Phase 1 — Documentation (No Code Changes)

**Effort:** ~1hr total | **Risk:** Zero

### 1.1 Task-oriented guide in `docs/INDEX.md`

Add a "Where do I start?" section. Current INDEX.md is a file map — this makes it a task map.

| Task | Start here |
|---|---|
| Change HP mutation logic | `backend/actions/characters.ts` → `CharacterActions.updateHp` |
| Change HP display (Stage UI) | `control-panel/src/lib/components/stage/character-card/` |
| Change HP overlay (OBS) | `control-panel/src/lib/components/overlays/OverlayHP.svelte` |
| Add a new socket event | `backend/socket/events/` + `lib/contracts/events.ts` → `EventPayloadMap` |
| Add a character field | `lib/contracts/records.ts` → `backend/data/characters.ts` → handler → component |
| Change design tokens | `design/tokens.json` → `bun run generate:tokens` |
| Change Stage layout / state | `control-panel/src/lib/derived/stage.svelte.ts` |
| Add a new overlay route | `control-panel/src/routes/(audience)/` + new overlay component |
| Change PocketBase schema | `scripts/migrate-collections.ts` |
| Reset / seed the database | `bun run scripts/seed.js` (skips if records already exist) |
| Trace a socket event flow | `gitnexus_query({query: "event name"})` |

### 1.2 Legacy vs. current pattern labels in `control-panel/CLAUDE.md`

Add a "Pattern versions" section so it's immediately clear which file to reach for:

| Pattern | Current (use this) | Legacy (do not extend) |
|---|---|---|
| Socket client | `lib/services/socket.ts` | `lib/services/socket.js` |
| Stage mutations | `lib/derived/stage.svelte.ts` | Direct REST calls in CharacterCard |
| Overlay socket | `lib/components/overlays/shared/overlaySocket.svelte.ts` | Any direct socket.io import in overlay files |

Rule of thumb: `.ts` = current, `.js` = legacy.

### 1.3 Surface ownership map in `CLAUDE.md`

Add an ASCII "you are here" map — so when any file is open, its system context is immediately readable:

```
control-panel/src/
├── routes/
│   ├── (stage)/          ← STAGE — operators, write authority
│   ├── (cast)/           ← CAST — DM + players, mobile-first
│   └── (audience)/       ← AUDIENCE — OBS overlays, listen-only
├── lib/
│   ├── components/
│   │   ├── stage/        ← Stage components
│   │   ├── cast/         ← Cast components
│   │   ├── overlays/     ← Audience overlay components
│   │   └── shared/       ← UI kit (shadcn + custom primitives)
│   ├── contracts/        ← Shared types (backend + frontend via alias)
│   ├── derived/          ← Svelte reactive stores (stage.svelte.ts = canonical)
│   └── services/         ← socket.ts, pocketbase.ts, errors.ts (current)
backend/               ← BACKEND — Express + Socket.io
├── actions/              ← CharacterActions: primary mutation layer
├── data/                 ← PocketBase SDK wrappers
├── domain/               ← Pure business logic (clampHp, etc.)
├── handlers/             ← HTTP route handlers
├── socket/events/        ← Socket.io event handlers
└── state/                ← In-memory runtime state
```

---

## Phase 3 — Structural Migrations

Each item is a separate PR. Run `npx gitnexus analyze` after each merge.

### 3.1 `backend/` → `backend/`

Remove the pointless `src/` wrapper. Root becomes a direct map of the system.

**Before:**
```
OVERLAYS/
├── backend/   ← odd nesting
└── server.ts
```

**After:**
```
OVERLAYS/
├── backend/      ← clear, symmetric
└── server.ts
```

**Files to update:**
- `server.ts` — all `./backend/` imports → `./backend/`
- `tsconfig.json` — `paths` and `rootDir` / `include` globs
- `package.json` — any script referencing `src/`
- `CLAUDE.md` and `docs/INDEX.md` — all backend path references
- `railway.json` / `nixpacks.toml` — if they reference `src/`
- Run `gitnexus_impact({target: "router", direction: "upstream"})` before starting

### 3.2 `scripts/` internal organization

Group the 19 flat scripts into subdirectories. No external path changes needed — only `package.json` script entries update.

```
scripts/
├── setup/    ← setup-ip.js, seed.js
├── build/    ← optimize-assets.ts, generate-favicon.js, migrate-collections.ts
└── demo/     ← start-demo.js, stop-demo.js, panel-server.cjs
```

Low risk. Do alongside 3.1.

### 3.3 `shared/contracts` extraction ← defer, highest risk

Move `control-panel/src/lib/contracts/` → `shared/contracts/` at repo root.

Requires:
- New `@contracts/*` alias in root `tsconfig.json`
- New `$contracts` path alias in `control-panel/svelte.config.js` (replaces `$lib/contracts`)
- ~50+ frontend import updates
- ~10 backend import updates
- Full GitNexus re-analysis

**Only do this when** the backend/frontend split becomes more formalized, or a third consumer (CLI, mobile) needs the types. Don't do it for tidiness alone.

---

## Execution Order

```
1.1  INDEX.md task guide          ← immediate, 30min
1.2  Legacy labels in CLAUDE.md   ← immediate, 15min
1.3  Surface map in CLAUDE.md     ← immediate, 20min
3.2  scripts/ grouping            ← own PR, 30min
3.1  backend/ rename              ← own PR, ~2hr (careful)
3.3  shared/contracts             ← last, only if needed
```
