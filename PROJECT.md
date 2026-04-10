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
| Stage — pre-session | ✅ Built | `/setup/create`, `/setup/manage` |
| Stage — live session | ✅ Built | `/live/characters`, `/live/dice`, `/overview` |
| Cast — DM Panel | ✅ Built | `/dm` |
| Cast — Players | 🚧 Route only | `/players/[id]` — sheet UI is Phase 1 work |
| Commons | 📋 Planned | Phase 3 — route group not yet created |
| Audience — overlays | ✅ Built | `/persistent/*`, `/moments/*`, `/scene`, `/announcements`, `/show/*` |
| Backend / server | ✅ Built | `server.ts` + `backend/` modules + PocketBase |

---

## Target Route Structure

The SvelteKit app (`control-panel/`) maps directly to the four layers via route groups.
Each group has its own layout, design language, and UX profile.

```
control-panel/src/routes/

(stage)/                    ← Operator UI: dense, functional, full control
  setup/
    create/
    manage/
  live/
    characters/
    dice/
  overview/

(cast)/                     ← Session UI: clean, fast, mobile-first, low friction
  dm/
  players/[id]/

(audience)/                 ← Broadcast UI: full-screen, no chrome, OBS-targeted
  persistent/
    hp/
    conditions/
    turn-order/
    focus/
  moments/
    dice/
    player-down/
    level-up/
  scene/
  announcements/
  show/
    lower-third/
    stats/
    recording-badge/
    break/
```

Migration note: legacy `public/overlay-*.html` references in historical docs remain for audit context, but the active overlay surfaces are SvelteKit routes under `(audience)/`.

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
