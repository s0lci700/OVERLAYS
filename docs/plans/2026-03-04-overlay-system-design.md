# Overlay System Design
> TableRelay — Audience Layer Redesign
> Date: 2026-03-04 | Status: Approved for implementation

---

## Context

The three vanilla HTML overlays (`overlay-hp.html`, `overlay-dice.html`, `overlay-conditions.html`) have already been migrated to Svelte 5 components inside the `(audience)/` route group. This document specifies the **full target architecture** for the overlay system — a complete rethink of structure, scope, shared infrastructure, and visual language.

The design brief: **ESDH brand style + Chilean Noir Fantasy**. Professional but funny. Production-grade but personality-driven.

---

## Design Decisions

### 1. Three separate OBS Browser Sources → Seven

Each overlay family is an independent Browser Source in OBS. This is the broadcast industry standard — resilient, independently toggleable per scene, self-contained.

| Browser Source | URL | Always On |
|---|---|---|
| HP Layer | `/persistent/hp` | Yes — every cast table scene |
| Conditions Panel | `/persistent/conditions` | Auto-shows when active |
| Initiative Strip | `/persistent/initiative` | Combat scenes only |
| Dice / Moments | `/moments/dice` | Event-driven, auto-dismisses |
| Player Down | `/moments/player-down` | Event-driven |
| Announcements | `/announcements` | Operator-triggered |
| Show Layer | `/show/lower-third` (+ others) | Production use |

### 2. Separate Browser Sources, shared infrastructure

All overlays share the same socket composable, animation library, condition effect map, and base CSS. Adding a new overlay means implementing the component — not re-implementing the plumbing.

### 3. Dice system is confirm-not-roll

Physical dice are core to the show (Kuminaw, March 3 decision). The `/moments/dice` overlay fires when Stage *confirms* a physical roll — not from a digital roller. Stage taps: who, what die, what result. The overlay fires, the log is written, the show continues.

### 4. Conditions affect HP bars visually

Conditions are not just badges — they express themselves as visual states on the HP bar. Poisoned bars turn green and twitch. Burning bars flicker orange. Frozen bars go still and icy. This is video game visual language applied to broadcast overlays.

---

## Folder Structure

### Routes (SvelteKit — what OBS points at)

```
control-panel/src/routes/(audience)/
  +layout.svelte                    ← canvas shell, ?server= → context, no app chrome

  persistent/
    hp/+page.svelte                 → /persistent/hp
    conditions/+page.svelte         → /persistent/conditions
    initiative/+page.svelte         → /persistent/initiative

  moments/
    dice/+page.svelte               → /moments/dice
    level-up/+page.svelte           → /moments/level-up
    player-down/+page.svelte        → /moments/player-down

  announcements/
    +page.svelte                    → /announcements

  show/
    lower-third/+page.svelte        → /show/lower-third
    stats/+page.svelte              → /show/stats
    break/+page.svelte              → /show/break
    recording-badge/+page.svelte    → /show/recording-badge
```

Route pages are intentionally thin — import component, pass `serverUrl` from context, nothing else.

### Components (logic lives here)

```
control-panel/src/lib/components/overlays/
  shared/
    overlaySocket.svelte.js         ← socket singleton composable
    animations.js                   ← named anime.js patterns
    conditionEffects.js             ← condition → { cssClass, priority, animation }

  persistent/
    OverlayHP.svelte                ← reactive bars + condition visual states
    OverlayConditions.svelte        ← conditions + depleted resources panel
    OverlayInitiative.svelte        ← turn-order strip

  moments/
    OverlayDice.svelte              ← roll confirm card
    OverlayLevelUp.svelte           ← level-up dramatic beat
    OverlayPlayerDown.svelte        ← 0 HP / unconscious moment

  announcements/
    OverlayAnnounce.svelte          ← generic modal, type-driven visual treatment

  show/
    OverlayLowerThird.svelte        ← nameplate / lower third
    OverlayStats.svelte             ← session stats card
    OverlayBreak.svelte             ← break slate
    OverlayRecordingBadge.svelte    ← recording indicator
```

### Shared CSS

```
control-panel/src/lib/
  overlays.css                      ← condition keyframes, overlay base styles
```

---

## Shared Infrastructure

### `overlaySocket.svelte.js`

A Svelte 5 composable that all overlay components import. Handles:
- `io(serverUrl)` connection
- Reconnect logic (silent — no visible error state on screen)
- `initialData` event → hydrates a shared character map
- `onDestroy` cleanup
- Exposes: `socket`, `characters`, `getChar(id)`

