# Design Critique — DADOS & RISAS

> Comprehensive UI/UX audit of the control panel, overlays, and design system.
> Original: 2026-02-22 | **Delta update: 2026-02-25**

---

## Delta Update — 2026-02-25

*Status of issues since the original critique. The project grew significantly: SvelteKit migration, 8 new components (CharacterBulkControls, CharacterCreationForm, CharacterManagement, Dashboard, DashboardCard, Modal, MultiSelect, PhotoSourcePicker), new routes structure, and drag-to-reorder on character cards.*

### ✅ Fixed

| # | Issue | Resolution |
|---|-------|-----------|
| P0 #2 | `window.alert()` for errors | Replaced with `.card-toast` inline component with animation |
| P1 #4 | `<select multiple>` anti-pattern | `MultiSelect.svelte` component built — custom listbox with toggle + checkmarks |
| P2 #11 | No shared token source for overlays | `public/tokens.css` created (but still diverges — see below) |
| P2 #14 | No skip-to-content link | `.skip-to-content` added to `app.css` |
| P2 #19 | No z-index or alpha opacity scales | `--z-*` and `--alpha-*` tokens added to `app.css` |
| P4 audit | Missing focus-visible outlines | `:where(...)` focus-visible rule added covering all core interactive elements |
| P4 audit | `.label-caps` unused in templates | DiceRoller and CharacterCard now use `class="label-caps"` in markup; local re-implementations deleted |
| P4 audit | State modifier naming inconsistency | Unified to `is-` prefix: `.is-critical`, `.is-crit`, `.is-fail`, `.is-selected` |
| P4 audit | HP gradient hardcoded hex values | `--hp-healthy-dim`, `--hp-injured-dim`, `--hp-critical-dim` tokens added and used |
| P4 audit | `.dice-btn` hardcoded shadow | Now uses `var(--shadow-card)` |
| P4 audit | `.d20-btn` hardcoded border | Now uses `var(--purple-mid)` |

### ⚠️ Partially Fixed

| # | Issue | Status |
|---|-------|--------|
| P2 #11 | `tokens.css` token sync | File exists but shadow values diverge (see DESIGN-SYSTEM.md §Token Sync) |

### ❌ Still Open

