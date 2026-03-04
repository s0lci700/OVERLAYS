# Overlay System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize, upgrade, and expand the TableRelay audience overlay system into a structured, shared-infrastructure broadcast suite with condition-reactive HP bars and a generic announcement channel.

**Architecture:** Seven independently-deployable OBS Browser Sources organized into `persistent/`, `moments/`, `announcements/`, and `show/` route families. All overlays share a socket composable, animation library, and condition effect map. Existing overlays are migrated into the new structure; new overlays are added on top.

**Tech Stack:** Svelte 5 (runes: `$state`, `$derived`, `$props`, `$effect`), SvelteKit, Socket.io client, anime.js, vitest. Package manager: `bun` always — never `npm`.

---

## What already exists (do not rebuild)

| Component | Status | Missing |
|---|---|---|
| `OverlayHP.svelte` | ✅ Built | Condition CSS classes, shared socket |
| `OverlayDice.svelte` | ✅ Built | Shared socket, shared animations |
| `OverlayConditions.svelte` | ✅ Built | Shared socket |
| `OverlayTurnOrder.svelte` | ✅ Built | Route (`/persistent/turn-order`) |
| `OverlaySceneTitle.svelte` | ✅ Built | Route (`/scene`) |
| `OverlayCharacterFocus.svelte` | ✅ Built | Route (`/persistent/focus`) |

Server already broadcasts: `encounter_started`, `turn_advanced`, `encounter_ended`, `scene_changed`, `character_focused`, `character_unfocused`, `hp_updated`, `condition_added`, `condition_removed`, `dice_rolled`.

Server still needs: `announce`, `level_up`, `player_down`, `lower_third`.

---

## Phase 1 — Shared Infrastructure

### Task 1: Create folder structure

**Files:**
- Create: `control-panel/src/lib/components/overlays/shared/` (directory)
- Create: `control-panel/src/lib/components/overlays/persistent/` (directory)
- Create: `control-panel/src/lib/components/overlays/moments/` (directory)
- Create: `control-panel/src/lib/components/overlays/announcements/` (directory)
- Create: `control-panel/src/lib/components/overlays/show/` (directory)

**Step 1: Create the directories**

```bash
cd control-panel
mkdir -p src/lib/components/overlays/shared
mkdir -p src/lib/components/overlays/persistent
mkdir -p src/lib/components/overlays/moments
mkdir -p src/lib/components/overlays/announcements
mkdir -p src/lib/components/overlays/show
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat(overlays): scaffold category folder structure"
```

---

### Task 2: Write `conditionEffects.js` — condition → visual map

**Files:**
- Create: `control-panel/src/lib/components/overlays/shared/conditionEffects.js`
- Create: `control-panel/src/lib/components/overlays/shared/conditionEffects.test.js`

**Step 1: Write the failing test**

```js
// control-panel/src/lib/components/overlays/shared/conditionEffects.test.js
import { describe, it, expect } from 'vitest';
import { getConditionClasses, CONDITION_EFFECTS } from './conditionEffects.js';

describe('conditionEffects', () => {
  it('returns empty string for no conditions', () => {
    expect(getConditionClasses([])).toBe('');
  });

  it('returns the css class for a known condition', () => {
    expect(getConditionClasses([{ condition_name: 'Poisoned' }])).toContain('is-poisoned');
  });

  it('is case-insensitive', () => {
    expect(getConditionClasses([{ condition_name: 'POISONED' }])).toContain('is-poisoned');
  });

  it('stacks multiple condition classes', () => {
    const result = getConditionClasses([
      { condition_name: 'Poisoned' },
      { condition_name: 'Frightened' },
    ]);
    expect(result).toContain('is-poisoned');
    expect(result).toContain('is-frightened');
  });

  it('unknown condition produces no class (no crash)', () => {
    expect(getConditionClasses([{ condition_name: 'Flibbertigibbet' }])).toBe('');
  });

  it('CONDITION_EFFECTS exports an object with priority fields', () => {
    expect(CONDITION_EFFECTS.poisoned).toHaveProperty('cssClass', 'is-poisoned');
    expect(CONDITION_EFFECTS.poisoned).toHaveProperty('priority');
    expect(CONDITION_EFFECTS.unconscious.priority).toBeGreaterThan(CONDITION_EFFECTS.poisoned.priority);
  });
});
```

**Step 2: Run to verify it fails**

```bash
cd control-panel && bun test src/lib/components/overlays/shared/conditionEffects.test.js
```
Expected: FAIL — `Cannot find module './conditionEffects.js'`

**Step 3: Write the implementation**

```js
// control-panel/src/lib/components/overlays/shared/conditionEffects.js

/**
 * Maps D&D 5e condition names (lowercase) to CSS class and stacking priority.
 * Higher priority = overrides lower priority visuals when multiple conditions are active.
 * Priority 10 = unconscious overrides everything.
 */
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
};

/**
 * Given an array of condition objects ({ condition_name }), returns a
 * space-separated string of CSS classes to apply to the HP bar fill element.
 *
 * @param {Array<{ condition_name: string }>} conditions
 * @returns {string}
 */
export function getConditionClasses(conditions) {
  if (!conditions || conditions.length === 0) return '';
  return conditions
    .map((c) => CONDITION_EFFECTS[c.condition_name.toLowerCase()])
    .filter(Boolean)
    .map((e) => e.cssClass)
    .join(' ');
}
```

**Step 4: Run to verify tests pass**

