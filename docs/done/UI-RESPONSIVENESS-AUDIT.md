# UI Responsiveness & Sizing Audit
**Components: SessionCard · InitiativeStrip · SessionBar · /session page**
*March 2026*

---

## Scope

This audit covers the three new components built in Step 7 and their composition inside the `/session` page. Each is reviewed against three device profiles:

| Profile | Width | Context |
|---------|-------|---------|
| **Small phone** | 360–390px | iPhone SE, Galaxy A-series |
| **Standard phone** | 390–430px | iPhone 15, Pixel 8 — primary DM device |
| **Tablet / large phone** | 600–768px | iPad mini, Galaxy Tab, foldables |

---

## 1. SessionCard

**File:** `control-panel/src/lib/components/SessionCard.css`

### ✅ What's Working

- `flex: 1` + `min-width: 0` on `.sc-body` ensures text truncates cleanly and the card never blows out of its container.
- `white-space: nowrap` + `text-overflow: ellipsis` on `.sc-name` prevents character names from wrapping and breaking layout.
- `flex-wrap: wrap` on `.sc-header` allows the class label to drop below the name on narrow cards rather than overflowing.
- `flex-shrink: 0` on `.sc-photo` prevents the avatar from squishing when the name is long.
- The 4px HP track height is intentional compactness — correct for a dense session view.

### ⚠️ Issues Found

#### ISSUE SC-1 — Photo is 56×56px, borderline small for touch (not interactive)
`.sc-photo` at 56×56px is fine as a non-interactive image. However when `isSelectable` is true, the entire card becomes tappable. The tap target on a 360px-wide screen with `padding: var(--space-3)` (12px) is comfortable. **No fix needed** — just confirming it's acceptable.

#### ISSUE SC-2 — `.sc-condition-badge` font-size 0.6rem is too small on small phones
`font-size: 0.6rem` = **9.6px** rendered. Below the 11px legibility floor for body text. On a 360px screen held at arm's length, condition names like `ENVENENADO` become unreadable.

**Fix:**
```css
.sc-condition-badge {
  font-size: 0.65rem; /* 10.4px — minimum readable at arm's length */
}
```

#### ISSUE SC-3 — `.sc-pip` at 10×10px has a touch area problem
When a card is selectable (full card tap), pips are passive. But if pips become interactive in the future, 10×10px is well below the 44px WCAG touch target. Flag for when pip interaction is added.

#### ISSUE SC-4 — No responsive adaptation between phone and tablet
The card is a fixed horizontal layout (photo left, body right) at all sizes. On a 768px tablet where cards sit in a 2-column grid at ~360px each, this is fine. But at full-width single-column on large tablets (600px+), the card has a lot of dead space to the right of the content. A tablet-optimised layout isn't blocking but would improve density.

#### ISSUE SC-5 — `.label-caps` at 0.7rem is marginal for class label
The class label (`FIGHTER L3`) uses the global `.label-caps` at `0.7rem` = 11.2px. Acceptable but tight on 360px. No change needed unless the class label proves hard to read in testing.

---

## 2. InitiativeStrip

**File:** `control-panel/src/lib/components/InitiativeStrip.css`

### ✅ What's Working

- **Pre-combat:** `.is-roll-list` as a flex column with `gap: var(--space-2)` scales naturally to any height — more characters just add rows, no overflow.
- `.is-roll-input` at 52px wide × 36px tall is sufficient for a number input on mobile.
- `.is-roll-name` has `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` — long names won't break the row layout.
- **Combat:** `.is-scroll` with `overflow-x: auto` + hidden scrollbar is the correct pattern for a horizontal strip that may overflow on small screens.
- `flex-shrink: 0` on `.is-token` ensures tokens don't compress when there are many combatants.

### ⚠️ Issues Found

#### ISSUE IS-1 — `.is-token` at 64px wide is too narrow for 4+ character names
`.is-token-name` is set to `0.65rem` (10.4px) with `overflow: hidden; text-overflow: ellipsis`. On a 64px token, a name like `THORIN` truncates to `THOR…` or `TH…` depending on letter width. With the `character.name.split(" ")[0]` logic in the Svelte component (first name only), this is manageable for common fantasy names but will fail for long single-word names.

**Fix option A — Widen tokens on larger screens:**
```css
.is-token {
  width: 64px; /* mobile */
}

@media (min-width: 480px) {
  .is-token {
    width: 72px;
  }
}

@media (min-width: 640px) {
  .is-token {
    width: 80px;
  }
}
```

**Fix option B — Raise font-size to 0.7rem** (improves readability but increases truncation risk).