| Priority | Issue |
|----------|-------|
| P0 #1 | Cyan mismatch in level pills — `#00D4FF` vs `#00D4E8` |
| P0 #3 | Spanish diacriticals — "Seleccion multiple", "Dano" still present |
| P1 #5 | Modal focus trap missing — `<dialog open>` rendered without `showModal()` |
| P1 #6 | `role="tablist"` without `role="tab"` in PhotoSourcePicker |
| P1 #7 | No loading/disabled state on buttons during API calls |
| P1 #8 | d20 button not full-width (`grid-column: auto` not `1 / -1`) |
| P1 #9 | Photo fallback seeds randomly, not from character ID |
| P1 #10 | Sidebar uses `window.location.pathname` instead of SvelteKit `goto()` |
| P2 #13 | `aria-live` missing on real-time regions (HP updates, dashboard log) |
| P2 #16 | Dual-nav (sidebar + bottom tabs) creates wayfinding confusion |
| P2 #17 | Collapse animation 700ms, expand 250ms — asymmetric |
| — | `.char-card.collapsed` should be `.is-collapsed` for naming consistency |
| — | anime.js imported two ways across components (deep path vs named export) |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design System Evaluation](#design-system-evaluation)
3. [Token Consistency Audit](#token-consistency-audit)
4. [Typography & Visual Hierarchy](#typography--visual-hierarchy)
5. [Color System & Theming](#color-system--theming)
6. [Component-Level Critique](#component-level-critique)
7. [Layout & Navigation UX](#layout--navigation-ux)
8. [Accessibility (A11y) Audit](#accessibility-a11y-audit)
9. [OBS Overlay Design](#obs-overlay-design)
10. [Interaction Design & Motion](#interaction-design--motion)
11. [Mobile-First Assessment](#mobile-first-assessment)
12. [Cross-Platform & Responsive](#cross-platform--responsive)
13. [Prioritized Recommendations](#prioritized-recommendations)

---

## Executive Summary

**Overall grade: B+** — The project demonstrates a well-considered dark-theme design system with strong brand identity, thoughtful component architecture, and consistent visual language. The retro/comic offset-shadow aesthetic pairs well with the D&D theme. However, several areas need attention before production use:

### Strengths

- **Strong design token foundation** — Comprehensive `:root` variables for colors, spacing, radii, transitions, and fonts
- **Cohesive brand aesthetic** — Bebas Neue + JetBrains Mono + Dancing Script font stack creates a distinctive, thematic identity
- **HP health states are excellent** — The gradient + glow + pulse system (healthy/injured/critical) is immediately readable and visually satisfying
- **Mobile-first architecture** — Bottom nav, collapsible cards, touch-friendly 52px button targets
- **Real-time feedback** — Damage flash, dice bounce, HP bar transitions create compelling live interaction
- **Well-documented** — The CSS files have thorough JSDoc-style header comments mapping Svelte bindings to CSS classes

### Critical Issues

- **Design token drift** — ~29 hardcoded color values in control-panel CSS, wrong cyan value in level pills (`#00D4FF` ≠ `#00D4E8`)
- **Accessibility gaps** — Missing ARIA patterns (tablist without tab roles, modal without focus trap, no `aria-live` on real-time regions)
- **Overlay token isolation** — Overlays duplicate all values as hardcoded literals with no shared token source
- **`<select multiple>` anti-pattern** — Used for languages, skills, tools, armor, weapons, items — notoriously poor UX on mobile and for keyboard users

---

## Design System Evaluation

### What Works

The design system (`docs/DESIGN-SYSTEM.md` + `app.css`) is well-structured with clear sections:

| Category    | Tokens Defined                    | Coverage |
| ----------- | --------------------------------- | -------- |
| Colors      | 15 core + 3 dim + 3 HP states     | ★★★★☆    |
| Spacing     | 10 values (4px–48px)              | ★★★★★    |
| Radii       | 4 values (sm/md/lg/pill)          | ★★★★★    |
| Shadows     | 4 offset-shadow presets           | ★★★★☆    |
| Transitions | 3 presets (fast/normal/spring)    | ★★★☆☆    |
| Fonts       | 4 stacks (display/script/mono/ui) | ★★★★★    |

### What's Missing

1. **No opacity/alpha tokens** — The codebase uses `rgba(...)` with varying opacities (0.04, 0.06, 0.08, 0.12, 0.2, 0.35, 0.4, 0.5, 0.65, 0.88, 0.9, 0.92) for backgrounds, borders, and overlays. These should be formalized into semantic tokens:

   ```css
   --alpha-subtle: 0.04;
   --alpha-dim: 0.12;
   --alpha-medium: 0.35;
   --alpha-overlay: 0.65;
   --alpha-solid: 0.88;
   ```

2. **No gradient tokens** — HP bar gradients are duplicated identically in `CharacterCard.css` and `overlay-hp.css`. They should be defined once:

   ```css
   --gradient-healthy: linear-gradient(90deg, #15803d, var(--hp-healthy));
   --gradient-injured: linear-gradient(90deg, #b45309, var(--hp-injured));
   --gradient-critical: linear-gradient(90deg, #991b1b, var(--hp-critical));
   ```

3. **No z-index scale** — The sidebar uses `z-index: 30/40`, the modal uses `60/70`, the bottom nav uses `50`. No documented scale exists. Suggest:

   ```css
   --z-nav: 50;
   --z-sidebar-backdrop: 60;
   --z-sidebar: 70;
   --z-modal-backdrop: 80;
   --z-modal: 90;
   ```

4. **No breakpoint tokens** — Media queries use raw values (`480px`, `640px`, `768px`, `900px`, `1024px`). While CSS can't natively tokenize breakpoints, documenting them as a scale would help consistency.

5. **No animation duration tokens for special-case animations** — The HP fill transition (`0.4s–0.5s cubic-bezier`) and collapse animation (`0.7s`) are bespoke values that live outside the `--t-fast`/`--t-normal`/`--t-spring` system.

---

## Token Consistency Audit

### Critical Bug: Wrong Cyan in Level Pills

The `.char-level` and `.manage-char-level` classes use `rgba(0, 212, 255, 0.12)` and `rgba(0, 212, 255, 0.35)`, but the brand cyan is `#00D4E8` which is `rgb(0, 212, 232)`. The blue channel is **255 vs 232** — a visible color shift toward pure blue.

**Files affected:** `CharacterCard.css` (~lines 153-154), `CharacterManagement.css` (~lines 83-84)

**Fix:** Replace with `var(--cyan-dim)` for backgrounds and derive border from `var(--cyan)`.

### Hardcoded Values Summary

| Category          | Control Panel Files | Overlay Files | Total |
| ----------------- | ------------------- | ------------- | ----- |
| Colors (hex/rgba) | 20 instances        | 17 instances  | 37    |
| Spacing (px)      | 14 instances        | 12 instances  | 26    |
| Font families     | 0                   | 8 instances   | 8     |
| Border-radius     | 3 instances         | 5 instances   | 8     |
| Transitions       | 3 instances         | 2 instances   | 5     |

The control panel files mostly use tokens correctly but have ~40 slip-throughs. The overlay files have zero token usage because they're standalone HTML — a shared token approach should be considered.

### Recommendation for Overlays

Create a `public/tokens.css` file that duplicates the `:root` block, then `@import` it in both overlay CSS files. This ensures that if brand colors change, overlays update automatically.

---

## Typography & Visual Hierarchy

### What Works

- **Font stack is distinctive** — Bebas Neue (display), JetBrains Mono (data), Dancing Script (brand accent) creates clear hierarchy
- **`.label-caps` utility** — Consistent uppercase labels with 0.12em spacing, used throughout for form labels
- **`.mono-num` utility** — Bold monospace for numbers reinforces data-heavy screens
- **HP numbers are immediately scannable** — 2.25rem bold mono for current HP, smaller grey for max

### Issues

1. **Heading hierarchy is inconsistent** —
   - `+layout.svelte` header uses `<span class="page-title">` (not a heading)
   - CharacterCard uses `<h2>` for character names
   - Dashboard uses `<h1>` for "DASHBOARD EN VIVO", `<h2>` for sections
   - CharacterManagement uses `<h2>` → `<h3>` → `<h4>` (best of the bunch)

   **Fix:** Establish a document-wide heading policy. There should be exactly one `<h1>` (the page title), with components using `<h2>` and below.

2. **Brand wordmark is hard-coded text** — `<span class="brand-block">ESDH</span> <span class="brand-script">TTRPG</span>` — the original brand "DADOS & Risas" was changed to "ESDH TTRPG" but the CSS classes still reference the old brand. This disconnect makes the code harder to maintain.

3. **No text truncation strategy** — Only `.char-name` has `text-overflow: ellipsis`. Player names, condition names, and resource labels could overflow on narrow screens without truncation.

4. **Line-height inconsistencies** — Most display elements use `line-height: 1`, but body text uses `1.5`. The stat labels and values have no explicit line-height, relying on inheritance. This can cause alignment issues at different font sizes.

---

## Color System & Theming

### What Works

- **HP health states are the standout feature** — Three-tier color coding (green/orange/red) with matching gradients, glows, and pulse animation is immediately readable
- **Semantic color assignment is intuitive** — Red = damage/critical, Cyan = healing/connection, Purple = dice/magic
- **Dim variants** at 12% opacity provide subtle backgrounds without overwhelming the dark theme
- **Shadow system** — Offset shadows with no blur create a distinctive retro/comic aesthetic that suits D&D

### Issues

1. **Cyan is overloaded** — Used for: healing, connection status, focus outlines, submit buttons, section titles, level pills, dice crit, and brand accent. On a dense management screen, everything glows cyan. Consider introducing a fourth accent (e.g., gold/amber for non-interactive informational elements like titles/labels).

2. **No disabled state tokens** — Disabled buttons use `opacity: 0.6` or `0.65` inconsistently. Define a `--disabled-opacity` token and apply uniformly.

3. **No error state beyond `--red`** — Feedback messages use `color: var(--red)` for errors, which is the same red as damage and critical HP. An error state should be distinguishable from gameplay red. Consider a slightly different shade or adding an icon prefix.

4. **Dark mode only** — The system has no light mode consideration. While this is acceptable for an OBS-focused D&D tool, the system should explicitly document "dark only" as a design decision rather than leaving it as an implicit gap.

5. **Contrast ratio concerns** — `--grey` (#888888) on `--black` (#000000) gives a contrast ratio of ~5.4:1, which passes AA for normal text but fails AAA. For small text (0.7rem labels), this may be too subtle. `--grey-dim` (#333333) as a border on `--black-card` (#0D0D0D) yields only ~1.5:1, which is below AA for graphical elements.

---

## Component-Level Critique

### CharacterCard — ★★★★☆

**Strengths:**

- Excellent information density: HP, AC, speed, conditions, resources, and controls in one card
- Collapse/expand with anime.js spring animation is satisfying
- Damage flash overlay is a great microinteraction
- HP bar always visible even when collapsed — smart UX choice
- Selectable mode with checkbox for bulk operations

**Issues:**

- **Collapse animation duration asymmetry** — Collapse takes 700ms but expand takes only 250ms with a spring. The collapse feels sluggish by comparison. Consider reducing collapse to ~400ms.
- **No loading/disabled state during API calls** — `updateHp()` doesn't disable the button while awaiting the server response. Users can spam-click damage, potentially causing race conditions.
- **Error alerts use `window.alert()`** — This breaks the immersive dark theme with a native browser dialog. Use an in-card toast or inline error message instead.
- **Amount stepper has no press-and-hold** — Unlike the DiceRoller modifier stepper which supports hold-to-repeat, the damage/heal stepper requires individual clicks.
- **Photo fallback is random** — `resolvePhotoSrc("")` picks a random fallback on each render. If a component re-renders, the photo changes unexpectedly. Seed the random from character ID.

### DiceRoller — ★★★★☆

**Strengths:**

- Clean dice grid with icon + label pattern
- d20 special treatment (purple accent) correctly emphasizes the primary die
- Press-and-hold modifier stepper is excellent mobile UX
- Elastic bounce animation on results is delightful
- Crit/fail states with color + glow + label ("¡CRÍTICO!" / "¡PIFIA!") are immediately readable

**Issues:**

- **d20 is not full-width** — The design system doc and CSS both suggest d20 should span the full grid width (`grid-column: 1 / -1`), but the actual CSS uses `grid-column: auto`, making it the same width as other dice. This feels inconsistent with its visual prominence.
- **No roll history** — Once you roll again, the previous result is lost. A small 3-5 entry history list below the result would add context for the DM.
- **`document.querySelector` in Svelte** — The animation effect queries the DOM directly (`document.querySelector(".roll-result")`) instead of using Svelte bind references. This works but is fragile if multiple DiceRoller instances existed.
- **Modifier stepper width** — Each `±` button is `80px` fixed width, taking significant horizontal space. On very narrow screens (< 360px), this could overflow.

### CharacterCreationForm — ★★★☆☆

**Strengths:**

- Clean field layout with responsive grid
- Photo source picker inline with form is a nice flow
- Feedback messages for success/error
- `disabled` button during submission prevents double-submit

**Issues:**

- **`<select multiple>` for 6 fields** — Languages, skills, tools, armor, weapons, items all use native multi-select. This is **the single worst UX pattern in the project**. Multi-selects are:
  - Nearly impossible to use on mobile (no visible selection, requires Ctrl/Cmd+click on desktop)
  - Unscrollable on many mobile browsers
  - Invisible indication of how many items are selected
  - **Fix:** Replace with checkbox groups, searchable pill selectors, or at minimum a `<datalist>`-backed input.
- **No field validation beyond `required`** — HP, AC, and speed accept any number including negatives. No min/max enforcement in the form.
- **No character preview** — As users fill in the form, there's no live preview of what the character card will look like. This is a missed opportunity for the pitch demo.

### CharacterManagement — ★★★☆☆

**Strengths:**

- Good use of disclosure pattern (edit toggle with `aria-expanded`)
- Photo modal with `<dialog>` element
- Level-up functionality with class summary display
- Section dividers create clear visual separation

**Issues:**

- **Modal has no focus trap** — The `<dialog open>` is rendered declaratively without `showModal()`, so keyboard focus can escape behind the modal
- **No Escape key handler** on the photo modal
- **Same `<select multiple>` problem** as CharacterCreationForm
- **Edit form uses `oninput` with manual state maps** — Complex and error-prone compared to Svelte's `bind:value`. State synchronization issues could arise.
- **No unsaved changes warning** — If the user navigates away while editing, changes are silently lost

### PhotoSourcePicker — ★★★★☆

**Strengths:**

- Three-source pattern (preset/URL/local file) covers all use cases
- Drop zone with drag-and-drop + click-to-browse
- `aria-live="polite"` on preview region
- Dense mode variant for tight spaces

**Issues:**

- **`role="tablist"` without `role="tab"`** — The segment control announces as a tablist but children are plain `<button>` elements without `role="tab"`, `aria-selected`, or `aria-controls`. This actively confuses screen readers.
- **Two-column layout on mobile** — The photo picker uses `grid-template-columns: repeat(2, 1fr)` even at mobile widths. On a small phone, the preview image gets quite cramped next to the controls.

### BulkControls — ★★★☆☆

**Strengths:**

- Mode toggle pattern with clear active state
- Damage/heal/rest actions reuse existing design tokens

**Issues:**

- **Visual hierarchy is flat** — Title, count, toggles, and actions all sit in a flex-wrap row at the same visual weight. Hard to scan quickly.
- **"Seleccion multiple" is missing accent** — Should be "Selección múltiple". Multiple diacritical errors: "Dano" → "Daño", "elegidos" is correct.
- **No visual feedback on bulk operations** — After applying bulk damage/heal, there's no success/progress indicator. The user has to watch individual cards update.

---

## Layout & Navigation UX

### Architecture

The app uses a dual-nav pattern:

1. **Sidebar** (hamburger menu) for section switching: Control / Dashboard / Management
2. **Bottom nav** for tab switching within each section: Characters/Dice or Create/Manage

### What Works

- Bottom tab navigation is correct for mobile-first (thumb-friendly zone)
- Safe-area-inset padding handles iPhone notch
- Content area scrolls independently from fixed header/nav
- Page title in header changes based on active route — good wayfinding

### Issues

1. **Sidebar + bottom nav creates confusion** — Two navigation systems serve overlapping purposes. The sidebar switches between 3 top-level sections, and each section has its own bottom tabs. This creates a "where am I?" problem. Users may not discover the sidebar at all if they're focused on the bottom nav.

   **Suggestion:** Consider consolidating into a single bottom nav with 4-5 tabs (Characters, Dice, Dashboard, Create, Manage), or use the sidebar exclusively with no bottom tabs.

2. **Navigation uses full-page reload** — `navigateTo()` in the sidebar sets `window.location.pathname` directly, causing a full SvelteKit page reload. This should use SvelteKit's `goto()` for client-side navigation.

3. **No breadcrumb or "back" affordance** — Once inside Management → Create, there's no obvious way to get back to the Control panel except the hamburger menu.

4. \*\*Root redirect is `onMount(() => goto("/control/characters"))` — This causes a flash of blank content before redirecting. Use a server-side redirect or `+page.server.js` load function instead.

5. **Bottom nav overlaps content** — `padding-bottom: calc(var(--space-4) + 68px)` is hardcoded to account for the nav height. If the nav height changes (e.g., on devices with safe-area), content could be cut off.

---

## Accessibility (A11y) Audit

### WCAG 2.1 AA Compliance Assessment

| Criterion                    | Status     | Notes                                                         |
| ---------------------------- | ---------- | ------------------------------------------------------------- |
| 1.1.1 Non-text Content       | ⚠️ Partial | Alt text on photos but no alt on emoji nav icons              |
| 1.3.1 Info and Relationships | ❌ Fail    | Heading hierarchy inconsistent; tablist without tab roles     |
| 1.4.1 Use of Color           | ✅ Pass    | HP states use labels + color; conditions have text + color    |
| 1.4.3 Contrast (Minimum)     | ⚠️ Partial | `--grey` on `--black` passes AA but borderline for small text |
| 1.4.11 Non-text Contrast     | ❌ Fail    | `--grey-dim` borders on `--black-card` below 3:1 ratio        |
| 2.1.1 Keyboard               | ⚠️ Partial | Most controls accessible, but modal lacks focus trap          |
| 2.4.1 Bypass Blocks          | ❌ Fail    | No skip-to-content link                                       |
| 2.4.3 Focus Order            | ⚠️ Partial | Modal focus can escape backdrop                               |
| 2.4.6 Headings and Labels    | ⚠️ Partial | Good labels on inputs, but page title is not a heading        |
| 4.1.2 Name, Role, Value      | ❌ Fail    | Tablist children lack tab roles; `aria-invalid` missing       |

### Key A11y Findings

1. **Modal focus trap missing** — `CharacterManagement.svelte` renders `<dialog open>` declaratively. Without `showModal()`, there's no native focus trapping. Keyboard users can Tab behind the modal overlay.

2. **`role="tablist"` without `role="tab"` children** — `PhotoSourcePicker.svelte` uses a tablist wrapper but children are plain buttons. Screen readers announce "tablist with 0 tabs."

3. **No `aria-live` on real-time regions** — Dashboard log lists, connection status, and HP updates should use `aria-live="polite"` so screen readers announce changes.

4. **No `aria-invalid` or `aria-describedby`** — Form validation errors display visual feedback but aren't programmatically associated with inputs.

5. **No skip-to-content link** — The fixed header and nav create a long tab sequence before reaching the main content.

6. **Emoji navigation icons** — The bottom nav uses Unicode characters (⚔, ⬡, ＋, ⛭) without `aria-hidden="true"` or text alternatives beyond the label.

7. **Spanish diacritical errors** — "Seleccion multiple", "Dano", "Ultimas acciones" — incorrect Spanish that could confuse Spanish-speaking screen reader users.

---

## OBS Overlay Design

### What Works

- **Transparent canvas** with dark glass cards works beautifully for OBS compositing
- **HP bar transitions** (0.5s cubic-bezier) are smooth and satisfying on stream
- **Dice roll animation** (elastic bounce + auto-hide) is eye-catching without being distracting
- **Status message fadeInOut** provides connection feedback that auto-dismisses
- **Font choices match** the control panel (Bebas Neue + JetBrains Mono) creating visual continuity

### Issues

1. **No shared token source** — Both overlays duplicate every color, font, and spacing value as hardcoded literals. Any brand change requires editing 3+ files manually. Consider extracting a `public/tokens.css` with a `:root` block that both overlays `@import`.

2. **HP overlay is static layout** — Cards stack vertically from top-right with fixed 360px min-width. With 5+ characters, cards could overflow the 1080px canvas height. No scroll or wrap behavior exists.

3. **Dice container centering is fragile** — `left: 50%` + `margin-left: -160px` assumes a 320px card width. If content is wider, it won't be centered. Use `transform: translateX(-50%)` instead.

4. **No responsive consideration for non-1920×1080 canvases** — OBS sources can be any resolution. Both overlays hardcode `width: 1920px; height: 1080px`. If used at 4K or 720p, the layout won't adapt.

5. **anime.js 3.2.1 loaded but unused in HP overlay** — The script tag is included but no anime.js code is used. Remove for faster load or implement HP change animations.

6. **No character photo in HP overlay** — The control panel cards show character photos, but the HP overlay only shows name + player + bar. Adding a small avatar would improve visual continuity between the control panel and what appears on stream.

---

## Interaction Design & Motion

### What Works

- **Damage flash** — Red overlay fade (900ms) gives visceral feedback
- **Dice bounce** — Elastic easing (`outElastic(1, .6)`) on the result number is playful and thematic
- **HP bar transitions** — Smooth width + color changes make health changes readable
- **Critical pulse** — `barPulse` opacity animation on critical HP creates urgency
- **Active button press** — `translate(3px, 3px)` with shadow removal creates a satisfying "stamp" effect

### Issues

1. **No loading states** — API calls (`updateHp`, `rollDice`, `takeRest`) have no loading indicators. Users get no feedback between clicking and seeing the result.

2. **`window.alert()` for errors** — Three places use `alert()` for error feedback, which breaks the immersive dark UI and blocks interaction.

3. **Collapse asymmetry** — Collapse: 700ms ease-in-out + 450ms fade. Expand: 250ms spring. The collapse feels dramatically slower. Both should feel snappy — aim for 300-400ms total.

4. **No haptic feedback** — The app is mobile-first but never uses `navigator.vibrate()` for tactile confirmation on damage/heal/roll. A subtle 50ms vibration on dice rolls would enhance the physical connection.

5. **Tab transition `fadeUp` is subtle** — The tab switch animation (opacity 0→1, translateY 6→0) at 150ms is almost imperceptible. This is fine — the animation exists to prevent layout jank rather than be decorative.

6. **No skeleton/placeholder while loading** — On initial page load, there's a blank period before `initialData` arrives via Socket.io. A skeleton card layout would improve perceived performance.

---

## Mobile-First Assessment

### What Works

- 52px min-height on action buttons (above 44px touch target minimum)
- Bottom nav with proper safe-area-inset
- Collapsible cards reduce scrolling
- Full-width layouts on small screens

### Issues

1. **Multi-select dropdowns are unusable on mobile** — The most critical mobile UX issue. `<select multiple>` on iOS/Android shows a scrollable list that's nearly impossible to multi-select from.

2. **Stepper cluster too small** — The amount stepper buttons (32×32px) are below the recommended 44×44px touch target for mobile.

3. **No swipe gestures** — Tab switching requires tapping the bottom nav. Horizontal swipe between Characters ↔ Dice tabs would feel natural on mobile.

4. **Sidebar has no swipe-to-close** — The hamburger menu opens a sidebar overlay but only closes via the backdrop tap or ✕ button. Swipe-left-to-close is expected on mobile.

5. **Character photo picker on mobile** — The two-column layout (`photo-content`) doesn't stack on narrow phones, resulting in tiny preview images and cramped controls.

6. **No "pull to refresh"** — If Socket.io disconnects, there's no manual refresh mechanism. The user must know to reload the browser.

---

## Cross-Platform & Responsive

### Breakpoints Used

| Breakpoint          | Usage                                           |
| ------------------- | ----------------------------------------------- |
| `max-width: 480px`  | Force single-column fields                      |
| `max-width: 640px`  | Management grid → single column                 |
| `min-width: 768px`  | Character grid → 2 columns, dice panel centered |
| `min-width: 900px`  | Creation form → 2-column with photo sidebar     |
| `min-width: 1024px` | Character grid → 3 columns (when >2 chars)      |

### Issues

1. **No 320px–360px breakpoint** — The smallest explicit breakpoint is 480px, but many modern phones are 360px wide. At 320px, the bulk controls toolbar overflows, the dice grid buttons are cramped, and the stepper cluster may wrap unexpectedly.

2. **Desktop users get mobile UI** — The sidebar navigation is mobile-focused (hamburger → slide-out). Desktop users would benefit from a persistent left sidebar or top nav bar. The bottom nav on a 1920px-wide screen wastes horizontal space.

3. **Dice panel `clamp(33vw, 40vw, 50vw)` on desktop** — This constrains the dice roller to ~640-960px on a 1920px screen, which is reasonable, but there's no `max-width` cap. On ultra-wide monitors, buttons become unnecessarily small.

---

## Prioritized Recommendations

### P0 — Must Fix (Before Demo)

| #   | Issue                                                              | Impact                         | Effort |
| --- | ------------------------------------------------------------------ | ------------------------------ | ------ |
| 1   | Fix cyan color mismatch in level pills (`#00D4FF` → `#00D4E8`)     | Visual inconsistency           | 5 min  |
| 2   | Replace `window.alert()` with inline toast/feedback                | Breaks immersion               | 30 min |
| 3   | Fix Spanish diacriticals ("Selección múltiple", "Daño", "Últimas") | Professionalism for ESDH pitch | 10 min |

### P1 — Should Fix (Quality)

| #   | Issue                                                              | Impact                    | Effort  |
| --- | ------------------------------------------------------------------ | ------------------------- | ------- |
| 4   | Replace `<select multiple>` with checkbox groups or pill selectors | Unusable on mobile        | 2-3 hrs |
| 5   | Add focus trap to photo modal (`showModal()` or manual trap)       | A11y compliance           | 30 min  |
| 6   | Fix `role="tablist"` → add `role="tab"` + `aria-selected` children | A11y compliance           | 20 min  |
| 7   | Add loading/disabled state to action buttons during API calls      | Prevents spam-clicks      | 45 min  |
| 8   | Make d20 button full-width (`grid-column: 1 / -1`) per design spec | Design spec compliance    | 5 min   |
| 9   | Seed photo fallback by character ID (not random)                   | Prevents photo flickering | 10 min  |
| 10  | Convert sidebar `navigateTo()` to SvelteKit `goto()`               | Prevents full-page reload | 10 min  |

### P2 — Nice to Have (Polish)

| #   | Issue                                                         | Impact                     | Effort  |
| --- | ------------------------------------------------------------- | -------------------------- | ------- |
| 11  | Extract `public/tokens.css` for overlay token sharing         | Maintainability            | 30 min  |
| 12  | Replace hardcoded `999px` with `var(--radius-pill)`           | Token consistency          | 5 min   |
| 13  | Add `aria-live="polite"` to dashboard logs and HP regions     | A11y for real-time content | 15 min  |
| 14  | Add skip-to-content link                                      | A11y navigation            | 15 min  |
| 15  | Add skeleton loading placeholders                             | Perceived performance      | 1 hr    |
| 16  | Consolidate dual-nav (sidebar + bottom tabs) into unified nav | UX clarity                 | 2-3 hrs |
| 17  | Balance collapse/expand animation durations                   | Motion polish              | 15 min  |
| 18  | Add haptic feedback for damage/roll on mobile                 | Delight                    | 15 min  |
| 19  | Define z-index and opacity token scales                       | System completeness        | 15 min  |
| 20  | Add small-screen (320px) breakpoint handling                  | Edge-case responsiveness   | 45 min  |

---

## Conclusion

The DADOS & RISAS design system is impressively mature for an MVP. The dark theme, retro offset shadows, health-state gradients, and font choices all contribute to a cohesive D&D aesthetic that would present well in a pitch. The main risks are the mobile UX of multi-selects, accessibility gaps in modal and ARIA patterns, and the growing token drift in CSS files.

For the Monday pitch to ESDH, prioritize P0 items (3 fixes, ~45 min total) and ensure the demo script avoids the multi-select screens. The P1 items would be needed for any production deployment.
