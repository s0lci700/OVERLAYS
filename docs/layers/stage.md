# Stage Layer

> Operator surface. The only layer that writes to the backend.

---

## What it is

The Stage layer is used by the production operator — not the cast, not the audience. It has two modes: **setup** (pre-session, configuration) and **live** (in-session, real-time control). Everything downstream — Cast interfaces and Audience overlays — reacts to what Stage emits.

## Who uses it

Production operator / Sol. Runs on a phone or tablet out of frame during recording.

---

## Responsibilities

**Pre-session (setup)**
- Create and configure characters: stats, HP, class, photo
- Load or update campaign data
- Prepare session before cast arrives

**Live session**
- Update HP (damage / heal)
- Apply and remove conditions (Poisoned, Stunned, etc.)
- Track and restore resource pools (Rage, Ki, Spell Slots)
- Trigger dice rolls — result broadcasts to Audience overlays and Cast views
- Trigger unlockable info reveals to Cast — Players

---

## Current Routes (SvelteKit)

| Route | Purpose |
|---|---|
| `/control/characters` | Live HP, conditions, resources per character |
| `/control/dice` | Dice roller — sends roll event to all clients |
| `/management/create` | Pre-session character creation form |
| `/management/manage` | Pre-session photo/data editing, bulk controls |
| `/dashboard` | Live read-only overview (operator monitor) |

## Target Routes

```
(stage)/
  setup/
    characters/     ← merged create + manage
  live/
    characters/     ← HP, conditions, resources
    dice/           ← dice roller
    overview/       ← read-only operator dashboard
```

---

## Key Files

| File | Role |
|---|---|
| `server.js` | All REST endpoints + Socket.io broadcasts |
| `data/characters.js` | PocketBase CRUD wrappers |
| `data/rolls.js` | Roll history logger |
| `control-panel/src/routes/control/` | Current live routes |
| `control-panel/src/routes/management/` | Current setup routes |
| `control-panel/src/lib/CharacterCard.svelte` | Main live control component |
| `control-panel/src/lib/CharacterCreationForm.svelte` | Character creation |
| `control-panel/src/lib/CharacterManagement.svelte` | Pre-session management |
| `control-panel/src/lib/DiceRoller.svelte` | Dice trigger component |

---

## Design Constraints

- Dense, functional UI — operator needs full control at a glance
- Mobile-first (phone in hand during recording)
- Must never interrupt cast flow — all actions are fast single-taps
- No decorative elements — clarity over aesthetics

---

## Connections

- Sends REST → `server.js` → PocketBase write
- Receives Socket.io broadcasts from server (same as all other clients)
- Its events are consumed by: Cast (DM, Players) and Audience (overlays)