#### ISSUE IS-2 — `.is-roll-input` touch target is 36px tall — below 44px minimum
The initiative number input is `height: 36px`. Apple HIG and WCAG 2.5.5 recommend 44px minimum touch targets for interactive elements. On a phone, a DM typing a number under time pressure will miss this input.

**Fix:**
```css
.is-roll-input {
  height: 44px; /* 44px minimum touch target */
}
```

#### ISSUE IS-3 — `.is-roll-row` has no minimum height, can collapse on small content
If a character has a short name and a small photo, the row can be as short as 36px (input height). Adding a minimum height ensures consistent tap area.

**Fix:**
```css
.is-roll-row {
  min-height: 52px;
}
```

#### ISSUE IS-4 — `.is-round-badge` font-size 0.65rem is marginal
The "RONDA 3" badge uses `0.65rem` = 10.4px. While this is intentionally small (secondary info), on a 360px screen it can be mistaken for decorative chrome rather than actionable round information. Consider `0.7rem`.

#### ISSUE IS-5 — Pre-combat has no max-height / scroll on sessions with 6+ players
With 6 characters, `.is-roll-list` will expand to roughly 6 × 52px + 5 × 8px = 352px. Combined with the start button, the precombat panel is ~420px tall before page scroll. On a 667px-tall phone (iPhone SE) with a fixed SessionBar, this leaves only ~120px for the session cards below — effectively hiding them.

**Fix:**
```css
.is-roll-list {
  max-height: 260px;
  overflow-y: auto;
}
```

---

## 3. SessionBar

**File:** `control-panel/src/lib/components/SessionBar.css`

### ✅ What's Working

- `position: fixed; bottom: 0` with `env(safe-area-inset-bottom)` correctly handles iOS home bar clearance.
- `overflow-x: auto` on `.sb-actions` prevents 4 buttons from overflowing on narrow screens — they scroll horizontally instead.
- `height: 40px` on `.sb-btn` is near the 44px touch target recommendation and acceptable given the bar's fixed nature (easy to stabilise palm against).
- `flex: 1` on `.sb-confirm-row` and `flex: 1` on `.sb-input` means the confirm row expands to fill available space.

### ⚠️ Issues Found

#### ISSUE SB-1 — `.sb-btn` at 40px tall — marginally below touch target
All buttons are `height: 40px`. The fixed bar means fingers are anchored against a known position, which partially compensates. However for the **CONFIRMAR** button in particular (confirmatory irreversible action), 44px is strongly preferred.

**Fix:**
```css
.sb-btn {
  height: 44px; /* upgraded from 40px */
}
```

The bar `min-height: 60px` provides sufficient vertical space to absorb this change.

#### ISSUE SB-2 — `.sb-input--number` capped at max-width: 80px may be too narrow on small phones
On a 360px phone with the cancel button (~80px) and the confirm button (~100px), the remaining space for `.sb-input--number` is ~360 - 16 (padding) - 8 (gap) - 80 (cancel) - 8 (gap) - 100 (confirm) = **~148px**. The `max-width: 80px` applies, giving 80px for the number input — fine. But on very small screens (320px) this could get tight. Current state is acceptable; revisit at 320px.

#### ISSUE SB-3 — `.sb-hint` text at 0.8rem may truncate on 360px screens with long action names
The hint reads "Selecciona un objetivo para **Condición**". At 0.8rem on a 360px screen, this is 2-line risk. The text has `text-align: center` but no `line-height` or `max-height` guard.

**Fix:**
```css
.sb-hint {
  font-size: 0.8rem;
  line-height: 1.3;
}
```
This allows graceful 2-line wrapping without breaking the bar height since `min-height: 60px` accommodates it.

#### ISSUE SB-4 — No `padding-top` guard on the fixed bar
The bar has `padding-bottom` for safe area but no `padding-top`. On some Android phones with a virtual navigation bar that overlaps content from the bottom, `padding-bottom` handles it. On some edge-case tablets in landscape, the bar may visually collide with other fixed elements. Low risk — document as known.