No overlay component does `io()` directly. All socket work goes through this composable.

### `animations.js`

Named exports for every reusable anime.js pattern:

```js
export const fadeInFromBottom = (el, duration = 400) => ...
export const fadeOutToTop = (el, duration = 350) => ...
export const elasticPop = (el, scale = 1.15) => ...
export const critPop = (el) => ...          // bigger elastic, 800ms
export const screenFlash = (el, color) => ...
export const shakeElement = (el) => ...     // pifia shake
export const conditionShake = (el) => ...   // periodic slow shake for poisoned etc.
export const slideInFromLeft = (el) => ...  // announcements
export const stampIn = (el) => ...          // announcement confirm stamp
export const typewriterReveal = (el, text) => ...  // knowledge unlock
```

### `conditionEffects.js`

Maps condition names to visual treatment. Priority determines stacking behavior — higher priority wins when conditions conflict visually.

```js
export const CONDITION_EFFECTS = {
  unconscious:  { cssClass: 'is-unconscious', priority: 10 },
  paralyzed:    { cssClass: 'is-paralyzed',   priority: 9  },
  petrified:    { cssClass: 'is-petrified',   priority: 9  },
  stunned:      { cssClass: 'is-stunned',     priority: 7  },
  poisoned:     { cssClass: 'is-poisoned',    priority: 5  },
  burning:      { cssClass: 'is-burning',     priority: 5  },
  frozen:       { cssClass: 'is-frozen',      priority: 5  },
  frightened:   { cssClass: 'is-frightened',  priority: 4  },
  cursed:       { cssClass: 'is-cursed',      priority: 4  },
  charmed:      { cssClass: 'is-charmed',     priority: 3  },
  blinded:      { cssClass: 'is-blinded',     priority: 3  },
  invisible:    { cssClass: 'is-invisible',   priority: 2  },
  prone:        { cssClass: 'is-prone',       priority: 1  },
}
```

---

## Overlay Specifications

### `OverlayHP.svelte` — Persistent

**Position:** Top-right corner, stacked vertically per character
**Layout:** Avatar → name + class badge + AC → HP bar → condition badges
**Socket events:** `initialData`, `hp_updated`, `condition_added`, `condition_removed`, `character_updated`, `rest_taken`

**Condition-reactive HP bar** — the core new behavior:

Each condition class applies a CSS combination of tint + animation on the `.hp-bar-fill` element. Multiple conditions stack — classes are applied in priority order.

| Condition | Tint | Animation |
|---|---|---|
| `is-poisoned` | Sickly green overlay | Slow lateral nausea shake every 3s |
| `is-burning` | Orange-red shimmer | Fast flicker, heat distortion |
| `is-frozen` / `is-paralyzed` | Icy blue-white | Zero movement — bar freezes |
| `is-stunned` | Yellow-white | Rapid dizzy pulse |
| `is-cursed` | Deep purple | Slow malevolent breathing pulse |
| `is-charmed` | Rose pink | Soft heartbeat, dreamlike |
| `is-frightened` | Desaturated + red edge vignette | Rapid erratic tremor |
| `is-blinded` | Full desaturate | CSS scan lines, static noise |
| `is-invisible` | Near-transparent (0.2 opacity) | Dashed border, ghost shimmer |
| `is-unconscious` | Full black, portrait dims | Bar goes dark, card opacity 0.4 |

**Priority rule:** `is-unconscious` overrides all others. When multiple non-override conditions are active, CSS classes stack — the visual result is additive (green + trembling for poisoned + frightened).

**Healed event (one-shot):** A bright green sweep up the bar on significant HP recovery, then returns to normal. Triggered by `hp_updated` when delta > 30% of max.

---

### `OverlayConditions.svelte` — Persistent

**Position:** Bottom-left
**Behavior:** Auto-shows when any character has active conditions or depleted resources. Auto-hides when clear.
**No changes to logic** — this component already works. Needs aesthetic upgrade to match Chilean Noir Fantasy direction.

---

### `OverlayInitiative.svelte` — Persistent (combat only)

**Position:** Bottom edge, horizontal strip
**Layout:** Character avatars in initiative order, active turn highlighted with a marker
**Driven by:** DM Panel — when DM starts combat and sets initiative order, a `combat_started` event broadcasts the ordered combatant list. `next_turn` event advances the highlight.
**Socket events:** `combat_started`, `next_turn`, `combat_ended`