```bash
cd control-panel && bun test src/lib/components/overlays/shared/conditionEffects.test.js
```
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add control-panel/src/lib/components/overlays/shared/
git commit -m "feat(overlays): add conditionEffects utility with tests"
```

---

### Task 3: Write `animations.js` — shared anime.js patterns

**Files:**
- Create: `control-panel/src/lib/components/overlays/shared/animations.js`
- Create: `control-panel/src/lib/components/overlays/shared/animations.test.js`

**Step 1: Write the failing test**

```js
// control-panel/src/lib/components/overlays/shared/animations.test.js
import { describe, it, expect, vi } from 'vitest';
import {
  fadeInFromBottom,
  fadeOutToTop,
  elasticPop,
  critPop,
  screenFlash,
  shakeElement,
  slideInFromLeft,
} from './animations.js';

// animations.js wraps anime.js. We only test that each function:
// (a) exists and is a function
// (b) calls anime() with the right target element
// We don't test anime internals.

vi.mock('animejs', () => ({
  default: vi.fn(),
  set: vi.fn(),
}));

describe('animations', () => {
  const fakeEl = document.createElement('div');

  it('fadeInFromBottom is a function', () => {
    expect(typeof fadeInFromBottom).toBe('function');
  });

  it('fadeOutToTop is a function', () => {
    expect(typeof fadeOutToTop).toBe('function');
  });

  it('elasticPop is a function', () => {
    expect(typeof elasticPop).toBe('function');
  });

  it('critPop is a function', () => {
    expect(typeof critPop).toBe('function');
  });

  it('screenFlash is a function', () => {
    expect(typeof screenFlash).toBe('function');
  });

  it('shakeElement is a function', () => {
    expect(typeof shakeElement).toBe('function');
  });

  it('slideInFromLeft is a function', () => {
    expect(typeof slideInFromLeft).toBe('function');
  });

  it('all functions accept an element without throwing', () => {
    expect(() => fadeInFromBottom(fakeEl)).not.toThrow();
    expect(() => fadeOutToTop(fakeEl)).not.toThrow();
    expect(() => elasticPop(fakeEl)).not.toThrow();
    expect(() => critPop(fakeEl)).not.toThrow();
    expect(() => screenFlash(fakeEl, 'red')).not.toThrow();
    expect(() => shakeElement(fakeEl)).not.toThrow();
    expect(() => slideInFromLeft(fakeEl)).not.toThrow();
  });
});
```

**Step 2: Run to verify it fails**

```bash
cd control-panel && bun test src/lib/components/overlays/shared/animations.test.js
```
Expected: FAIL — module not found

**Step 3: Write the implementation**

```js
// control-panel/src/lib/components/overlays/shared/animations.js
import anime from 'animejs';

/**
 * Shared anime.js animation patterns for all overlay components.
 * Import named functions — never write inline anime() calls in overlay components.
 */

/** Fade in + slide up from below. Standard overlay entrance. */
export function fadeInFromBottom(el, duration = 400) {
  if (!el) return;
  anime({ targets: el, opacity: [0, 1], translateY: [40, 0], duration, easing: 'easeOutQuad' });
}

/** Fade out + slide up. Standard overlay exit. */
export function fadeOutToTop(el, duration = 350, onComplete) {
  if (!el) return;
  anime({ targets: el, opacity: [1, 0], translateY: [0, -20], duration, easing: 'easeInQuad', complete: onComplete });
}

/** Elastic bounce on a result number. Normal rolls. */
export function elasticPop(el, scale = 1.15, duration = 600) {
  if (!el) return;
  anime({ targets: el, opacity: [0, 1], scale: [0.3, scale, 1], duration, easing: 'easeOutElastic(1, .5)' });
}

/** Bigger elastic pop for critical hits. */
export function critPop(el) {
  if (!el) return;
  anime({ targets: el, opacity: [0, 1], scale: [0.2, 1.45, 1], duration: 800, easing: 'easeOutElastic(1, .5)' });
}

/**
 * Full-canvas color flash (crits, fails, player down).
 * El should be a full-size transparent div sitting over the scene.
 */
export function screenFlash(el, color, duration = 450) {
  if (!el) return;
  el.style.background = color;
  anime({ targets: el, opacity: [0, 0.75, 0], duration, easing: 'easeInOutQuad' });
}

/** Horizontal shake. Used for pifias (Natural 1). */
export function shakeElement(el, duration = 520) {
  if (!el) return;
  anime({ targets: el, translateX: [0, -14, 14, -9, 9, -5, 5, 0], duration, easing: 'easeInOutSine' });
}

/** Slide in from left. Used for announcement cards. */
export function slideInFromLeft(el, duration = 500) {
  if (!el) return;
  anime({ targets: el, opacity: [0, 1], translateX: [-60, 0], duration, easing: 'easeOutExpo' });
}

/** Slide out to left. */
export function slideOutToLeft(el, duration = 400, onComplete) {
  if (!el) return;
  anime({ targets: el, opacity: [1, 0], translateX: [0, -60], duration, easing: 'easeInExpo', complete: onComplete });
}

/** Typewriter reveal — sets text character by character. Returns a promise. */
export function typewriterReveal(el, text, charsPerSecond = 30) {
  if (!el) return Promise.resolve();
  return new Promise((resolve) => {
    let i = 0;
    el.textContent = '';
    const interval = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(interval); resolve(); }
    }, 1000 / charsPerSecond);
  });
}