#### ISSUE SB-5 — `.sb-btn--next` uses `margin-left: auto` which can fail on narrow screens
In the idle state, `.sb-btn--next` pushes itself to the far right with `margin-left: auto`. On a 360px screen with 4 action buttons, if `.sb-actions` is near full width, the next button gets squeezed out of the visual area (it's outside `.sb-actions`, so `overflow-x: auto` doesn't apply to it — it's a sibling at the `.sb-bar` flex level).

**Test scenario:** 360px screen, 4 buttons at ~65px each = ~300px, plus gaps = ~324px. The `.sb-actions` flex container will limit to available space, but `.sb-btn--next` at `flex-shrink: 0` will eat into the remaining space. This should be fine at ~36px but verify in browser.

---

## 4. /session Page Composition

**File:** `control-panel/src/routes/session/+page.svelte`

### ✅ What's Working

- `padding-bottom: 80px` correctly clears the fixed `SessionBar` (60px bar + 20px breathing room).
- `.session-cards` uses `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` — this is responsive and correct. On a 360px phone it produces 1 column; on 640px+ it produces 2 columns.
- The `gap: var(--space-3)` (12px) between cards is comfortable without being wasteful.

### ⚠️ Issues Found

#### ISSUE PAGE-1 — `padding-bottom: 80px` hardcoded, doesn't account for iOS safe area
The `SessionBar` itself uses `env(safe-area-inset-bottom)` in its padding. But `.session-page`'s `padding-bottom: 80px` is a hardcoded pixel value. On an iPhone with a 34px home bar, the actual bar height is `60px + 34px = 94px`, and 80px clearance will result in the last card being **partially occluded by the SessionBar**.

**Fix:**
```css
.session-page {
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}
```

#### ISSUE PAGE-2 — `gap: var(--space-4)` (16px) between InitiativeStrip and session cards may feel too tight on small phones when the InitiativeStrip is in pre-combat mode (tall)
Not a bug, just a density observation. In pre-combat with 4 characters, the strip is ~300px tall. Combined with the cards grid, on a 667px phone the user immediately sees the page is heavily content-dense. Consider whether this is acceptable UX or if InitiativeStrip should be collapsible.

#### ISSUE PAGE-3 — `.session-cards` minmax(280px, 1fr) forces single column on 360px but cards feel wide
At 360px − 2×16px padding = 328px available. `minmax(280px, 1fr)` → single column at 328px. The SessionCard uses 56px photo + 12px gap + body — with 328px width the card has generous space. This is correct. **No issue.**

#### ISSUE PAGE-4 — No empty state when $characters is empty
If the server hasn't loaded characters yet or the party is empty, the session page renders blank space with only the InitiativeStrip. No "No hay personajes" message exists.

---

## Summary Table

| # | Component | Issue | Severity | Fix Effort |
|---|-----------|-------|----------|------------|
| SC-2 | SessionCard | Condition badge font 0.6rem too small | Medium | Trivial |
| IS-1 | InitiativeStrip | Token names truncate at 64px | Medium | Trivial |
| IS-2 | InitiativeStrip | Roll input 36px < 44px touch target | High | Trivial |
| IS-3 | InitiativeStrip | Roll row no min-height | Low | Trivial |
| IS-4 | InitiativeStrip | Round badge 0.65rem marginal | Low | Trivial |
| IS-5 | InitiativeStrip | Pre-combat list no max-height | High | Low |
| SB-1 | SessionBar | Buttons 40px < 44px touch target | Medium | Trivial |
| SB-3 | SessionBar | Hint text no line-height | Low | Trivial |
| PAGE-1 | /session | padding-bottom ignores safe-area | High | Trivial |
| PAGE-4 | /session | No empty state | Low | Low |

---

## Recommended Fixes (Consolidated)

All high and medium severity issues are one-line or two-line CSS fixes. Apply them in their respective CSS files:

### SessionCard.css
```css
/* SC-2: Condition badge minimum readable size */
.sc-condition-badge {
  font-size: 0.65rem;
}
```

### InitiativeStrip.css
```css
/* IS-2: Touch target minimum */
.is-roll-input {
  height: 44px;
}

/* IS-3: Row minimum height */
.is-roll-row {
  min-height: 52px;
}

/* IS-5: Prevent precombat overflow on small screens with 5+ chars */
.is-roll-list {
  max-height: 260px;
  overflow-y: auto;
}

/* IS-1: Responsive token width */
@media (min-width: 480px) {
  .is-token { width: 72px; }
}
@media (min-width: 640px) {
  .is-token { width: 80px; }
}
```

### SessionBar.css
```css
/* SB-1: Touch target minimum */
.sb-btn {
  height: 44px;
}

/* SB-3: Hint line-height for 2-line wrapping */
.sb-hint {
  line-height: 1.3;
}
```

### /session +page.svelte (inline `<style>`)
```css
/* PAGE-1: iOS safe-area aware clearance */
.session-page {
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}
```

---

## Overall Assessment

The three new components are **well-structured and responsive by default** — no major layout breakages exist. The issues found are refinements, not regressions. The most impactful fix is the **touch target increase** on the roll input and buttons (IS-2, SB-1) since the session panel is used under time pressure during live combat. The **safe-area padding fix** (PAGE-1) is a one-liner that prevents content from hiding behind the iPhone home bar — it should be applied immediately.
