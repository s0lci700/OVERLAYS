# DX Improvement Plan

Goal: make the codebase easier to preview, modify, and understand.

---

## Guiding Principle

Improve DX after architecture clarity.

---

# Tier 1 (Highest Value)

## Naming Cleanup

Unify terminology:

Dashboard → Session Display
Control Panel → Stage
Audience → Overlays

Clear naming improves UX and DX.

---

## Plain‑JS Contract Modules

Create modules:

src/lib/contracts/events.js
src/lib/contracts/rolls.js
src/lib/contracts/stage.js
src/lib/contracts/cast.js
src/lib/contracts/commons.js
src/lib/contracts/overlays.js

These hold:

- event names
- enums
- payload types
- state keys

---

## Record‑Driven Previewability

Rule:

Sheet/detail routes must render from records first.

Examples:

/players/[id]
/dm/npcs/[id]
/dm/enemies/[id]

Then attach live state if needed.

---

## Docs Sync

Maintain:

architecture.md
state-ownership-matrix.md
contracts-inventory.md
DX-improvement-plan.md

---

# Tier 2 (Structure)

## Directory Alignment

routes:
(stage)
(cast)
(commons)

lib:
components/stage
components/cast/dm
components/cast/players
components/commons
contracts
services
derived

---

## Domain‑First Components

Prefer:

components/stage/live
components/cast/dm
components/commons

Avoid generic folders like widgets.

---

# Tier 3 (Workflow)

## Storybook‑First Development

Use Storybook for:

- player sheet sections
- DM cards
- Commons widgets
- overlay components

Use mock view‑models instead of real backend state.

---

## Dev Preview Data

Add:

- sample characters
- mock commons state
- overlay payload previews

---

## Scripts

Standardize:

dev
storybook
seed
reset

---

## Runtime Confidence

Improve:

- socket connection indicator
- sync timestamps
- clear error states

---

# Good DX Means

Developers can:

- find the correct surface quickly
- render a view without full runtime
- preview UI in Storybook
- understand if data is record, live, event, or display