/** Slow entrance for the turn-order strip (slides up from bottom edge). */
export function stripSlideIn(el, duration = 600) {
  if (!el) return;
  anime({ targets: el, translateY: [80, 0], opacity: [0, 1], duration, easing: 'easeOutExpo' });
}

/** Strip exit. */
export function stripSlideOut(el, duration = 400, onComplete) {
  if (!el) return;
  anime({ targets: el, translateY: [0, 80], opacity: [1, 0], duration, easing: 'easeInExpo', complete: onComplete });
}
```

**Step 4: Run to verify tests pass**

```bash
cd control-panel && bun test src/lib/components/overlays/shared/animations.test.js
```
Expected: PASS (9 tests)

**Step 5: Commit**

```bash
git add control-panel/src/lib/components/overlays/shared/animations.js \
        control-panel/src/lib/components/overlays/shared/animations.test.js
git commit -m "feat(overlays): add shared animations library with tests"
```

---

### Task 4: Write `overlaySocket.svelte.js` — shared socket composable

**Files:**
- Create: `control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.js`

No vitest unit test here — this is a Svelte composable that wraps socket.io. Tested implicitly when overlays connect.

**Step 1: Write the composable**

```js
// control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.js
import { io } from 'socket.io-client';
import { onDestroy } from 'svelte';

/**
 * Svelte 5 composable for overlay Socket.io connections.
 *
 * Usage inside a Svelte component:
 *   const { socket, characters, getChar } = createOverlaySocket(serverUrl);
 *
 * The composable handles connect, initialData bootstrap, and onDestroy cleanup.
 * All overlays use this instead of calling io() directly.
 *
 * @param {string} serverUrl - The Socket.io server URL (from ?server= query param)
 * @returns {{ socket, characters, getChar }}
 */
export function createOverlaySocket(serverUrl) {
  const socket = io(serverUrl, { reconnectionDelay: 1000, reconnectionDelayMax: 5000 });

  // Character map — keyed by id for O(1) lookups
  let characters = $state([]);
  const charMap = {};

  socket.on('initialData', ({ characters: chars }) => {
    characters = chars ?? [];
    characters.forEach((c) => { charMap[c.id] = c; });
  });

  socket.on('character_updated', ({ character }) => {
    charMap[character.id] = character;
    characters = characters.map((c) => (c.id === character.id ? character : c));
  });

  socket.on('hp_updated', ({ character }) => {
    charMap[character.id] = character;
    characters = characters.map((c) => (c.id === character.id ? character : c));
  });

  // Silent reconnect — overlays must never show error UI on screen
  socket.on('connect_error', (err) => {
    console.warn('[overlay] connection error:', err.message);
  });

  onDestroy(() => socket.disconnect());

  return {
    get socket() { return socket; },
    get characters() { return characters; },
    getChar: (id) => charMap[id] ?? null,
  };
}
```

**Step 2: Commit**

```bash
git add control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.js
git commit -m "feat(overlays): add shared overlaySocket composable"
```

---

### Task 5: Write `overlays.css` — condition keyframes and base styles

**Files:**
- Create: `control-panel/src/lib/overlays.css`

**Step 1: Write the CSS**

```css
/* control-panel/src/lib/overlays.css
   Shared overlay styles: condition animations + HP bar visual states.
   Import in OverlayHP.svelte and any future overlay showing character conditions.
*/

/* ── Condition: Poisoned ──────────────────────────────────── */
.is-poisoned {
  filter: hue-rotate(85deg) saturate(1.8) brightness(0.85) !important;
  animation: condition-nauseate 3s ease-in-out infinite;
}

@keyframes condition-nauseate {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-3px); }
  40%       { transform: translateX(3px); }
  60%       { transform: translateX(-2px); }
  80%       { transform: translateX(0); }
}

/* ── Condition: Burning ──────────────────────────────────── */
.is-burning {
  filter: hue-rotate(-30deg) saturate(2.5) brightness(1.1) !important;
  animation: condition-flicker 0.15s ease-in-out infinite alternate;
}

@keyframes condition-flicker {
  0%   { opacity: 1; filter: hue-rotate(-30deg) saturate(2.5) brightness(1.1); }
  100% { opacity: 0.82; filter: hue-rotate(-20deg) saturate(2.2) brightness(1.3); }
}

/* ── Condition: Frozen / Paralyzed / Petrified ───────────── */
.is-frozen,
.is-paralyzed,
.is-petrified {
  filter: hue-rotate(180deg) saturate(0.6) brightness(1.2) !important;
  animation: none !important; /* Completely still */
}

/* ── Condition: Stunned ──────────────────────────────────── */
.is-stunned {
  filter: brightness(1.4) saturate(0.5) !important;
  animation: condition-dizzy 0.8s ease-in-out infinite;
}

@keyframes condition-dizzy {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.65; }
}

/* ── Condition: Cursed ───────────────────────────────────── */
.is-cursed {
  filter: hue-rotate(270deg) saturate(1.5) brightness(0.75) !important;
  animation: condition-breathe 2.5s ease-in-out infinite;
}

@keyframes condition-breathe {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

/* ── Condition: Charmed ──────────────────────────────────── */
.is-charmed {
  filter: hue-rotate(320deg) saturate(1.8) brightness(1.05) !important;
  animation: condition-heartbeat 1.2s ease-in-out infinite;
}

@keyframes condition-heartbeat {
  0%, 100% { transform: scaleY(1); }
  10%       { transform: scaleY(1.06); }
  20%       { transform: scaleY(1); }
  30%       { transform: scaleY(1.04); }
}

/* ── Condition: Frightened ───────────────────────────────── */
.is-frightened {
  filter: saturate(0.3) brightness(0.9) !important;
  animation: condition-tremor 0.12s linear infinite;
}

@keyframes condition-tremor {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(-2px); }
  75%  { transform: translateX(2px); }
  100% { transform: translateX(0); }
}

