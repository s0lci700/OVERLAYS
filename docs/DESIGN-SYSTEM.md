# Dados & Risas — Design System
**Version:** 2.0 | **Updated:** 2026-02-25 | **Stack:** Svelte 5 + SvelteKit + Vite

> This document is the canonical reference for all design decisions in the Dados & Risas Overlay System. It covers the control panel (`control-panel/src/`) and the shared overlay token layer (`public/tokens.css`).

---

## Architecture Overview

```
src/
├── app.css                    ← Canonical token source + shared base classes
├── routes/
│   ├── +layout.svelte         ← Root shell: header, nav, sidebar
│   ├── +page.svelte           ← Redirects to /control/characters
│   ├── control/
│   │   ├── +layout.svelte     ← Control sub-layout
│   │   ├── characters/+page.svelte  ← HP management, conditions, resources
│   │   └── dice/+page.svelte        ← Dice roller
│   ├── dashboard/+page.svelte       ← Activity history, analytics
│   └── management/
│       ├── +layout.svelte
│       ├── create/+page.svelte      ← Character creation form
│       └── manage/+page.svelte      ← Character list / bulk actions
└── lib/
    ├── CharacterCard.svelte/.css         ← Per-character HP panel
    ├── CharacterBulkControls.svelte/.css ← Multi-select bulk actions
    ├── CharacterCreationForm.svelte/.css ← New character wizard
    ├── CharacterManagement.svelte/.css   ← Management list view
    ├── Dashboard.css / DashboardCard.svelte/.css
    ├── DiceRoller.svelte/.css
    ├── Modal.svelte                      ← Reusable dialog overlay
    ├── MultiSelect.svelte/.css           ← Custom multi-select listbox
    ├── PhotoSourcePicker.svelte/.css     ← Avatar source chooser
    └── socket.js                         ← Socket.io + shared stores

public/
└── tokens.css   ← Overlay-shared token subset (see §Token Sync below)
```

Token flow: `app.css :root` defines all tokens → components reference them → `public/tokens.css` mirrors the subset needed by OBS overlay HTML files.

---

## Design Tokens

All tokens live in `:root` in `src/app.css`. Reference them as `var(--token-name)`.

### Brand Colors

| Token | Value | Use |
|-------|-------|-----|
| `--red` | `#FF4D6A` | Damage, conditions, critical state, danger |
| `--red-dim` | `rgba(255,77,106,0.12)` | Damage button bg, condition pill bg |
| `--cyan` | `#00D4E8` | Healing, selection, focus rings, links |
| `--cyan-dim` | `rgba(0,212,232,0.12)` | Heal button bg, selected state bg |
| `--purple` | `rgba(80,13,245,1)` | d20 button accent |
| `--purple-dim` | `rgba(80,13,245,0.12)` | d20 button bg |
| `--purple-mid` | `rgba(80,13,245,0.50)` | d20 border color at rest |

> ⚠️ `--cyan` is `#00D4E8`. Do not use `#00D4FF` — that shade is off-brand and appears only in a known bug in `tokens.css` level-pill styles (tracked).

### Neutral / Surface Colors

| Token | Value | Use |
|-------|-------|-----|
| `--black` | `#0A0A0A` | Page background |
| `--black-card` | `#111111` | Card surface |
| `--black-elevated` | `#1A1A1A` | Elevated surfaces, input bg, hp-track |
| `--white` | `#F0F0F0` | Primary text, active labels |
| `--grey` | `#888888` | Secondary text, inactive labels |
| `--grey-dim` | `rgba(136,136,136,0.15)` | Subtle borders, dividers |

### HP Health-State Colors

| Token | Value | Use |
|-------|-------|-----|
| `--hp-healthy` | `#22C55E` | HP bar end color (>60%) |
| `--hp-healthy-dim` | `#15803D` | HP bar start color (gradient left) |
| `--hp-injured` | `#F59E0B` | HP bar end color (30–60%) |
| `--hp-injured-dim` | `#B45309` | HP bar start color |
| `--hp-critical` | `#FF4D6A` | HP bar end color (<30%) |
| `--hp-critical-dim` | `#991B1B` | HP bar start color |

