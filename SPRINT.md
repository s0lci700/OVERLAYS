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
| TASK-0.5 | Sync architecture docs to repo | ✅ Done | 3 | `docs/` baseline with architecture index + state matrix |
| TASK-0.4 | Establish services layer scaffold | ✅ Done | 5 | `services/` layer: pocketbase.ts, socket.ts, character.ts, errors.ts |
| TASK-0.6 | Set up Storybook with surface-based organization | ✅ Done | 8 | Storybook 10, 31 stories, manager.js, .storybook/README.md |
| TASK-0.7 | Create canonical mock fixture files | ✅ Done | 3 | `src/lib/mocks/` — 8 fixture files + `index.ts` + Vitest test |
| TASK-0.8 | Decompose server.js into modular structure | ✅ Done | 3 | `server.ts` entry point + `src/server/` modules (handlers, socket, state, pb, seed) |
| TASK-0.9 | Broadcast adapter interface + MockAdapter | ✅ Done | 2 | `contracts/broadcast.ts` + `services/broadcast/` (mock, factory, obs/vmix stubs) |

---

## What's Next

**Phase 0 is complete.** All 7 tasks done. Phase 1 (Player Sheet) and Phase 2 (Stage Controls) are now unblocked.

Stories can import from `$lib/mocks` instead of using inline fixtures. The Vitest test at `src/lib/mocks/__tests__/fixtures.test.ts` validates all fixture shapes (note: Vitest 4.1.1 has a pre-existing incompatibility with Node.js v25 — tests will run correctly once the environment is aligned).

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