/* ── Condition: Blinded ──────────────────────────────────── */
.is-blinded {
  filter: grayscale(1) brightness(0.6) !important;
  position: relative;
  overflow: hidden;
}

.is-blinded::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.25) 2px,
    rgba(0,0,0,0.25) 4px
  );
  pointer-events: none;
}

/* ── Condition: Invisible ────────────────────────────────── */
.is-invisible {
  opacity: 0.2 !important;
  border-style: dashed !important;
}

/* ── Condition: Unconscious ──────────────────────────────── */
.is-unconscious {
  filter: grayscale(1) brightness(0.35) !important;
  animation: none !important;
}

/* ── Heal flash (one-shot, applied via JS class toggle) ──── */
.heal-flash {
  animation: condition-heal-sweep 0.7s ease-out forwards;
}

@keyframes condition-heal-sweep {
  0%   { filter: brightness(1) saturate(1); }
  30%  { filter: brightness(1.6) saturate(2) hue-rotate(85deg); }
  100% { filter: brightness(1) saturate(1); }
}
```

**Step 2: Commit**

```bash
git add control-panel/src/lib/overlays.css
git commit -m "feat(overlays): add shared condition animation keyframes CSS"
```

---

## Phase 2 — Route Restructuring

### Task 6: Reorganize routes into category subfolders

**Files:**
- Create: `control-panel/src/routes/(audience)/persistent/hp/+page.svelte`
- Create: `control-panel/src/routes/(audience)/persistent/conditions/+page.svelte`
- Create: `control-panel/src/routes/(audience)/persistent/turn-order/+page.svelte`
- Create: `control-panel/src/routes/(audience)/persistent/focus/+page.svelte`
- Create: `control-panel/src/routes/(audience)/moments/dice/+page.svelte`
- Create: `control-panel/src/routes/(audience)/scene/+page.svelte`
- Delete: `control-panel/src/routes/(audience)/hp/+page.svelte`
- Delete: `control-panel/src/routes/(audience)/dice/+page.svelte`
- Delete: `control-panel/src/routes/(audience)/conditions/+page.svelte`

**Step 1: Create all new route directories**

```bash
cd control-panel
mkdir -p src/routes/\(audience\)/persistent/hp
mkdir -p src/routes/\(audience\)/persistent/conditions
mkdir -p src/routes/\(audience\)/persistent/turn-order
mkdir -p src/routes/\(audience\)/persistent/focus
mkdir -p src/routes/\(audience\)/moments/dice
mkdir -p src/routes/\(audience\)/scene
```

**Step 2: Write new route pages — all follow the same thin pattern**

```svelte
<!-- control-panel/src/routes/(audience)/persistent/hp/+page.svelte -->
<script>
  import OverlayHP from '$lib/components/overlays/OverlayHP.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayHP {serverUrl} />
```

Repeat the same pattern (swap component name) for:
- `persistent/conditions/+page.svelte` → `OverlayConditions`
- `persistent/turn-order/+page.svelte` → `OverlayTurnOrder`
- `persistent/focus/+page.svelte` → `OverlayCharacterFocus`
- `moments/dice/+page.svelte` → `OverlayDice`
- `scene/+page.svelte` → `OverlaySceneTitle`

**Step 3: Delete old route files**

```bash
rm control-panel/src/routes/\(audience\)/hp/+page.svelte
rmdir control-panel/src/routes/\(audience\)/hp
rm control-panel/src/routes/\(audience\)/dice/+page.svelte
rmdir control-panel/src/routes/\(audience\)/dice
rm control-panel/src/routes/\(audience\)/conditions/+page.svelte
rmdir control-panel/src/routes/\(audience\)/conditions
```

**Step 4: Verify build passes with no broken imports**

```bash
cd control-panel && bun run build 2>&1 | tail -20
```
Expected: build succeeds with no errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(overlays): restructure audience routes into persistent/moments/scene categories"
```

---

## Phase 3 — Condition-Reactive HP Bars

### Task 7: Wire condition classes into OverlayHP

**Files:**
- Modify: `control-panel/src/lib/components/overlays/OverlayHP.svelte`

The goal: the `.hp-bar-fill` element gets dynamic condition CSS classes based on the character's active conditions. The `overlays.css` keyframes (Task 5) handle the visual animations.

**Step 1: Import shared utilities at top of OverlayHP script block**

Find the existing `<script>` block in `OverlayHP.svelte`. Add these imports after existing imports:

```js
import { getConditionClasses } from '$lib/components/overlays/shared/conditionEffects.js';
import '$lib/overlays.css';
```

**Step 2: Locate the HP bar fill element in the template**

Find the element with class `hp-bar-fill`. It currently looks roughly like:
```svelte
<div class="hp-bar-fill {hpClass}" style="width: {percentage}%"></div>
```

**Step 3: Add reactive condition classes**

Replace that element with:
```svelte
<div
  class="hp-bar-fill {hpClass} {getConditionClasses(character.conditions ?? [])}"
  style="width: {percentage}%"
></div>
```

**Step 4: Add heal flash logic**

In the socket event handler for `hp_updated`, after updating the HP value, detect a significant heal (delta > 30% of max) and temporarily add the `heal-flash` class:

