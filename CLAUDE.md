# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Project:** _Dados & Risas_ — D&D comedy show production system. The software product is called **TableRelay** (repo rename pending from `OVERLAYS`).

---

## Environment

- **OS:** Windows 11. Do NOT suggest bash/zsh solutions — use PowerShell syntax when shell commands are needed.
- **Shell:** PowerShell. Config file is at `$PROFILE` — run `echo $PROFILE` to locate it.
- **Terminal:** Windows Terminal with oh-my-posh (Gruvbox-based theme). Themes live in `AppData` or the project root.
- **Package manager:** Always use `bun`, never `npm`.
- **MCP configs:** Always go in `.mcp.json` at the project root — never in `.claude/settings.json`. Check for an existing `.mcp.json` before adding new entries.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **OVERLAYS** (4549 symbols, 5836 relationships, 107 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/OVERLAYS/context` | Codebase overview, check index freshness |
| `gitnexus://repo/OVERLAYS/clusters` | All functional areas |
| `gitnexus://repo/OVERLAYS/processes` | All execution flows |
| `gitnexus://repo/OVERLAYS/process/{name}` | Step-by-step execution trace |

## CLI

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

## System Architecture

```text
Phone / Tablet / Desktop
  └── control-panel (SvelteKit + Vite, :5173) — REST + Socket.io client
        │
        ▼
  Bun server (Express + Socket.io, :3000)
  [backend/data/characters.ts] [backend/data/rolls.ts]  ← PocketBase SDK wrappers
        │  io.emit broadcasts to ALL clients
        ▼
  PocketBase (:8090, SQLite)
        │
        ▼
  (audience)/ overlay routes (served at :5173)
  — OBS Browser Sources, listen-only via Socket.io

dados-risas-prep/  ← separate repo (Prep App)
  Session authoring → exports session.json → imported by Runtime
```

**Two applications:**

- **Runtime System** (this repo) — used _during_ recording sessions
- **Prep System** (`dados-risas-prep`, separate repo) — session authoring, exports `session.json`

**Five product surfaces** (see `control-panel/CLAUDE.md` for routes):

| Surface          | Route group           | Users      | Authority                                      |
| ---------------- | --------------------- | ---------- | ---------------------------------------------- |
| **Stage**        | `(stage)`             | Operators  | Primary write: setup, live state, reveal queue |
| **Cast/DM**      | `(cast)/dm`           | DM         | Tablet companion: combat, NPC reference        |
| **Cast/Players** | `(cast)/players/[id]` | Players    | Character sheet: read + safe fields            |
| **Commons**      | `(commons)`           | Whole room | Passive wallboard mirror, no controls          |
| **Audience**     | `(audience)`          | OBS/vMix   | Payload-driven overlays, listen-only           |

State is persisted in PocketBase. Every socket connection receives `initialData` (full character roster + roll history). Overlays and Commons **never send requests** — they only listen to Socket.io broadcasts.

## File Ownership by Surface

```
control-panel/src/
├── routes/(stage)/          ← STAGE — operators, write authority
├── routes/(cast)/           ← CAST — DM + players, mobile-first
├── routes/(audience)/       ← AUDIENCE — OBS overlays, listen-only
└── lib/
    ├── components/stage/    ← Stage components
    ├── components/cast/     ← Cast components
    ├── components/overlays/ ← Audience overlay components
    ├── components/shared/   ← UI kit (shadcn + custom primitives, ~169 files)
    ├── contracts/           ← Shared types (backend imports via @contracts/* alias)
    ├── derived/             ← stage.svelte.ts = canonical Stage state
    └── services/            ← socket.ts, pocketbase.ts, errors.ts (all current)

backend/                  ← BACKEND (Express + Socket.io)
├── actions/                 ← CharacterActions: primary mutation layer
├── data/                    ← PocketBase SDK wrappers
├── domain/                  ← Pure logic (clampHp, etc.)
├── handlers/                ← HTTP route handlers
├── socket/events/           ← Socket.io event handlers
└── state/                   ← In-memory runtime state (encounter, scene)
```

---

## Commands

Always use `bun` instead of `npm`.

**PocketBase (start first):**

- `./pocketbase serve` — starts on port 8090; admin UI at `http://127.0.0.1:8090/_/`
- `bun run scripts/seed.js` — seeds `characters` from `data/template-characters.json`; skips if records exist

**Backend (root):**

- `bun server.ts` — Express + Socket.io on port 3000 (requires PocketBase + `.env`)
- `bun run setup-ip` — auto-detect LAN IP and write root `.env` + `control-panel/.env`
- `bun run generate:tokens` — regenerate CSS from `design/tokens.json`; run after editing tokens
- `bun run optimize-assets` — compress & resize character images to webp variants
- `bun run migrate-collections` — apply PocketBase schema from `records.ts` contracts

**E2E:**

- `npx playwright test app.test.js --config tests-log/playwright.config.js`
- Manual API: `test.http` at repo root

**Required `.env` (root):**

```text
POCKETBASE_URL=http://127.0.0.1:8090
PB_MAIL=admin@example.com
PB_PASS=yourpassword
PORT=3000
CONTROL_PANEL_ORIGIN=http://localhost:5173
```

**Start order:** PocketBase → `bun server.ts` → `bun run dev -- --host` in `control-panel/`.

---

## Backend Conventions

**Tech stack versions:** This project uses `shadcn-svelte` with `bits-ui`. Before assuming any component API shape (e.g. Listbox, Dialog), verify what's actually installed: `Get-Content control-panel/package.json | Select-String bits-ui`. Do not assume components or props exist without checking — bits-ui v2 has breaking API changes from v0/v1.

**PocketBase data layer:** All functions in `backend/data/characters.ts` and `backend/data/rolls.ts` take `pb` as their first argument and are `async`. `pb.collection().getOne()` **throws** a `ClientResponseError` on 404 — use try/catch, not `if (!result)` guards.

**Key files:**

- `server.ts` — entry point (Express + Socket.io init, PocketBase auth on startup)
- `backend/router.ts` — all route registrations
- `backend/actions/characters.ts` — `CharacterActions` class: primary mutation layer (HP, conditions, resources); takes `(pb, broadcast)` in constructor
- `backend/socket/events/` — Socket.io event handlers: `character.ts`, `combat.ts`, `session.ts`
- `backend/handlers/` — `characters.ts`, `rolls.ts`, `encounter.ts`, `misc.ts`, `overlay.ts`
- `backend/data/characters.ts` — exports `getAll`, `findById`, `createCharacter`, `updateHp`, `updatePhoto`, `updateCharacterData`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources`, `removeCharacter`
- `backend/data/rolls.ts` — exports `getAll(pb)`, `logRoll(pb, {...})`
- `backend/data/id.ts` — `createShortId()` for generating 5-char IDs
- `data/template-characters.json` — seed fixture (4 characters, stable 5-char IDs like `"CH101"`)
- `design/tokens.json` — canonical token source (never edit the generated CSS files)
- `scripts/migrate-collections.ts` — applies PocketBase schema from `records.ts` contracts

**Socket flow:** Stage always sends REST first; the server's Socket.io broadcast updates shared state in all clients. Never mutate `characters` or `lastRoll` stores directly from component logic.

---

## Server Management

- **Always close servers** (Ctrl+C) to free ports before finishing a task. This is mandatory.
- Start order: PocketBase → Node server → control panel dev server.

---

## Additional References

- `SPRINT.md` — active sprint tasks (always current)
- `docs/ARCHITECTURE.md` — full data-flow diagrams and file map
- `docs/SOCKET-EVENTS.md` — complete Socket.io event payloads
- `docs/DESIGN-SYSTEM.md` — CSS tokens, component states, animation reference
- `docs/ENVIRONMENT.md` — `.env` setup, IP configuration
- `docs/THEMING.md` — token generator usage and live theme editor
- `docs/INDEX.md` — fast file map and entry points
- `control-panel/CLAUDE.md` — frontend conventions (SvelteKit, Svelte 5, components, CSS, Storybook)

---

## LLM Wiki

A persistent, queryable knowledge base for this project. Maintained incrementally by Claude sessions.

**Location:** `C:\Users\Sol\Documents\.obsidian\wiki`
**Activation:** The wiki dir is a registered Claude Code working directory. Its own `CLAUDE.md` defines all workflows.

### Operations

| Phrase                       | What happens                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `ingest sources/filename.md` | Reads a file from `sources/`, creates/updates pages, updates `index.md`, appends to `log.md` |
| `query: [question]`          | Scans `index.md`, reads relevant pages, answers with `[[wikilink]]` citations                |
| `lint the wiki`              | Audits broken links, missing index entries, stale pages — outputs structured report          |

### Current coverage (17 pages)

**Existing:** `system-architecture`, `frontend-surfaces`, `data-layer`, `character-actions`, `stage-store`, `socket-client`, `pocketbase-data`, `socket-first-pattern`, `broadcast-model`

**This batch:** `backend-architecture`, `contracts-and-types`, `frontend-services`, `sync-broadcast-reference`, `api-endpoints`, `design-system`, `component-variants`, `backlog-and-roadmap`

### Relationship to `docs/`

`docs/` is **source of truth** — raw reference files, never modified by wiki agents.
`wiki/pages/` is **synthesized knowledge** — distilled, cross-linked, queryable. When they conflict, trust `docs/` and re-ingest.

---

## Workflow Rules

**Always re-read files before analyzing.** Do NOT rely on previously cached or in-context file contents — the codebase changes frequently between sessions. When asked to audit, review, or reference a file, read it fresh first.

**Verify UI changes by code inspection, not by running servers.** Use `svelte-check` or read the final file to confirm correctness. Do not attempt to launch a browser or dev server for visual verification — Playwright and preview servers are unreliable in this environment.

**When a session is interrupted by a rate limit**, summarize current progress and list remaining TODOs clearly so work can resume in the next session without re-explaining context.

**Do not ask "should I continue?" between phases.** Keep executing the plan unless there is a genuine ambiguity that requires a decision — not just a pause for confirmation. If the next step is clear, do it.

---

## Agent Rules — How to Update the Planner

After any audit, investigation, or review:

**For tech findings (bugs, improvements, refactors):**

1. Create a GitHub Issue at: [github.com/s0lci700/OVERLAYS/issues/new](https://github.com/s0lci700/OVERLAYS/issues/new)
2. Apply labels:
   - Area: `area:frontend` ← Svelte components, CSS, overlays, design tokens
   - Area: `area:backend` ← server.ts, API routes, Socket.io, data modules, PocketBase
   - Priority: `p0` blocking / `p1` this sprint / `p2` next sprint / `p3` someday
   - Size: `size:quick` <1hr / `size:small` 1–3hr / `size:medium` 3–8hr / `size:large` 8+hr
3. Assign to the correct Milestone (Sprint 1, 2, or 3)
4. Notion task is created automatically when the area label is applied.

**For non-tech findings (outreach, session planning, content):**

Add directly to [Notion](https://notion.so/319b63b6f5ec81bcbe9aeb2b6815c88c):

- Area: `📣 Pitch & Outreach` or `🎭 Session Planning`
- These never become GitHub Issues.

### Routing cheat-sheet

| Type of finding               | Where it goes                 |
| ----------------------------- | ----------------------------- |
| Svelte component bug          | GitHub Issue, `area:frontend` |
| CSS / overlay visual fix      | GitHub Issue, `area:frontend` |
| API endpoint bug              | GitHub Issue, `area:backend`  |
| Socket.io event issue         | GitHub Issue, `area:backend`  |
| PocketBase / data layer issue | GitHub Issue, `area:backend`  |
| Contact ESDH / follow up      | Notion, Pitch & Outreach      |
| Campaign planning with Lucas  | Notion, Session Planning      |

### Label → Notion field mapping

| GitHub Label    | Notion Field | Value        |
| --------------- | ------------ | ------------ |
| `area:frontend` | Area         | 🎨 Frontend  |
| `area:backend`  | Area         | ⚙️ Backend   |
| `p0`            | Priority     | P0 — Now     |
| `p1`            | Priority     | P1 — Soon    |
| `p2`            | Priority     | P2 — Later   |
| `p3`            | Priority     | P3 — Someday |
| `size:quick`    | Size         | Quick        |
| `size:small`    | Size         | Small        |
| `size:medium`   | Size         | Medium       |
| `size:large`    | Size         | Large        |