### Spacing Scale

| Token | Value | Use |
|-------|-------|-----|
| `--space-half` | `2px` | Sub-pixel tight gaps (char-identity, hp-nums) |
| `--space-1` | `4px` | Minimum comfortable gap |
| `--space-2` | `8px` | Default component gap |
| `--space-3` | `12px` | Section internal padding |
| `--space-4` | `16px` | Card padding |
| `--space-5` | `24px` | Section separation |
| `--space-6` | `32px` | Large layout gap |
| `--space-7` | `48px` | Page-level spacing |

### Border Radii

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | `4px` | Small UI elements (steppers, tags) |
| `--radius-md` | `8px` | Cards, inputs, buttons |
| `--radius-lg` | `12px` | Large cards |
| `--radius-pill` | `999px` | Pills, badges, HP track |

### Shadows

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-card` | `3px 3px 0px rgba(255,255,255,0.05)` | Cards, dice buttons |
| `--shadow-cyan` | `3px 3px 0px #00D4E8` | Heal button active shadow |
| `--shadow-red` | `3px 3px 0px #FF4D6A` | Damage button active shadow |
| `--shadow-purple` | `3px 3px 0px rgba(80,13,245,0.6)` | d20 button active shadow |

> ⚠️ `tokens.css` currently has divergent shadow values. See §Token Sync.

### Motion

| Token | Value | Use |
|-------|-------|-----|
| `--t-fast` | `120ms ease` | Hover states, toggles |
| `--t-normal` | `220ms ease` | State transitions |
| `--t-slow` | `360ms ease` | Layout shifts, panels |

### Typography

| Token | Value | Use |
|-------|-------|-----|
| `--font-display` | `'Black Ops One', sans-serif` | Character names, brand, labels |
| `--font-ui` | `'Inter', sans-serif` | Body text, form labels, most UI |
| `--font-mono` | `'JetBrains Mono', monospace` | HP numbers, dice results, values |

### Z-Index Scale

| Token | Value | Layer |
|-------|-------|-------|
| `--z-sidebar-backdrop` | `30` | Sidebar overlay scrim |
| `--z-sidebar` | `40` | Sidebar panel |
| `--z-nav` | `50` | Bottom navigation |
| `--z-modal-backdrop` | `60` | Modal scrim |
| `--z-modal` | `70` | Modal panel |

### Alpha Opacity Scale

| Token | Value | Use |
|-------|-------|-----|
| `--alpha-subtle` | `0.04` | Hover tints |
| `--alpha-dim` | `0.12` | Dim overlays, tinted backgrounds |
| `--alpha-medium` | `0.35` | Mid-opacity borders |
| `--alpha-overlay` | `0.65` | Scrim/overlay backdrops |
| `--alpha-solid` | `0.88` | Near-opaque fills |

---

## Shared Base Classes

Defined in `app.css`. Extend rather than re-implement.

### `.card-base`
Dark card surface with border and shadow. All character cards and dashboard cards extend this.

```css
/* bg var(--black-card), border 1px solid var(--grey-dim),
   border-radius var(--radius-lg), box-shadow var(--shadow-card),
   padding var(--space-4), display flex column, gap var(--space-3) */
```

### `.btn-base`
Shared button foundation. All action buttons extend this.

```css
/* display flex, align-items center, justify-content center,
   border-radius var(--radius-md), border 1px solid,
   font-family var(--font-display), text-transform uppercase,
   letter-spacing 0.08em, cursor pointer,
   :active → translate(3px,3px) + box-shadow none */
```

### `.label-caps`
Small uppercase label. **Do not re-implement locally.** Apply as a class in the template.

```css
/* font-family var(--font-display), font-size 0.8rem, color var(--grey),
   letter-spacing 0.12em, text-transform uppercase, line-height 1 */
```

Used in: `DiceRoller.svelte` (PERSONAJE ACTIVO, MODIFICADOR), `CharacterCard.svelte` (stat and resource labels via template class).

