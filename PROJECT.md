# TableRelay — Project Architecture

> Single source of truth for the system structure. Read this first.
> For setup and commands, see `CLAUDE.md`. For API reference, see `docs/ARCHITECTURE.md`.

---

## What this is

**TableRelay** is a real-time session management system for live D&D recording and streaming. It handles four distinct concerns — operator control, DM reference, player reference, and broadcast output — within a single deployment.

It is not just an overlay tool. Overlays are one output layer.

---

## The Four Layers

```
┌─────────────────────────────────────────────────────┐
│  STAGE (operator)                                   │
│  Pre-session setup + live session control           │
│  Owns all state. The only layer that writes.        │
└────────────┬─────────────────────┬──────────────────┘
             │ state feed          │ event triggers
             ▼                     ▼
┌────────────────────┐   ┌─────────────────────────────┐
│  CAST (read-heavy) │   │  AUDIENCE (pure output)     │
│                    │   │                             │
│  ┌─────────────┐   │   │  OBS overlay components     │
│  │  DM Panel   │   │   │  React to Stage events      │
│  └─────────────┘   │   │  No user interaction        │
│  ┌─────────────┐   │   └─────────────────────────────┘
│  │  Players    │   │
│  └─────────────┘   │
└────────────────────┘
```

### Stage
The operator surface. Used by the production team before and during a session.

- **Pre-session:** character creation, stat setup, campaign data entry
- **Live:** HP updates, conditions, resource tracking, dice triggers
- The only layer with write access to the backend
- Triggers overlay events to Audience
- Feeds initial and live state to Cast

### Cast — DM Panel
Used by the Dungeon Master during a session. Read-heavy, fast-access reference.

- Initiative order and turn tracking
- Monster and NPC stat sheets with contextual tooltips
- Campaign world knowledge base (accessible mid-session)
- NPC templates for improvised encounters
- Receives unlockable info triggers from Stage

### Cast — Players
Used by each player on their phone during a session. Personal and frictionless.

- Character sheet: stats, saving throws, proficiencies, equipment
- Automatic level-up calculations (HP, modifiers, spell slots, prof. bonus)
- Contextual tooltips on all stats (what to roll, when, why)
- Unlockable info: terrain, NPCs, world details — revealed progressively by DM
- Personal notes, easy to update mid-session

### Audience
OBS overlay components. No user interaction — pure reactive output.

- HP bars with health-state animations
- Dice roll popup with crit/fail detection
- Active conditions panel

---

## Data & Trigger Flow

```
Stage (operator action)
  → REST PUT/POST to server.js
  → PocketBase write
  → Socket.io broadcast to ALL clients
       ├── Cast interfaces update their read views
       └── Audience overlays react to event triggers
```

Stage is the only initiator. Cast and Audience are consumers.

---

## Current State vs. Target

| Layer | Status | Location |
|---|---|---|
| Stage — pre-session | ✅ Built | `/control/management/*` |
| Stage — live session | ✅ Built | `/control/characters`, `/control/dice` |
| Cast — DM Panel | ⚠️ Prototype | `dm-session-panel.html` (reference only) |
| Cast — Players | ❌ Not built | New — mobile character sheet |
| Audience — HP overlay | ✅ Built | `public/overlay-hp.html` |
| Audience — Dice overlay | ✅ Built | `public/overlay-dice.html` |
| Audience — Conditions | ✅ Built | `public/overlay-conditions.html` |
| Backend / server | ✅ Built | `server.js` + PocketBase |

---

## Target Route Structure

The SvelteKit app (`control-panel/`) maps directly to the four layers via route groups.
Each group has its own layout, design language, and UX profile.

```
control-panel/src/routes/

(stage)/                    ← Operator UI: dense, functional, full control
  setup/
    characters/             ← was /management/create + /management/manage
  live/
    characters/             ← was /control/characters
    dice/                   ← was /control/dice
    overview/               ← was /dashboard (operator read view)

(cast)/                     ← Session UI: clean, fast, mobile-first, low friction
  dm/                       ← DM panel [partially built, needs structure]
  players/[id]/             ← Player sheet [not built]

(audience)/                 ← Broadcast UI: full-screen, no chrome, OBS-targeted
  hp/                       ← was public/overlay-hp.html
  dice/                     ← was public/overlay-dice.html
  conditions/               ← was public/overlay-conditions.html
```

Migration note: `public/overlay-*.html` stays functional until `(audience)/` routes
are built in Svelte. They can coexist during transition.

---

## Repo rename

The current repo is named `OVERLAYS` — a misnomer from the original MVP scope. Target name: **TableRelay** (`tablerelay`). When ready: rename on GitHub, update the GitNexus index name in `CLAUDE.md`, update any deploy configs (`railway.toml`, `nixpacks.toml`).

---

## Scope for Session 0

Session 0 is a live test with the cast before real recording. Minimum needed:

- **Stage:** working as-is — HP, conditions, dice, character management
- **Cast — DM Panel:** basic initiative tracker + monster stat reference
- **Cast — Players:** basic character sheet (stats, HP, equipment)
- **Audience:** working as-is — no changes needed

Player character sheet is the highest-priority new build before Session 0.

---

## What this project is not

- Not a dice replacement — physical dice stay on the table
- Not a rules engine — it references rules, it doesn't enforce them
- Not a streaming platform — it feeds OBS, it doesn't replace it
- Not the pitch to ESDH — that context lives in `/PITCH ESDH/`

---

## Related Docs

| Doc | What it covers |
|---|---|
| `CLAUDE.md` | Commands, conventions, LLM working instructions |
| `docs/ARCHITECTURE.md` | Full data-flow diagrams, file map, API reference |
| `docs/SOCKET-EVENTS.md` | Complete Socket.io event payloads |
| `docs/DESIGN-SYSTEM.md` | CSS tokens, component states, animation |
| `docs/ENVIRONMENT.md` | `.env` setup, IP config, overlay URLs |