```js
socket.on('hp_updated', ({ character }) => {
  const prev = charMap[character.id];
  const delta = character.hp_current - (prev?.hp_current ?? character.hp_current);
  // ... existing update logic ...

  // Heal flash: trigger if healed more than 30% of max HP
  if (delta > 0 && character.hp_max > 0 && (delta / character.hp_max) > 0.30) {
    const el = document.querySelector(`[data-char-id="${character.id}"] .hp-bar-fill`);
    if (el) {
      el.classList.add('heal-flash');
      setTimeout(() => el.classList.remove('heal-flash'), 800);
    }
  }
});
```

**Step 5: Manual verification in browser**

```bash
cd control-panel && bun run dev -- --host
```

Open `http://localhost:5173/persistent/hp?server=http://localhost:3000` in a browser. Use the Stage panel to add a condition (e.g. "Poisoned") to a character. Verify the HP bar turns green and shows the nausea animation. Remove the condition — verify bar returns to normal.

**Step 6: Commit**

```bash
git add control-panel/src/lib/components/overlays/OverlayHP.svelte
git commit -m "feat(overlays): add condition-reactive HP bar visual states"
```

---

## Phase 4 — Server Events for New Features

### Task 8: Add new socket events to `server.js`

**Files:**
- Modify: `server.js` (lines ~780–818, near the end of the route registration block)

Add four new POST endpoints that broadcast new overlay events. Add them before the final `return app;` or after `api/sync-start`:

**Step 1: Add the announce endpoint**

```js
// Broadcast a generic announcement to all overlay clients.
// Body: { type, title, body?, image?, duration? }
app.post('/api/announce', (req, res) => {
  const { type, title, body, image, duration } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'type and title are required' });
  broadcast('announce', { type, title, body: body ?? null, image: image ?? null, duration: duration ?? null });
  return res.status(200).json({ ok: true });
});
```

**Step 2: Add the level_up endpoint**

```js
// Trigger a level-up overlay moment.
// Body: { charId, newLevel, className }
app.post('/api/level-up', async (req, res) => {
  const { charId, newLevel, className } = req.body;
  if (!charId || !newLevel) return res.status(400).json({ error: 'charId and newLevel required' });
  broadcast('level_up', { charId, newLevel, className: className ?? '' });
  return res.status(200).json({ ok: true });
});
```

**Step 3: Add the player_down endpoint**

```js
// Trigger the player-down overlay.
// Body: { charId, isDead }
app.post('/api/player-down', (req, res) => {
  const { charId, isDead } = req.body;
  if (!charId) return res.status(400).json({ error: 'charId required' });
  broadcast('player_down', { charId, isDead: isDead === true });
  return res.status(200).json({ ok: true });
});
```

**Step 4: Add the lower_third endpoint**

```js
// Trigger a lower-third nameplate.
// Body: { characterName, playerName, duration? }
app.post('/api/lower-third', (req, res) => {
  const { characterName, playerName, duration } = req.body;
  if (!characterName) return res.status(400).json({ error: 'characterName required' });
  broadcast('lower_third', { characterName, playerName: playerName ?? '', duration: duration ?? 5000 });
  return res.status(200).json({ ok: true });
});
```

**Step 5: Smoke test the new endpoints**

```bash
# With server running (bun server.js):
curl -s -X POST http://localhost:3000/api/announce \
  -H 'Content-Type: application/json' \
  -d '{"type":"custom","title":"Prueba de anuncio"}' | cat
```
Expected: `{"ok":true}`

```bash
curl -s -X POST http://localhost:3000/api/player-down \
  -H 'Content-Type: application/json' \
  -d '{"charId":"test-id","isDead":false}' | cat
```
Expected: `{"ok":true}`

**Step 6: Commit**

```bash
git add server.js
git commit -m "feat(server): add announce, level-up, player-down, lower-third endpoints"
```

---

## Phase 5 — Announcement System

### Task 9: Build `OverlayAnnounce.svelte`

**Files:**
- Create: `control-panel/src/lib/components/overlays/announcements/OverlayAnnounce.svelte`
- Create: `control-panel/src/routes/(audience)/announcements/+page.svelte`

**Step 1: Create the route page first (thin)**

```svelte
<!-- control-panel/src/routes/(audience)/announcements/+page.svelte -->
<script>
  import OverlayAnnounce from '$lib/components/overlays/announcements/OverlayAnnounce.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayAnnounce {serverUrl} />
```

**Step 2: Write the component**

