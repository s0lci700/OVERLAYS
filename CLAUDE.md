# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Project:** *Dados & Risas* — D&D comedy show production system. The software product is called **TableRelay** (repo rename pending from `OVERLAYS`).

---

## Environment

- **OS:** Windows 11. Do NOT suggest bash/zsh solutions — use PowerShell syntax when shell commands are needed.
- **Shell:** PowerShell. Config file is at `$PROFILE` — run `echo $PROFILE` to locate it.
- **Terminal:** Windows Terminal with oh-my-posh (Gruvbox-based theme). Themes live in `AppData` or the project root.
- **Package manager:** Always use `bun`, never `npm`.
- **MCP configs:** Always go in `.mcp.json` at the project root — never in `.claude/settings.json`. Check for an existing `.mcp.json` before adding new entries.

<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **OVERLAYS** (5144 symbols, 17239 relationships, 300 execution flows).

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

### Windows Setup (v1.3.6 Workaround)

**Issue:** GitNexus v1.4.9+ fails on Windows with native module errors (tree-sitter ABI mismatch, @ladybugdb/core ERR_DLOPEN_FAILED).

**Solution:** This project pins `gitnexus@1.3.6` in `package.json` with `kuzu` as an explicit runtime dependency.

**To run gitnexus commands:**

```powershell
nvm use 20                  # Ensure Node v20.19.0 (v20 LTS recommended)
bunx gitnexus analyze       # Index the repository
bunx gitnexus mcp           # Start GitNexus MCP server for editor integration
```

> **Note:** kuzu's postinstall script must complete during `bun install`. If `bunx gitnexus` fails with "Cannot find module 'kuzu/index.mjs'", run: `cd node_modules/kuzu && node install.js && cd../..` to restore the prebuilt binary.

**Why v1.3.6?** v1.4.9 upgraded tree-sitter (0.21→0.25.0) and added @ladybugdb/core, both of which require prebuilt binaries matching the exact Node ABI. Windows prebuilds are unavailable, so builds fail. v1.3.6 uses kuzu natively and works reliably on Node 20.

<!-- gitnexus:end -->

---

## System Architecture

```text
Phone / Tablet / Desktop
  └── control-panel (SvelteKit + Vite, :5173) — REST + Socket.io client
        │
        ▼
  Bun server (Express + Socket.io, :3000)
  [src/server/data/characters.ts] [src/server/data/rolls.ts]  ← PocketBase SDK wrappers
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

- `bun server.ts` — Express + Socket.io on port 3000 (requires PocketBase + `.env`)
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

**Start order:** PocketBase → `bun server.ts` → `bun run dev -- --host` in `control-panel/`.

---

## Backend Conventions

**Tech stack versions:** This project uses `shadcn-svelte` with `bits-ui`. Before assuming any component API shape (e.g. Listbox, Dialog), verify what's actually installed: `cat control-panel/package.json | grep bits-ui`. Do not assume components or props exist without checking — bits-ui v2 has breaking API changes from v0/v1.

**PocketBase data layer:** All functions in `src/server/data/characters.ts` and `src/server/data/rolls.ts` take `pb` as their first argument and are `async`. `pb.collection().getOne()` **throws** a `ClientResponseError` on 404 — use try/catch, not `if (!result)` guards.

**Key files:**

- `server.ts` — entry point (Express + Socket.io init, PocketBase auth on startup)
- `src/server/router.ts` — all route registrations
- `src/server/handlers/` — `characters.ts`, `rolls.ts`, `encounter.ts`, `misc.ts`, `overlay.ts`
- `src/server/data/characters.ts` — exports `getAll`, `findById`, `createCharacter`, `updateHp`, `updatePhoto`, `updateCharacterData`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources`, `removeCharacter`
- `src/server/data/rolls.ts` — exports `getAll(pb)`, `logRoll(pb, {...})`
- `src/server/data/id.ts` — `createShortId()` for generating 5-char IDs
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
