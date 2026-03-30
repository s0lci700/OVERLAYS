# Cast Layer

> Session reference surface for the DM and players. Read-heavy, friction-free.

---

## What it is

The Cast layer serves the people at the table during a session. It does not control anything — it receives state from Stage and presents it in context-appropriate ways. The goal is zero friction: the DM and players should find what they need without stopping the flow of the game.

It is split into two distinct interfaces with different users, different information, and different UX profiles.

---

## Cast — DM Panel

### Who uses it
The Dungeon Master. Runs on a tablet or laptop at the table, visible only to the DM.

### Responsibilities
- Initiative order and turn tracking during combat
- Monster and NPC stat sheets with contextual tooltips (what each stat means, what to roll)
- Campaign world knowledge base — searchable mid-session
- NPC templates for improvised encounters — quick fill when the DM needs to invent on the spot
- Receives unlockable info triggers from Stage — DM-initiated, pushes to Players

### Design constraints
- Fast lookup — the DM can't pause to dig through menus
- Dense but scannable — lots of information, none of it buried
- Should never require leaving the current view to get something adjacent

### Current state
Live and operational. `(cast)/dm/+page.svelte` renders the full DM panel: InitiativeStrip, SessionCards, SessionBar. Connected to Socket.io via `socket.svelte.ts`. Server-side data loaded via `+page.server.ts`.

### Target route
```
(cast)/dm/
```

---

## Cast — Players

### Who uses it
Each player, on their own phone, during a session.

### Responsibilities
- Character sheet: stats (STR, DEX, CON, INT, WIS, CHA), saving throws, proficiencies
- Automatic calculations: level-up math, HP max, modifiers, proficiency bonus, spell slots
- Contextual tooltips: what each stat does, when to roll what, common check situations
- Equipment list
- Unlockable info: terrain details, NPCs, world info — revealed progressively when DM triggers
- Personal notes — easy to add, easy to scroll back through during play

### Design constraints
- Mobile-first, one-handed — player is holding dice with the other hand
- Minimal chrome — get to the information immediately
- Passive by default — updates arrive via Socket.io, no manual refresh needed
- Personal — each player sees only their own character (routed by character ID)

### Current state
🚧 In Progress (Phase 1). Route scaffold, character data loading, and sheet UI sections (header, ability scores, saves, skills, resource tracker) are built — TASK-1.1 through TASK-1.4 done. Conditions display (TASK-1.5) and live socket overlay (TASK-1.6) still pending.

### Target route
```
(cast)/players/[id]/
```

---

## Shared Cast Constraints

- Read-only from the backend's perspective (no write endpoints called from Cast)
- All data arrives via Socket.io `initialData` on connect + live event updates
- Both interfaces must work reliably on a local LAN — internet connectivity not guaranteed during recording

---

## Key Files (current)

| File | Notes |
|---|---|
| `control-panel/src/routes/(cast)/dm/+page.svelte` | DM panel — InitiativeStrip + SessionCards |
| `control-panel/src/routes/(cast)/dm/+page.server.ts` | Server-side character data loader |
| `control-panel/src/routes/(cast)/players/[id]/+layout.svelte` | Player sheet layout — loads character record |
| `control-panel/src/lib/components/cast/dm/InitiativeStrip.svelte` | Turn tracker |
| `control-panel/src/lib/components/cast/dm/SessionCard.svelte` | Per-character DM card |
| `control-panel/src/lib/components/cast/players/CharacterSheet.svelte` | Main character sheet component |
| `control-panel/src/lib/components/cast/players/ResourceTracker.svelte` | Pool resource tracker (spell slots, rage, etc.) |

---

## Connections

- Receives Socket.io broadcasts from `server.js`
- DM triggers unlock events → Stage broadcasts → Players receive
- No REST calls to the backend from Cast interfaces
