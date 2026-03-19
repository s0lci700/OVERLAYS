# Phase 0 — Foundation & DX

**Milestone:** Session 0 LAN Test
**Progress:** 4 of 7 tasks done · 14 of 30 pts complete

---

## Status Board

| ID | Task | Status | Pts | Notes |
| --- | --- | --- | --- | --- |
| TASK-0.1 | Standardize naming conventions across codebase | ✅ Done | 3 | Surface names (Stage/Cast/Commons) applied throughout |
| TASK-0.2 | Define shared contract type modules | ✅ Done | 5 | `src/lib/contracts/` — 6 `.ts` files + `records.ts` |
| TASK-0.3 | Align SvelteKit directory to surface map | ✅ Done | 3 | Domain-first component dirs, `$lib/` aliases throughout |
| TASK-0.5 | Sync architecture docs to repo | ✅ Done | 3 | `docs/` baseline with architecture index + state matrix |
| TASK-0.4 | Establish services layer scaffold | 🚧 In Progress | 5 | Unblocked — TASK-0.2 is done |
| TASK-0.6 | Set up Storybook with surface-based organization | 📋 Planned | 8 | Surface dirs: Stage/ Cast/ Commons/ Audience/ Shared/ |
| TASK-0.7 | Create canonical mock fixture files | 📋 Planned | 3 | Blocked by TASK-0.6 |

---

## What's Next

**TASK-0.4** is unblocked and should go first — creates `src/lib/services/` with typed modules for PocketBase (`pocketbase.ts`), Socket.io (`socket.ts`), and character data access (`character.ts`). After this, no component/route should import `pocketbase` or `socket.io-client` directly.

**TASK-0.6** — Storybook 8 in `control-panel/`, Svelte 5 + SvelteKit + Vite config, full isolation (no backend). Moved from Phase 7 to Phase 0 so stories can be written alongside components from Phase 1.

**TASK-0.7** — `src/lib/mocks/` with 8 TypeScript fixture files (`players.ts`, `combat.ts`, `commons.ts`, `overlays.ts`, `stage.ts`, `dm.ts`, `dice.ts`, `npc.ts`) + barrel `index.ts`. Runs after TASK-0.6.

---

## Dependency chain

```text
TASK-0.2 ✅ → TASK-0.4 → Phase 1 (Player Sheet)
                        → Phase 2 (Stage Controls)
TASK-0.2 ✅ → TASK-0.7
TASK-0.6    → TASK-0.7 → All Phase 1–5 stories
```

---

*Source: [Notion Roadmap](https://www.notion.so/31eb63b6f5ec81e5a168cf7d204b6d78) — Phase 0 board*
