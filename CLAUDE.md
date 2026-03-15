# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Project:** *Dados & Risas* — D&D comedy show production system. The software product is called **TableRelay** (repo rename pending from `OVERLAYS`).

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
| --- | --- |
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
  [data/characters.js] [data/rolls.js]  ← PocketBase SDK wrappers
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

- **Runtime System** (this repo) — used *during* recording sessions
- **Prep System** (`dados-risas-prep`, separate repo) — session authoring, exports `session.json`

**Five product surfaces** (see `control-panel/CLAUDE.md` for routes):

| Surface | Route group | Users | Authority |
| --- | --- | --- | --- |
| **Stage** | `(stage)` | Operators | Primary write: setup, live state, reveal queue |
| **Cast/DM** | `(cast)/dm` | DM | Tablet companion: combat, NPC reference |
| **Cast/Players** | `(cast)/players/[id]` | Players | Character sheet: read + safe fields |
| **Commons** | `(commons)` | Whole room | Passive wallboard mirror, no controls |
| **Audience** | `(audience)` | OBS/vMix | Payload-driven overlays, listen-only |

State is persisted in PocketBase. Every socket connection receives `initialData` (full character roster + roll history). Overlays and Commons **never send requests** — they only listen to Socket.io broadcasts.

---

## Commands

Always use `bun` instead of `npm`.

**PocketBase (start first):**

- `./pocketbase serve` — starts on port 8090; admin UI at `http://127.0.0.1:8090/_/`
- `bun run scripts/seed.js` — seeds `characters` from `data/template-characters.json`; skips if records exist

**Backend (root):**

- `bun server.js` — Express + Socket.io on port 3000 (requires PocketBase + `.env`)
- `bun run setup-ip` — auto-detect LAN IP and write root `.env` + `control-panel/.env`
- `bun run generate:tokens` — regenerate CSS from `design/tokens.json`; run after editing tokens

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

**Start order:** PocketBase → `bun server.js` → `bun run dev -- --host` in `control-panel/`.

---

## Backend Conventions

**PocketBase data layer:** All functions in `data/characters.js` and `data/rolls.js` take `pb` as their first argument and are `async`. `pb.collection().getOne()` **throws** a `ClientResponseError` on 404 — use try/catch, not `if (!result)` guards.

**Key files:**

- `server.js` — all Express routes, Socket.io setup, PocketBase auth on startup (`connectToPocketBase()` — exits with code 1 on failure)
- `data/characters.js` — exports `getAll`, `createCharacter`, `updateHp`, `updatePhoto`, `updateCharacterData`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources`
- `data/rolls.js` — exports `getAll(pb)`, `logRoll(pb, {...})`
- `data/template-characters.json` — seed fixture (4 characters, stable 5-char IDs like `"CH101"`)
- `design/tokens.json` — canonical token source (never edit the generated CSS files)

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

## Agent Rules — How to Update the Planner

After any audit, investigation, or review:

**For tech findings (bugs, improvements, refactors):**

1. Create a GitHub Issue at: [github.com/s0lci700/OVERLAYS/issues/new](https://github.com/s0lci700/OVERLAYS/issues/new)
2. Apply labels:
   - Area: `area:frontend` ← Svelte components, CSS, overlays, design tokens
   - Area: `area:backend` ← server.js, API routes, Socket.io, data modules, PocketBase
   - Priority: `p0` blocking / `p1` this sprint / `p2` next sprint / `p3` someday
   - Size: `size:quick` <1hr / `size:small` 1–3hr / `size:medium` 3–8hr / `size:large` 8+hr
3. Assign to the correct Milestone (Sprint 1, 2, or 3)
4. Notion task is created automatically when the area label is applied.

**For non-tech findings (outreach, session planning, content):**

Add directly to [Notion](https://notion.so/319b63b6f5ec81bcbe9aeb2b6815c88c):

- Area: `📣 Pitch & Outreach` or `🎭 Session Planning`
- These never become GitHub Issues.

### Routing cheat-sheet

| Type of finding | Where it goes |
| --- | --- |
| Svelte component bug | GitHub Issue, `area:frontend` |
| CSS / overlay visual fix | GitHub Issue, `area:frontend` |
| API endpoint bug | GitHub Issue, `area:backend` |
| Socket.io event issue | GitHub Issue, `area:backend` |
| PocketBase / data layer issue | GitHub Issue, `area:backend` |
| Contact ESDH / follow up | Notion, Pitch & Outreach |
| Campaign planning with Lucas | Notion, Session Planning |

### Label → Notion field mapping

| GitHub Label | Notion Field | Value |
| --- | --- | --- |
| `area:frontend` | Area | 🎨 Frontend |
| `area:backend` | Area | ⚙️ Backend |
| `p0` | Priority | P0 — Now |
| `p1` | Priority | P1 — Soon |
| `p2` | Priority | P2 — Later |
| `p3` | Priority | P3 — Someday |
| `size:quick` | Size | Quick |
| `size:small` | Size | Small |
| `size:medium` | Size | Medium |
| `size:large` | Size | Large |
