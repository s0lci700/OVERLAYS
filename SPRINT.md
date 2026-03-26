> Auto-generated from `backlog/`. Run `/doc-steward backlog-sync` to pull latest from Notion.
> For full task details see `backlog/phase-N/TASK-N.N.md`. Source of truth: Notion Roadmap.

---

# Phase 0 — Foundation & DX

**Milestone:** Session 0 LAN Test
**Progress:** 9 of 9 tasks done · 35 of 35 pts complete · **Phase 0 complete ✅**

---

## Status Board

| ID | Task | Status | Pts | Notes |
| --- | --- | --- | --- | --- |
| TASK-0.1 | Standardize naming conventions across codebase | ✅ Done | 3 | Surface names (Stage/Cast/Commons) applied throughout |
| TASK-0.2 | Define shared contract type modules | ✅ Done | 5 | `src/lib/contracts/` — 6 `.ts` files + `records.ts` |
| TASK-0.3 | Align SvelteKit directory to surface map | ✅ Done | 3 | Domain-first component dirs, `$lib/` aliases throughout |
| TASK-0.4 | Establish services layer scaffold | ✅ Done | 5 | `services/` layer: pocketbase.ts, socket.ts, character.ts, errors.ts |
| TASK-0.5 | Sync architecture docs to repo | ✅ Done | 3 | `docs/` baseline with architecture index + state matrix |
| TASK-0.6 | Set up Storybook with surface-based organization | ✅ Done | 8 | Storybook 10, 31 stories, manager.js, .storybook/README.md |
| TASK-0.7 | Create canonical mock fixture files | ✅ Done | 3 | `src/lib/mocks/` — 8 fixture files + `index.ts` + Vitest test |
| TASK-0.8 | Decompose server.js into modular structure | ✅ Done | 3 | `server.ts` entry point + `src/server/` modules (handlers, socket, state, pb, seed) |
| TASK-0.9 | Broadcast adapter interface + MockAdapter | ✅ Done | 2 | `contracts/broadcast.ts` + `services/broadcast/` (mock, factory, obs/vmix stubs) |

---

## Dependency chain

```text
TASK-0.2 ✅ → TASK-0.4 ✅ → Phase 1 (Player Sheet)
                           → Phase 2 (Stage Controls)
TASK-0.2 ✅ → TASK-0.7
TASK-0.6 ✅ → TASK-0.7 → All Phase 1–5 stories
```

---

*Source: [Notion Roadmap](https://www.notion.so/31eb63b6f5ec81e5a168cf7d204b6d78) — Phase 0 board*

---

# Phase 1 — Player Sheet

**Goal:** Build a functional digital character sheet for players on mobile.
**Milestone:** Session 0 LAN Test
**Progress:** 0 of 7 tasks done · 0 of 33 pts complete

---

## Status Board

| ID | Task | Status | Pts | Notes |
| --- | --- | --- | --- | --- |
| TASK-1.1 | Define PocketBase character collections | 🚧 In Progress | 5 | Schema + migration script ready — see [backlog/phase-1/TASK-1.1.md](backlog/phase-1/TASK-1.1.md) |
| TASK-1.2 | Build record-driven character page | 🔲 Todo | 8 | `(cast)/players/[id]` — load from PocketBase via `character.ts` service |
| TASK-1.3 | Ability scores + derived values engine | 🔲 Todo | 3 | Compute modifiers, saves, skills from raw ability scores |
| TASK-1.4 | Build resource tracker component | 🔲 Todo | 5 | Pool-based resources (Rage, Spell Slots, etc.) with recharge type display |
| TASK-1.5 | Build conditions/status display component | 🔲 Todo | 5 | Active conditions list with intensity — uses `condition-pill` from Phase 0 |
| TASK-1.6 | Wire live state socket overlay — HP, conditions | 🔲 Todo | 5 | Subscribe to `hp_updated`, `condition_added/removed` via `character.ts` |
| TASK-1.7 | Story coverage audit — Cast/Players | 🔲 Todo | 2 | End-of-phase Storybook coverage check for all Cast/Players components |

---

## Dependency chain

```text
TASK-1.1 → TASK-1.2 → TASK-1.3
                     → TASK-1.4
                     → TASK-1.5
                     → TASK-1.6 (requires socket.ts + contracts from Phase 0 ✅)
```

---

*Source: [Notion — Phase 1 Player Sheet](https://www.notion.so/31eb63b6f5ec8138bc31d91a3fa4a4ab)*