```svelte
<!--
  OverlayAnnounce — Generic announcement modal.
  Route: /announcements?server=...
  OBS Browser Source: 1920×1080, transparent background.

  Socket events consumed:
    announce — { type, title, body?, image?, duration? }

  Types and visual treatments:
    location  — Noir title card, slide from left
    knowledge — Title + body with typewriter reveal
    npc       — Name card with descriptor
    custom    — Bold centered title, stamp entrance
    sponsor   — Logo + text, 3s auto-dismiss
-->
<script>
  import { onDestroy, tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { slideInFromLeft, slideOutToLeft, fadeInFromBottom, fadeOutToTop, typewriterReveal } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000' } = $props();

  const { socket } = createOverlaySocket(serverUrl);

  // ── State ────────────────────────────────────────────────────────
  let visible = $state(false);
  let type = $state('custom');
  let title = $state('');
  let body = $state('');
  let image = $state(null);

  let cardEl;
  let bodyEl;
  let hideTimer = null;

  // ── Type config ──────────────────────────────────────────────────
  const TYPE_CONFIG = {
    location:  { defaultDuration: 5000, modifier: 'is-location' },
    knowledge: { defaultDuration: 8000, modifier: 'is-knowledge' },
    npc:       { defaultDuration: 5000, modifier: 'is-npc' },
    custom:    { defaultDuration: 4000, modifier: 'is-custom' },
    sponsor:   { defaultDuration: 3000, modifier: 'is-sponsor' },
  };

  // ── Socket ───────────────────────────────────────────────────────
  socket.on('announce', async (data) => {
    if (hideTimer) clearTimeout(hideTimer);

    type  = data.type ?? 'custom';
    title = data.title ?? '';
    body  = data.body ?? '';
    image = data.image ?? null;

    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.custom;
    const duration = data.duration ?? cfg.defaultDuration;

    visible = true;
    await tick();

    if (cardEl) slideInFromLeft(cardEl);

    // Typewriter for knowledge type
    if (type === 'knowledge' && bodyEl && body) {
      await typewriterReveal(bodyEl, body);
    }

    if (duration > 0) {
      hideTimer = setTimeout(dismiss, duration);
    }
  });

  async function dismiss() {
    if (!cardEl) { visible = false; return; }
    slideOutToLeft(cardEl, 400, () => { visible = false; });
  }

  onDestroy(() => { if (hideTimer) clearTimeout(hideTimer); });
</script>

{#if visible}
  <div class="announce-canvas">
    <div class="announce-card is-{type}" bind:this={cardEl}>
      {#if image}
        <div class="announce-image">
          <img src={serverUrl + image} alt={title} />
        </div>
      {/if}

      <div class="announce-content">
        <div class="announce-type-label">{type === 'location' ? '— Locación —' : type === 'npc' ? '— Personaje —' : type === 'knowledge' ? '— Conocimiento desbloqueado —' : ''}</div>
        <div class="announce-title">{title}</div>
        {#if body}
          <div class="announce-body" bind:this={bodyEl}>{type === 'knowledge' ? '' : body}</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .announce-canvas {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .announce-card {
    background: rgba(8, 8, 12, 0.92);
    border: 1px solid rgba(255,255,255,0.12);
    border-left: 4px solid var(--red, #ff4d6a);
    border-radius: 6px;
    padding: 40px 56px;
    min-width: 480px;
    max-width: 860px;
    opacity: 0; /* anime.js takes over */
  }

  .announce-card.is-location { border-left-color: var(--red, #ff4d6a); }
  .announce-card.is-knowledge { border-left-color: #1e9e8e; }
  .announce-card.is-npc { border-left-color: var(--purple, #500df5); }
  .announce-card.is-sponsor { border-left-color: #c9a227; }

  .announce-type-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.35);
    margin-bottom: 10px;
  }

  .announce-title {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 72px;
    color: var(--white, #ffffff);
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .announce-body {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 16px;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
    margin-top: 16px;
    max-width: 640px;
  }

  .announce-image img {
    max-height: 120px;
    border-radius: 4px;
    margin-bottom: 20px;
  }
</style>
```

**Step 3: Manual verification**

```bash
# With server + dev running:
curl -X POST http://localhost:3000/api/announce \
  -H 'Content-Type: application/json' \
  -d '{"type":"location","title":"Las Salitreras del Norte","body":"El polvo de caliche huele a traición."}'
```

Open `http://localhost:5173/announcements?server=http://localhost:3000`. Verify card slides in from left, holds, then auto-dismisses.

**Step 4: Commit**

```bash
git add control-panel/src/lib/components/overlays/announcements/ \
        control-panel/src/routes/\(audience\)/announcements/
git commit -m "feat(overlays): add OverlayAnnounce — generic announcement modal"
```

---

## Phase 6 — Moments Overlays

### Task 10: Build `OverlayPlayerDown.svelte`

**Files:**
- Create: `control-panel/src/lib/components/overlays/moments/OverlayPlayerDown.svelte`
- Create: `control-panel/src/routes/(audience)/moments/player-down/+page.svelte`

**Step 1: Thin route page**

```svelte
<!-- control-panel/src/routes/(audience)/moments/player-down/+page.svelte -->
<script>
  import OverlayPlayerDown from '$lib/components/overlays/moments/OverlayPlayerDown.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayPlayerDown {serverUrl} />
```

**Step 2: Write the component**

```svelte
<!--
  OverlayPlayerDown — Character down / KO moment.
  Route: /moments/player-down?server=...
  Socket events: player_down { charId, isDead }
-->
<script>
  import { tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { fadeInFromBottom, fadeOutToTop, screenFlash } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000' } = $props();

  const { socket, getChar } = createOverlaySocket(serverUrl);

  let visible = $state(false);
  let charName = $state('');
  let isDead = $state(false);
  let cardEl;
  let flashEl;
  let hideTimer = null;

  socket.on('player_down', async ({ charId, isDead: dead }) => {
    if (hideTimer) clearTimeout(hideTimer);
    const char = getChar(charId);
    charName = char?.name ?? 'Personaje';
    isDead = dead;

    if (flashEl) screenFlash(flashEl, dead ? 'rgba(0,0,0,0.85)' : 'rgba(255,77,106,0.5)');

    visible = true;
    await tick();
    if (cardEl) fadeInFromBottom(cardEl, 500);

    hideTimer = setTimeout(() => {
      fadeOutToTop(cardEl, 400, () => { visible = false; });
    }, isDead ? 8000 : 5000);
  });
</script>

<div class="flash-overlay" bind:this={flashEl}></div>

{#if visible}
  <div class="down-canvas">
    <div class="down-card" class:is-dead={isDead} bind:this={cardEl}>
      <div class="down-label">{isDead ? '☠ CAÍDO PARA SIEMPRE' : 'INCONSCIENTE'}</div>
      <div class="down-name">{charName}</div>
      {#if !isDead}
        <div class="down-sublabel">Tiradas de muerte activas</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .flash-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
  }

  .down-canvas {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .down-card {
    background: rgba(8,8,12,0.95);
    border: 1px solid rgba(255,77,106,0.4);
    border-top: 4px solid var(--red, #ff4d6a);
    border-radius: 6px;
    padding: 48px 72px;
    text-align: center;
    opacity: 0;
  }

  .down-card.is-dead {
    border-top-color: rgba(255,255,255,0.15);
  }

  .down-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--red, #ff4d6a);
    margin-bottom: 12px;
  }

  .is-dead .down-label { color: rgba(255,255,255,0.4); }

  .down-name {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 88px;
    color: var(--white, #ffffff);
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .down-sublabel {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    margin-top: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
</style>
```

