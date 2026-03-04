# Audience Layer

> Broadcast output. OBS-targeted overlays. No user interaction.

---

## What it is

The Audience layer is the visible production layer — what appears on screen during recording or streaming. It consists of Svelte 5 overlay components served as SvelteKit routes under `(audience)/`, loaded as OBS Browser Sources. They connect to the server via Socket.io and react to events triggered by Stage. They never send requests. They never require input.

---

## Who uses it

Nobody directly — overlays are consumed by OBS and visible to the viewing audience. The production operator (Stage) controls what appears by triggering events.

---

## Responsibilities

- Display character HP bars with condition-reactive animations and heal-flash
- Show dice roll results with animation — crit and fail states
- Show active conditions panel when characters have status effects
- Broadcast generic announcements (location reveals, NPC intros, knowledge unlocks)
- Display dramatic moments: player down / KO, level-up beats
- Show production layer: lower-thirds nameplate, session stats, recording badge, break slate

---

## OBS Browser Source URLs

All URLs: `http://[IP]:5173/[path]?server=http://[IP]:3000`

| Path | Component | Description |
|---|---|---|
| `/persistent/hp` | `OverlayHP` | HP bars + condition animations + heal-flash |
| `/persistent/conditions` | `OverlayConditions` | Active conditions + depleted resources |
| `/persistent/turn-order` | `OverlayTurnOrder` | Initiative strip (combat only) |
| `/persistent/focus` | `OverlayCharacterFocus` | Character focus panel (DM-triggered) |
| `/moments/dice` | `OverlayDice` | Roll result card — bounce, crit/fail, auto-hide |
| `/moments/player-down` | `OverlayPlayerDown` | 0 HP / KO dramatic moment |
| `/moments/level-up` | `OverlayLevelUp` | Level-up achievement beat |
| `/scene` | `OverlaySceneTitle` | Scene / location title card |
| `/announcements` | `OverlayAnnounce` | Generic announcement modal (location, npc, knowledge, custom, sponsor) |
| `/show/lower-third` | `OverlayLowerThird` | Character nameplate lower third |
| `/show/stats` | `OverlayStats` | Session stats (crits / pifias / downs counter) |
| `/show/recording-badge` | `OverlayRecordingBadge` | GRABANDO indicator (triggered by sync_start) |
| `/show/break` | `OverlayBreak` | Break slate — "VOLVEMOS EN UN MOMENTO" |

---

## OBS Setup

- Each overlay is a Browser Source at 1920×1080 with transparent background
- Enable "Refresh browser when scene becomes active"
- Disable "Shut down source when not visible"
- Use Global Sources (Add Existing) to share one Browser Source across scenes

---

## Shared Infrastructure

All overlays share:

| File | Role |
|---|---|
| `overlays/shared/conditionEffects.js` | `CONDITION_EFFECTS` map + `getConditionClasses()` |
| `overlays/shared/animations.js` | Named anime.js patterns (fadeInFromBottom, critPop, screenFlash, etc.) |
| `overlays/shared/overlaySocket.svelte.js` | Svelte 5 composable — wraps io(), bootstraps state, onDestroy cleanup |
| `overlays/overlays.css` | Condition keyframes (is-poisoned, is-burning, is-unconscious, heal-flash, etc.) |

---

## Socket Events Consumed

| Event | Overlays |
|---|---|
| `initialData` | All (via overlaySocket composable) |
| `hp_updated` | OverlayHP |
| `character_updated` | OverlayHP, OverlayConditions |
| `condition_added` / `condition_removed` | OverlayHP, OverlayConditions |
| `dice_rolled` | OverlayDice, OverlayStats |
| `encounter_started` / `turn_advanced` / `encounter_ended` | OverlayTurnOrder |
| `scene_changed` | OverlaySceneTitle |
| `character_focused` / `character_unfocused` | OverlayCharacterFocus |
| `announce` | OverlayAnnounce |
| `player_down` | OverlayPlayerDown, OverlayStats |
| `level_up` | OverlayLevelUp |
| `lower_third` | OverlayLowerThird |
| `sync_start` | OverlayRecordingBadge |
| `break_start` / `break_end` | OverlayBreak |
| `toggle_stats` | OverlayStats |

---

## Design Constraints

- Full-screen at 1920×1080, transparent background — composited over video in OBS
- No UI chrome — nothing that looks interactive
- Animations must be smooth and not disruptive — overlays support the show, not compete with it
- Socket.io reconnect must be silent — no visible error state on screen
- Performance matters — OBS Browser Source has limited resources