---

### `OverlayDice.svelte` — Moments

**Position:** Bottom-center
**Behavior:** Stage confirms a physical roll → overlay fires for 4s (6s on crit), then auto-dismisses
**Crit (Natural 20):** Full-screen flash (`screenFlash`, cyan), elastic pop on number, `¡CRÍTICO!` label
**Pifia (Natural 1):** Full-screen flash (red), shake animation, `¡PIFIA!` label
**Change from current:** The source of the event is Stage confirmation, not a digital roller. API shape unchanged — server receives the same payload, overlay behavior identical.

---

### `OverlayLevelUp.svelte` — Moments

**Position:** Center screen
**Behavior:** One-shot, dramatic. Fires when Stage triggers a level-up event. Large level number, character name, class. Auto-dismisses after 6s.
**Visual:** ESDH brand colors, Bebas Neue at maximum size, noir atmosphere — muted background elements.
**Socket event:** `level_up` → `{ charId, newLevel, className }`

---

### `OverlayPlayerDown.svelte` — Moments

**Position:** Center screen, or paired with the character's HP card position
**Behavior:** Fires when a character reaches 0 HP. `CAÍDO` or `INCONSCIENTE` in large noir type. If the character is permanently killed (Stage confirms death), a different treatment: heavier, longer, darker.
**Auto-dismisses** after 5s, or immediately when Stage triggers a stabilization event.
**Socket event:** `player_down` → `{ charId, isDead: boolean }`

---

### `OverlayAnnounce.svelte` — Announcements

**Position:** Center screen (default), configurable by type
**One component. `type` prop drives everything.**

| Type | Visual Treatment | Animation |
|---|---|---|
| `location` | Full noir title card — location name large, optional tagline in italic mono | Slide in from left, hold, fade out |
| `knowledge` | Card with title + body text | Slide in, typewriter on body text |
| `npc` | Name card — name large, descriptor in mono, optional portrait | Slide in from bottom |
| `custom` | Title only, centered, bold | Elastic stamp in |
| `sponsor` | Logo + text, tasteful 3s | Fade in, hold, fade out |

**Socket event:** `announce` → `{ type, title, body?, image?, duration? }`
**Stage UI:** "Announce" button opens a quick compose panel — pick type, fill fields, send. Designed for under 10 seconds of operator interaction during a live session.

**Duration:** Each type has a sensible default (4s for `npc`, 6s for `knowledge`, 3s for `sponsor`). Stage can override with a custom `duration` value. `duration: 0` = manual dismiss.

---

### `OverlayLowerThird.svelte` — Show

**Position:** Bottom-left, above conditions panel
**Layout:** Character name (display font) + player name or role (mono, smaller)
**Example:** `THORDIN / Panqueque`
**Behavior:** Manual trigger from Stage. Auto-dismisses after 5s.
**Socket event:** `lower_third` → `{ characterName, playerName, duration? }`

---

### `OverlayStats.svelte` — Show

**Position:** Bottom-right
**Content:** Session running tallies — Críticos, Pifias, Personajes Caídos
**Behavior:** Stage toggles visibility manually. Not always on — appears at natural pauses.
**Updates live** as events come in from the server.

---

### `OverlayBreak.svelte` — Show

**Position:** Full canvas
**Content:** "VOLVEMOS EN UN MOMENTO" or a countdown timer
**Visual:** Full Chilean Noir atmosphere — darkened, atmospheric, not empty
**Behavior:** Stage triggers start/end. Completely covers the scene.

---

### `OverlayRecordingBadge.svelte` — Show

**Position:** Top-left corner, small
**Content:** Red dot + "GRABANDO" text
**Behavior:** Persistent when active, triggered by Stage at session start. Also used as the `SYNC_START` visual marker for the JSONL log alignment system.

---

## Screen Effects

Screen effects (full-canvas flashes, shakes) are **not separate overlays**. They fire inside the relevant source:

- **Crit flash** → inside `OverlayDice` (cyan flash on Natural 20)
- **Pifia flash** → inside `OverlayDice` (red flash on Natural 1)
- **Condition-land flash** → inside `OverlayHP` when a new condition is applied (brief red edge vignette on the affected character card)
- **Player-down flash** → inside `OverlayPlayerDown` (full dark flash)