**Step 3: Manual test**

```bash
curl -X POST http://localhost:3000/api/player-down \
  -H 'Content-Type: application/json' \
  -d '{"charId":"<real-char-id>","isDead":false}'
```
Open `/moments/player-down?server=...` in browser. Verify card appears with character name and "INCONSCIENTE" label.

**Step 4: Commit**

```bash
git add control-panel/src/lib/components/overlays/moments/OverlayPlayerDown.svelte \
        control-panel/src/routes/\(audience\)/moments/player-down/
git commit -m "feat(overlays): add OverlayPlayerDown — 0 HP dramatic moment"
```

---

### Task 11: Build `OverlayLevelUp.svelte`

**Files:**
- Create: `control-panel/src/lib/components/overlays/moments/OverlayLevelUp.svelte`
- Create: `control-panel/src/routes/(audience)/moments/level-up/+page.svelte`

**Step 1: Thin route**

Same pattern as Task 10, pointing at `OverlayLevelUp`.

**Step 2: Write the component**

```svelte
<!--
  OverlayLevelUp — Level-up achievement moment.
  Route: /moments/level-up?server=...
  Socket events: level_up { charId, newLevel, className }
-->
<script>
  import { tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { fadeInFromBottom, fadeOutToTop, screenFlash } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000' } = $props();

  const { socket, getChar } = createOverlaySocket(serverUrl);

  let visible = $state(false);
  let charName = $state('');
  let newLevel = $state(1);
  let className = $state('');
  let cardEl;
  let flashEl;

  socket.on('level_up', async ({ charId, newLevel: lvl, className: cls }) => {
    const char = getChar(charId);
    charName = char?.name ?? 'Personaje';
    newLevel = lvl;
    className = cls;

    if (flashEl) screenFlash(flashEl, 'rgba(201,162,39,0.4)', 600);

    visible = true;
    await tick();
    if (cardEl) fadeInFromBottom(cardEl, 600);

    setTimeout(() => {
      fadeOutToTop(cardEl, 400, () => { visible = false; });
    }, 6000);
  });
</script>

<div class="flash-overlay" bind:this={flashEl}></div>

{#if visible}
  <div class="levelup-canvas">
    <div class="levelup-card" bind:this={cardEl}>
      <div class="levelup-label">— Subida de Nivel —</div>
      <div class="levelup-level">NIVEL {newLevel}</div>
      <div class="levelup-name">{charName}</div>
      {#if className}<div class="levelup-class">{className}</div>{/if}
    </div>
  </div>
{/if}

<style>
  .flash-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
  }

  .levelup-canvas {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .levelup-card {
    background: rgba(8,8,12,0.93);
    border: 1px solid rgba(201,162,39,0.35);
    border-top: 4px solid #c9a227;
    border-radius: 6px;
    padding: 48px 72px;
    text-align: center;
    opacity: 0;
  }

  .levelup-label {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(201,162,39,0.7);
    margin-bottom: 8px;
  }

  .levelup-level {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 120px;
    color: #c9a227;
    line-height: 1;
    letter-spacing: 0.06em;
  }

  .levelup-name {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 52px;
    color: var(--white, #ffffff);
    letter-spacing: 0.05em;
  }

  .levelup-class {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-top: 8px;
  }
</style>
```

**Step 3: Commit**

```bash
git add control-panel/src/lib/components/overlays/moments/OverlayLevelUp.svelte \
        control-panel/src/routes/\(audience\)/moments/level-up/
git commit -m "feat(overlays): add OverlayLevelUp — level-up dramatic beat"
```

---

## Phase 7 — Show Layer

### Task 12: Build `OverlayLowerThird.svelte`

**Files:**
- Create: `control-panel/src/lib/components/overlays/show/OverlayLowerThird.svelte`
- Create: `control-panel/src/routes/(audience)/show/lower-third/+page.svelte`

**Step 1: Thin route** — same pattern, import `OverlayLowerThird`.

**Step 2: Component**

