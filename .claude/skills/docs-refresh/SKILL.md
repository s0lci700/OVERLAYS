---
name: docs-refresh
description: Audit and regenerate project documentation. Re-reads source files fresh before writing anything. Use when docs may be stale or a module lacks documentation.
argument-hint: /docs-refresh [target] — target is a file, directory, or "all". Defaults to "all".
---

# Docs Refresh Skill

Audit and regenerate documentation in `docs/` for the TableRelay project.

**Always re-read source files before writing. Never rely on cached or in-context file contents.**

---

## Argument

`$ARGUMENTS` is the refresh target:
- A specific file: `server.js`, `data/characters.js`, etc.
- A directory: `data/`, `control-panel/src/lib/services/`, etc.
- `all` or empty: full audit across the whole codebase

---

## Workflow

### Step 0 — Pull Notion context (always do this first)

Project updates, sprint decisions, and session planning live in Notion — not just the codebase. Pull this before touching any files.

1. Use the `notion-search` MCP tool to search for **"TableRelay"** and **"Dados & Risas"** — look for:
   - Sprint task pages (active sprint status, completed/in-progress work)
   - Session planning notes (new features decided, things being built)
   - Any pages titled "Architecture", "Tech", "Backend", or "Frontend"
2. Check `SPRINT.md` in the repo root — it should match what Notion shows; note any discrepancies
3. Build a mental model of: *what changed recently that the docs might not know about yet?*

> If Notion MCP is unavailable, skip to Step 1 but note at the top of your report: "Notion not checked — manual review recommended."

---

### Step 1 — Orient

Read `docs/README.md` to understand what docs exist and what each covers.
Read `docs/INDEX.md` for the file map.

### Step 2 — Freshness audit

For each source file in scope:

1. **Read the source file now** (do not assume you know its contents)
2. Extract: exported functions/types, Socket.io events emitted/received, component props, key side effects
3. Find the corresponding doc in `docs/` (if any)
4. Classify the doc as one of:
   - `current` — accurately reflects the source
   - `stale` — references renamed/removed APIs or missing new ones
   - `missing` — no doc exists for this module
   - `orphaned` — doc references code that no longer exists

### Step 3 — Report before writing

Output a table:

| File | Doc | Status | Issues |
|------|-----|--------|--------|
| `server.js` | `docs/ARCHITECTURE.md` | stale | missing `/roll` route added in last sprint |
| `data/rolls.js` | — | missing | no doc exists |

Ask: "Regenerate stale/missing docs?" before proceeding.

### Step 4 — Regenerate

For each `stale` or `missing` doc:

1. Re-read the source file (even if you just read it in Step 2 — confirm freshness)
2. Write or update the doc following the format below
3. Update `docs/README.md` index if a new file was created

---

## Doc Format

Each module doc should include:

```markdown
# <Module Name>

> Last updated: <date>

## Purpose
One paragraph: what this module does and why it exists.

## Exports / API
List every exported function/component with signature + description.

## Socket Events (if applicable)
| Event | Direction | Payload | When |
|-------|-----------|---------|------|

## Dependencies
What it imports from. What it requires to be running (PocketBase, etc.).

## Usage Examples
Short code snippets showing the most common call patterns.

## Known Limitations / TODOs
Anything a future dev should know before editing this.
```

---

## Scope Rules

| Path | Docs home | Notes |
|------|-----------|-------|
| `server.js` | `docs/ARCHITECTURE.md` | Main Express/Socket.io entrypoint |
| `data/*.js` | `docs/ARCHITECTURE.md` | PocketBase data layer |
| `design/tokens.json` | `docs/DESIGN-SYSTEM.md` | Token source of truth |
| `control-panel/src/lib/services/` | `docs/ARCHITECTURE.md` | Frontend services |
| `control-panel/src/lib/components/ui/` | `docs/UI-COMPONENTS.md` | UI primitives |
| Socket.io events | `docs/SOCKET-EVENTS.md` | Payloads + direction |
| `.env` structure | `docs/ENVIRONMENT.md` | Required vars |

---

## Hard Rules

- **Never write a doc from memory.** Read the source first, every time.
- **Notion is a source of truth alongside the code.** Sprint decisions, session planning, and feature intent live there — docs should reflect both.
- Cross-reference `docs/SOCKET-EVENTS.md` against actual `io.emit` / `socket.on` calls in `server.js` and `socket.js` — these drift fastest.
- If a doc in `docs/done/` is referenced, note that it's archived — do not update it.
- Do not edit generated CSS files (`generated-tokens.css`). The source of truth is `design/tokens.json`.
- If Notion and the codebase disagree (e.g. Notion says a feature was planned but code doesn't have it yet), note the gap in the doc under **Known Limitations / TODOs** rather than silently ignoring it.
