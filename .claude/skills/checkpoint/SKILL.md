---
name: checkpoint
description: Execute exactly one phase of a multi-phase plan, then stop and summarize remaining work. Use when breaking large tasks into rate-limit-safe sessions.
argument-hint: /checkpoint <N> <plan summary or task description>
---

# Checkpoint Skill

Execute **one phase only** of a multi-phase plan. Stop cleanly after that phase. Leave the next session a clear handoff.

This skill exists because large multi-phase plans consistently get cut short by rate limits — leaving work incomplete with no summary of what remains. One phase per session, with a written handoff, solves this.

---

## Argument

`$ARGUMENTS` contains:
- The phase number: `1`, `2`, `3`, etc.
- A description of the overall plan or a reference to a plan file

Examples:
- `/checkpoint 1 shadcn-svelte migration plan in SPRINT.md`
- `/checkpoint 2 decompose CharacterCard into sub-components`
- `/checkpoint 1 migrate MultiSelect, Dialog, and SessionCard to bits-ui v2`

---

## Workflow

### Before starting

1. Identify the full plan (read the referenced file or ask the user to describe all phases)
2. Confirm which phase number is being executed
3. State clearly: **"Executing Phase $N. Will stop after this phase."**

### During the phase

- Work only on the deliverables for this phase
- If you discover something that affects a later phase, **note it** — do not fix it now
- If the phase is ambiguous, ask before starting (not mid-execution)

### When the phase is complete

Run verification appropriate to the work done:
- Code changes: `bun run lint && bun run build` from `control-panel/`
- Doc changes: re-read the updated files and confirm accuracy
- Config changes: validate JSON syntax

**Do not claim the phase is done until verification passes.**

### Handoff summary (always write this at the end)

Output a structured handoff:

---

## ✓ Phase $N Complete

**What was done:**
- [bullet list of concrete changes made]

**Verification:**
- `bun run lint` — [passed / N warnings]
- `bun run build` — [passed / failed with: ...]

**Remaining phases:**
| Phase | Description | Estimated size |
|-------|-------------|---------------|
| $N+1  | ...         | small / medium / large |
| $N+2  | ...         | ...           |

**To continue:** `/checkpoint $N+1 [same plan description]`

**Watch out for in Phase $N+1:**
- [anything discovered during this phase that affects the next one]

---

## Rules

- **Stop after one phase.** Do not roll into the next phase even if you have context budget remaining.
- **Write the handoff summary even if the phase failed.** Especially if it failed — explain what blocked it.
- **If a phase is too large for one session**, split it and say so in the handoff. Better to split proactively than get cut off mid-phase.
- **Prefer small, committed checkpoints.** Each phase should leave the codebase in a working state — not mid-refactor.
- **If rate limit hits mid-phase**, output as much of the handoff summary as possible before stopping.