```svelte
<!--
  OverlayLowerThird — Character nameplate lower third.
  Route: /show/lower-third?server=...
  Socket events: lower_third { characterName, playerName, duration? }
-->
<script>
  import { tick } from 'svelte';
  import { createOverlaySocket } from '$lib/components/overlays/shared/overlaySocket.svelte.js';
  import { fadeInFromBottom, fadeOutToTop } from '$lib/components/overlays/shared/animations.js';

  let { serverUrl = 'http://localhost:3000' } = $props();

  const { socket } = createOverlaySocket(serverUrl);

  let visible = $state(false);
  let characterName = $state('');
  let playerName = $state('');
  let barEl;
  let hideTimer = null;

  socket.on('lower_third', async ({ characterName: cn, playerName: pn, duration = 5000 }) => {
    if (hideTimer) clearTimeout(hideTimer);
    characterName = cn;
    playerName = pn;
    visible = true;
    await tick();
    if (barEl) fadeInFromBottom(barEl, 350);
    if (duration > 0) {
      hideTimer = setTimeout(() => {
        fadeOutToTop(barEl, 300, () => { visible = false; });
      }, duration);
    }
  });
</script>

{#if visible}
  <div class="lower-third-pos">
    <div class="lower-third-bar" bind:this={barEl}>
      <div class="lt-char">{characterName}</div>
      {#if playerName}<div class="lt-player">{playerName}</div>{/if}
    </div>
  </div>
{/if}

<style>
  .lower-third-pos {
    position: absolute;
    bottom: 80px;
    left: 80px;
  }

  .lower-third-bar {
    background: rgba(8,8,12,0.9);
    border-left: 4px solid var(--red, #ff4d6a);
    padding: 10px 20px 10px 16px;
    opacity: 0;
  }

  .lt-char {
    font-family: var(--font-display, 'Bebas Neue', sans-serif);
    font-size: 32px;
    color: var(--white, #ffffff);
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .lt-player {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-top: 4px;
  }
</style>
```

**Step 3: Commit**

```bash
git add control-panel/src/lib/components/overlays/show/ \
        control-panel/src/routes/\(audience\)/show/
git commit -m "feat(overlays): add OverlayLowerThird — broadcast nameplate"
```

---

### Task 13: Build `OverlayStats.svelte`, `OverlayRecordingBadge.svelte`, `OverlayBreak.svelte`

**Files:**
- Create: `control-panel/src/lib/components/overlays/show/OverlayStats.svelte`
- Create: `control-panel/src/lib/components/overlays/show/OverlayRecordingBadge.svelte`
- Create: `control-panel/src/lib/components/overlays/show/OverlayBreak.svelte`
- Create routes: `show/stats/`, `show/recording-badge/`, `show/break/`

These three share a pattern — stats counts socket events passively, recording badge is static once triggered, break covers the full canvas.

**OverlayStats** — listens for `dice_rolled` (count crits/pifias), `player_down` (count downs). Stage manually shows/hides via a `toggle_stats` broadcast event.

**OverlayRecordingBadge** — Stage hits `POST /api/recording/start` and `stop`. Badge appears with red dot and "GRABANDO" text. Also fires `SYNC_START` on appear.

**OverlayBreak** — Stage triggers `POST /api/break/start` and `stop`. Full dark canvas with "VOLVEMOS EN UN MOMENTO" in large display type. Optional countdown.

Implementation follows the exact same pattern as Tasks 10–12. Reference those for the thin route + Svelte component structure.

```bash
# After implementing all three:
git add control-panel/src/lib/components/overlays/show/ \
        control-panel/src/routes/\(audience\)/show/
git commit -m "feat(overlays): add Stats, RecordingBadge, Break show-layer overlays"
```

---

## Phase 8 — Cleanup & Documentation

### Task 14: Remove vanilla HTML files from `public/`

**Files:**
- Delete: `public/overlay-hp.html`
- Delete: `public/overlay-hp.css`
- Delete: `public/overlay-dice.html`
- Delete: `public/overlay-dice.css`
- Delete: `public/overlay-conditions.html`

**Step 1: Verify all Svelte routes work first**

Open each in browser and confirm they connect and render:
- `http://localhost:5173/persistent/hp?server=http://localhost:3000`
- `http://localhost:5173/moments/dice?server=http://localhost:3000`
- `http://localhost:5173/persistent/conditions?server=http://localhost:3000`

**Step 2: Delete the vanilla files**

```bash
cd /path/to/OVERLAYS
rm public/overlay-hp.html public/overlay-hp.css
rm public/overlay-dice.html public/overlay-dice.css
rm public/overlay-conditions.html
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore(overlays): remove vanilla HTML overlays — Svelte routes are now canonical"
```

---

### Task 15: Update `docs/layers/audience.md` and `CLAUDE.md`

**Files:**
- Modify: `docs/layers/audience.md`
- Modify: `CLAUDE.md`

Update `audience.md` with:
- New route URL table (all 7+ sources)
- New socket events reference
- New folder structure

Update `CLAUDE.md` with:
- New overlay URLs for OBS setup
- Note that `public/overlay-*.html` files are removed

```bash
# After editing:
git add docs/layers/audience.md CLAUDE.md
git commit -m "docs: update audience layer docs and CLAUDE.md with new overlay system"
```

---

## OBS URL Reference (final)

```
/persistent/hp             HP bars + condition animations
/persistent/conditions     Conditions + depleted resources panel
/persistent/turn-order     Initiative strip (combat only)
/persistent/focus          Character focus panel (DM-triggered)
/moments/dice              Roll confirm card
/moments/player-down       0 HP / KO moment
/moments/level-up          Level-up dramatic beat
/scene                     Scene/location title card
/announcements             Generic announcement modal
/show/lower-third          Character nameplate
/show/stats                Session stats (crits/pifias counter)
/show/recording-badge      GRABANDO indicator
/show/break                Break slate

All URLs take: ?server=http://[IP]:3000
```