The `screenFlash(el, color)` utility in `animations.js` is shared across all of them.

Stage can also trigger a standalone screen flash at any time via a `broadcast_effect` socket event consumed by a dedicated flash div inside the relevant overlay, for moments the system didn't anticipate.

---

## Visual Direction

**Base:** ESDH brand style (bold, high-contrast, punchy)
**Layer:** Chilean Noir Fantasy

The existing dark glass card aesthetic (dark backgrounds, subtle borders, Bebas Neue display, JetBrains Mono for data) is the right foundation. The Chilean Noir Fantasy layer adds:

- **Typography:** Bebas Neue stays for display. JetBrains Mono stays for data. Consider a secondary serif or condensed italic for atmospheric labels (taglines in location reveals, NPC descriptors).
- **Color accents:** Beyond the existing red/cyan/purple, introduce **amber/gold** for level-up and `sponsor` moments, and **deep teal** for knowledge reveals — the color of the ocean off Chiloé.
- **Texture hints:** Subtle noise/grain on announcement cards. Not loud — just enough to feel physical, not digital.
- **Noir language in copy:** Location reveals get evocative one-line taglines. NPC descriptors are written like noir character introductions. The system speaks the show's language.

---

## Socket Event Reference

New events required (beyond existing):

| Event | Direction | Payload |
|---|---|---|
| `announce` | server → overlays | `{ type, title, body?, image?, duration? }` |
| `combat_started` | server → overlays | `{ combatants: [{charId, roll}] }` |
| `next_turn` | server → overlays | `{ activeCharId }` |
| `combat_ended` | server → overlays | `{}` |
| `level_up` | server → overlays | `{ charId, newLevel, className }` |
| `player_down` | server → overlays | `{ charId, isDead: boolean }` |
| `lower_third` | server → overlays | `{ characterName, playerName, duration? }` |
| `broadcast_effect` | server → overlays | `{ type: 'flash', color, duration? }` |

All new events are broadcast to all connected sockets (overlays are read-only — they never emit back).

---

## OBS Setup Reference

```
Per scene containing cast table footage:
  Browser Source: HP Layer
    URL: http://[IP]:3000/persistent/hp?server=http://[IP]:3000
    Width: 1920  Height: 1080  Transparent: ON
    Shutdown when hidden: OFF  Refresh on active: ON

  Browser Source: Dice / Moments
    URL: http://[IP]:3000/moments/dice?server=http://[IP]:3000
    (same settings)

  Browser Source: Conditions
    URL: http://[IP]:3000/persistent/conditions?server=http://[IP]:3000

  Browser Source: Announcements
    URL: http://[IP]:3000/announcements?server=http://[IP]:3000

Combat scenes additionally:
  Browser Source: Initiative Strip
    URL: http://[IP]:3000/persistent/initiative?server=http://[IP]:3000

Production use (add to relevant scenes):
  Browser Source: Lower Third
    URL: http://[IP]:3000/show/lower-third?server=http://[IP]:3000
  Browser Source: Recording Badge
    URL: http://[IP]:3000/show/recording-badge?server=http://[IP]:3000
```

---

## Migration Notes

The three existing Svelte overlay components are functional. The migration path:

1. Move `OverlayHP.svelte`, `OverlayDice.svelte`, `OverlayConditions.svelte` into their new category folders (`persistent/`, `moments/`, `persistent/` respectively)
2. Reorganize `(audience)/` route files to match the new URL structure
3. Extract socket setup from each component into `shared/overlaySocket.svelte.js`
4. Extract anime.js patterns into `shared/animations.js`
5. Add condition CSS classes to `overlays.css` and wire into `OverlayHP.svelte`
6. Build new overlays in order of production priority

The vanilla HTML files in `public/` can be removed once the Svelte routes are confirmed working in OBS.

---

## Implementation Priority

1. **Shared infrastructure** — `overlaySocket.svelte.js`, `animations.js`, `conditionEffects.js`, `overlays.css` with condition keyframes
2. **Migrate + upgrade** existing three overlays into new folder structure
3. **Condition-reactive HP bars** — highest visual impact, most unique feature
4. **`OverlayAnnounce.svelte`** — the announcement system unlocks the most show flexibility
5. **`OverlayInitiative.svelte`** — needed for combat readability
6. **`OverlayPlayerDown.svelte`** and **`OverlayLevelUp.svelte`** — dramatic moments
7. **Show layer** — Lower third, stats, recording badge, break slate