### `.selector`
Reusable `<select>` wrapper. Apply to any select element for consistent styling.

### `.selection-pills` / `.selection-pill`
Shared tag/pill display for multi-value selections.

### `.skip-to-content`
Accessibility skip link. Positioned offscreen, surfaces on focus.

### `.characters-grid`
Responsive CSS-columns layout for character cards. 1 column → 2 columns at medium breakpoint.

### `.app-sidebar`
Slide-in sidebar panel at `z-index: var(--z-sidebar)`. Includes backdrop at `z-index: var(--z-sidebar-backdrop)`.

---

## App Shell Layout

```
┌─────────────────────────────────┐
│  .app-header                    │  Fixed top — brand + conn dot + char count
│  .header-menu  [☰]              │  Sidebar trigger (mobile)
├─────────────────────────────────┤
│                                 │
│  .app-main / <main>             │  Scrollable flex-grow area
│                                 │
├─────────────────────────────────┤
│  .bottom-nav                    │  Fixed bottom — z: var(--z-nav)
│  [PERSONAJES] [DADOS] [PANEL]   │
└─────────────────────────────────┘

.app-sidebar slides in from left when open
```

---

## Component Inventory

### CharacterCard
**File:** `CharacterCard.svelte / CharacterCard.css`

**States:**

| Class | Applied to | Condition |
|-------|-----------|-----------|
| `.is-critical` | `.char-card`, `.hp-cur` | HP ≤ 30% |
| `.is-selected` | `.char-card` | Checkbox checked |
| `.collapsed` | `.char-card` | Card collapsed (tracked: should be `.is-collapsed`) |
| `.is-dragging` | `.char-card-exit-wrap` | During drag-to-reorder |

**Drag-to-reorder:** `.char-card-exit-wrap` wraps each card. `.drag-handle` is a 20px strip above the card.

**Hit flash:** `.hit-flash` overlay fades in/out via anime.js on HP decrease.

**Card toast:** `.card-toast` — inline error messaging (replaces `window.alert()`).

---

### CharacterBulkControls
Contextual action bar appearing when ≥1 card is selected. Bulk damage / heal / rest / condition operations.

---

### CharacterCreationForm
Multi-field form: name, player, class, level, HP max, AC, movement, avatar (via PhotoSourcePicker), resources.

---

### CharacterManagement
List view of all characters with edit/delete. Used in `management/manage` route.

---

### DashboardCard
Stat/metric card. Extends `.card-base`.

---

### DiceRoller
**File:** `DiceRoller.svelte / DiceRoller.css`

**States:**

| Class | Applied to | Condition |
|-------|-----------|-----------|
| `.is-crit` | `.roll-result`, `.roll-number`, `.roll-label` | Natural 20 on d20 |
| `.is-fail` | `.roll-result`, `.roll-number`, `.roll-label` | Natural 1 |

**d20 button:** Full-width, purple accent, 4px active offset (intentionally heavier than the 3px standard).

---

### Modal
**File:** `Modal.svelte`
Reusable dialog overlay. `z-index: var(--z-modal)`, backdrop at `z-index: var(--z-modal-backdrop)`.

> ⚠️ **Known gap:** Focus trap not yet implemented. P1 accessibility issue.

---

### MultiSelect
**File:** `MultiSelect.svelte / MultiSelect.css`
Custom listbox replacing `<select multiple>`. Click to toggle, checkmark for selected state.

**Classes:** `.multiselect`, `.ms-option`, `.ms-option.ms-selected`, `.ms-label`, `.ms-check`, `.ms-empty`

---

### PhotoSourcePicker
Avatar source selection: URL, file upload, or preset portraits. Used inside CharacterCreationForm.

---

## Resource Pip Color Coding

| Class | Recovery Type | Color |
|-------|--------------|-------|
| `.pip--long_rest` | Long rest only | Red (`--red`) |
| `.pip--short_rest` | Short or long rest | Cyan (`--cyan`) |
| `.pip--turn` | Per-turn / rechargeable | Grey (`--grey`) |
| `.pip--dm` | DM-controlled | Grey (`--grey`) |

Filled state: `.pip--filled` adds background + glow `box-shadow`.

---

## Animations

| Animation | Target | Trigger | Mechanism |
|-----------|--------|---------|-----------|
| HP damage flash | `.hit-flash` | HP decrease | anime.js |
| Dice result bounce | `.roll-result`, `.roll-number` | Roll broadcast | anime.js |
| HP bar width | `.hp-fill` | Any HP change | CSS `transition: width` |
| Card collapse | `.char-body` height | Toggle | CSS transition |
| Card toast | `.card-toast` | Error event | CSS `@keyframes toastIn` |
| Drag elevation | `.char-card-exit-wrap.is-dragging` | Drag start | JS class toggle |

---

## OBS Overlay Specifics

Three HTML files in `public/` loaded as OBS Browser Sources (1920×1080, transparent):

| File | Purpose |
|------|---------|
| `overlay-hp.html` | HP bars, character avatars, class badges, AC, conditions |
| `overlay-dice.html` | Animated dice roll popup with crit flash, character avatar, auto-hide |
| `overlay-conditions.html` | Active conditions + depleted resources panel |

Overlays import `public/tokens.css` for their token values — this file must stay in sync with `app.css`.

---

## Token Sync Status — `app.css` vs `tokens.css`

### Known Divergences (2026-02-25)

| Token | `app.css` | `tokens.css` | Impact |
|-------|-----------|-------------|--------|
| `--shadow-card` | `3px 3px 0px rgba(255,255,255,0.05)` | `4px 4px 0px rgba(0,0,0,0.9)` | Overlays show dark opaque shadow |
| `--shadow-cyan` | `3px 3px 0px #00D4E8` | `4px 4px 0px #00D4E8` | Heal shadow larger in overlays |

### In `tokens.css` only
- `--gradient-healthy`, `--gradient-injured`, `--gradient-critical` (full gradient shorthands)

### In `app.css` only (missing from `tokens.css`)
- All alpha tokens (`--alpha-*`)
- Z-index scale (`--z-*`)
- `--red-dim`, `--cyan-dim`, `--purple-dim`, `--purple-mid`
- Spacing scale (`--space-*`)
- All transition tokens (`--t-*`)
- `--shadow-red`, `--shadow-purple`
- `--hp-healthy-dim`, `--hp-injured-dim`, `--hp-critical-dim`

**Recommendation:** Treat `app.css` as the single source of truth. Add a build step to extract and copy the `:root {}` block to `public/tokens.css`, filtered to overlay-relevant tokens only.

---

## Focus-Visible Standard

All interactive elements use `outline: 2px solid var(--cyan); outline-offset: 2px`. The shared rule in `app.css` covers the core button set:

```css
:where(.btn-damage, .btn-heal, .btn-rest, .dice-btn,
       .condition-pill, .stepper, .nav-tab):focus-visible {
  outline: 2px solid var(--cyan);
  border-radius: var(--radius-sm);
  outline-offset: 2px;
}
```

New components should follow this same pattern.

---

## State Modifier Naming Convention

Use `is-` prefix for all boolean state modifiers. This is the established convention throughout the codebase.

```
✅ .char-card.is-critical
✅ .hp-cur.is-critical
✅ .roll-result.is-crit
✅ .roll-result.is-fail
✅ .char-card.is-selected
⚠️ .char-card.collapsed     ← should become .char-card.is-collapsed
```

---

## Known Open Issues

| Priority | Issue | Location |
|----------|-------|---------|
| P1 | Modal has no focus trap — tab escapes | `Modal.svelte` |
| P2 | `tokens.css` shadow values diverge from `app.css` | `public/tokens.css` |
| P2 | anime.js imported via two different paths across components | `CharacterCard.svelte` vs `DiceRoller.svelte` |
| P2 | `.char-card.collapsed` should be `.is-collapsed` | `CharacterCard.css` |
| P3 | No automated token sync between `app.css` and `tokens.css` | build config |

*Full context and recommendations in DESIGN-CRITIQUE.md.*
