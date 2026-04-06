---
title: UI Components Reference
type: reference
source_files: [control-panel/src/lib/components/shared/, control-panel/src/app.css, design/tokens.json]
last_updated: 2026-04-04
---

# UI Components Reference

> **Goal:** Find any component's styles in under 30 seconds.
> Jump to: [Primitives](#primitives) · [Business Components](#business-components) · [Overlays](#overlays) · [Global CSS](#global-css) · [Token Quick-Ref](#token-quick-ref)

---

## How Styles Work in This Project

Two tiers — know which tier = know where to look.

| Tier | Who | Styled via | Where to edit |
|---|---|---|---|
| **Primitives** | `button`, `input`, `badge`, `label`, `stepper`, etc. | `tailwind-variants` (`tv()`) | Variant object inside the `.svelte` file |
| **Business components** | `CharacterCard`, `DiceRoller`, `CharacterCreationForm`, `SessionCard`, etc. | Co-located `.css` file | The paired `.css` file in the same directory |
| **Overlays** | Everything under `(audience)/` | `overlays.css` + token variables | `src/overlays.css` |
| **Global** | Shared classes used everywhere | `app.css` | `src/app.css` |
| **Tokens** | CSS variables | `generated-tokens.css` (auto) | Edit `design/tokens.json`, then run `bun run generate:tokens` |

---

## Primitives

All live in `control-panel/src/lib/components/shared/`.

### `button/button.svelte`
**Styled via:** `tailwind-variants` (`tv()`) inside the file — no CSS file.

| Prop | Values |
|---|---|
| `variant` | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` |
| `size` | `default` · `sm` · `lg` · `icon` · `icon-sm` · `icon-lg` |

**To change button styles:** Edit the `buttonVariants` `tv()` object in `button.svelte`.

---

### `input/input.svelte`
**Styled via:** Tailwind classes inside `cn()` — no CSS file.
Classes: `h-9 w-full rounded-md border px-3 py-1 focus-visible:border-ring focus-visible:ring-[3px]`

**Override in business components** via `.form-input` in the component's own CSS (e.g., `CharacterCreationForm.css`).

---

### `label/label.svelte`
**Styled via:** Tailwind `flex items-center gap-2 text-sm font-medium`.
For all-caps display labels, pass `class="label-caps"` (defined in `app.css`).

---

### `badge/badge.svelte`
**Styled via:** `tailwind-variants` (`tv()`) — no CSS file.

| Prop | Values |
|---|---|
| `variant` | `default` · `secondary` · `destructive` · `outline` |

---

### `condition-pill/condition-pill.svelte`
**Styled via:** `tailwind-variants` (`tv()`) — no CSS file.

| Variant | Look | Use case |
|---|---|---|
| `condition` | Red bg + red text | Active conditions on characters |
| `tag` | Cyan bg + cyan text | Selected items preview |
| `info` | Transparent + grey text | Read-only labels |

Add `interactive` prop to get a × close button.

---

### `stat-display/stat-display.svelte`
**Styled via:** `tailwind-variants` (`tv()`) — no CSS file.

| Variant | Layout | Use case |
|---|---|---|
| `inline` | Label + value side-by-side | `CharacterCard` stat row |
| `cell` | Label above value | `DashboardCard` ability score cells |

---

### `stepper/stepper.svelte`
**Styled via:** `tailwind-variants` (`tv()`) — no CSS file.

| Size | Dimensions | Use case |
|---|---|---|
| `sm` | 32×32px buttons | HP damage in `CharacterCard` |
| `lg` | 80×60px buttons | Dice modifier in `DiceRoller` |

Hold-to-repeat is built in (via `onpointerdown` + `setTimeout`/`setInterval`).

---

### `read-only-field/read-only-field.svelte`
**Styled via:** `tailwind-variants` (`tv()`) — no CSS file.

| Variant | Layout |
|---|---|
| `default` | Label stacked above value |
| `inline` | Label + colon + value on one line |

---

### `selection-pill-list/selection-pill-list.svelte`
**Styled via:** Tailwind `flex flex-wrap gap-1 mt-1` on root.
Renders `ConditionPill variant="tag"` for each item.
**Props:** `items: string[]`, `labelMap: Map<string, string>` for key → display label.

---

### `pills/LevelPill.svelte`
**Styled via:** `Pills.css` → class `.level-pill`
Key styles: `border: 1px solid var(--cyan)`, `border-radius: var(--radius-pill)`, `font-family: var(--font-display)`, `font-size: 0.7rem`, `height: 1.5rem`

---

### `pills/SelectionPills.svelte`
**Styled via:** `Pills.css` → classes `.selection-pills`, `.selection-pill`, `.pills-empty`

---

### `modal/Modal.svelte`
**Styled via:** `modal.css` (for `.cp-modal-card`, `.cp-modal-head`, `.cp-modal-title`, `.cp-modal-close`) + `app.css` (for `.card-base`)
**Centering:** Handled by `dialog-content.svelte` via Tailwind `fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`. **Do not add `position: relative` to `.cp-modal-card`** — it breaks this.

```
Modal.svelte
└── dialog/dialog-content.svelte   ← positions the box (fixed, centered)
    └── dialog/dialog-overlay.svelte  ← the dark backdrop
    └── dialog/dialog-portal.svelte   ← appended to <body>
```

**To change modal card appearance:** Edit `.cp-modal-card` in `modal.css`.
**To change centering/animation:** Edit Tailwind classes in `dialog-content.svelte`.

---

### `dialog/` files
| File | Role |
|---|---|
| `dialog.svelte` | Thin wrapper around `bits-ui` `Dialog.Root` |
| `dialog-content.svelte` | Positions + animates the card. All `fixed`/`translate` classes live here. |
| `dialog-overlay.svelte` | `fixed inset-0 bg-black/50` backdrop |
| `dialog-portal.svelte` | Renders into `<body>` (teleport) |
| `dialog-trigger.svelte` | The button that opens the dialog |
| `dialog-close.svelte` | The ✕ close button |

---

### `alert-dialog/` files
Destructive-confirmation variant of Dialog — requires explicit cancel/confirm actions; cannot be dismissed by clicking the backdrop.

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` (bindable) | `false` |

| File | Role |
|---|---|
| `alert-dialog.svelte` | `bits-ui` `AlertDialog.Root` wrapper; bindable `open` |
| `alert-dialog-content.svelte` | Centered modal card (`fixed top-[50%] left-[50%]`, `z-50`, `fade-in/zoom-in` animations) |
| `alert-dialog-overlay.svelte` | Dark backdrop (teleported to `<body>`) |
| `alert-dialog-header.svelte` | Flex column wrapper for title + description |
| `alert-dialog-footer.svelte` | Flex row wrapper for cancel + action buttons |
| `alert-dialog-title.svelte` | Bold heading (`data-slot="alert-dialog-title"`) |
| `alert-dialog-description.svelte` | Muted body text (`data-slot="alert-dialog-description"`) |
| `alert-dialog-action.svelte` | Primary confirm button (destructive styling) |
| `alert-dialog-cancel.svelte` | Cancel button (outline styling) |

---

### `accordion/accordion.svelte`
**Primitive:** `bits-ui` `Accordion.Root`

| Prop | Type | Default |
|---|---|---|
| `ref` | bindable | `null` |
| `value` | bindable (string or string[]) | — |
| `type` | `"single"` \| `"multiple"` | — |

`data-slot="accordion"` on root. Sub-components: `accordion-item.svelte`, `accordion-trigger.svelte`, `accordion-content.svelte`.

---

### `checkbox/checkbox.svelte`
**Primitive:** `bits-ui` `Checkbox.Root` — 16×16px bordered square, `rounded-[4px]`.

| Prop | Type | Default |
|---|---|---|
| `ref` | bindable | `null` |
| `checked` | `boolean` (bindable) | `false` |
| `indeterminate` | `boolean` (bindable) | `false` |
| `class` | `string` | — |

States: unchecked (border only), checked (primary bg + `CheckIcon`), indeterminate (`MinusIcon`). Focus ring: `ring-[3px]`.

---

### `collapsible/collapsible.svelte`
**Primitive:** `bits-ui` `Collapsible.Root` — thin wrapper with bindable `open`.

| Prop | Type | Default |
|---|---|---|
| `ref` | bindable | `null` |
| `open` | `boolean` (bindable) | `false` |

`data-slot="collapsible"` on root. Sub-components: `collapsible-trigger.svelte` (`data-slot="collapsible-trigger"`), `collapsible-content.svelte`.

---

### `radio-group/radio-group.svelte`
**Primitive:** `bits-ui` `RadioGroup.Root` — `grid gap-3` layout.

| Prop | Type | Default |
|---|---|---|
| `ref` | bindable | `null` |
| `value` | `string` (bindable) | `""` |
| `class` | `string` | — |

`data-slot="radio-group"`. Sub-component: `radio-group-item.svelte` — 16×16px circle, filled dot when checked (`CircleIcon fill-primary`).

---

### `scroll-area/scroll-area.svelte`
**Primitive:** `bits-ui` `ScrollArea.Root` — `relative` container with managed scrollbars.

| Prop | Type | Default |
|---|---|---|
| `ref` | bindable | `null` |
| `viewportRef` | bindable | `null` |
| `orientation` | `"vertical"` \| `"horizontal"` \| `"both"` | `"vertical"` |
| `scrollbarXClasses` | `string` | `""` |
| `scrollbarYClasses` | `string` | `""` |

Renders `Scrollbar` sub-components based on `orientation`. Corner handled by `ScrollAreaPrimitive.Corner`.

---

### `select/select.svelte`
**Primitive:** `bits-ui` `Select.Root`

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` (bindable) | — |
| `value` | bindable | — |
| `type` | `"single"` \| `"multiple"` | — |

Sub-components: `select-trigger.svelte` (the visible button), `select-item.svelte` (each option), `select-group.svelte` + `select-group-heading.svelte`, `select-label.svelte`, `select-separator.svelte`, `select-portal.svelte`.

---

### `separator/separator.svelte`
**Primitive:** `bits-ui` `Separator.Root` — 1px rule.

`data-[orientation=horizontal]`: `h-px w-full` · `data-[orientation=vertical]`: `min-h-full w-px`

Pass `orientation` via `restProps`. Token: `bg-border`.

---

### `sheet/sheet.svelte`
**Primitive:** `bits-ui` `Dialog` used as a slide-in panel (Sheet). Bindable `open`.

| File | Role |
|---|---|
| `sheet.svelte` | Dialog.Root wrapper, bindable `open` |
| `sheet-trigger.svelte` | Button to open |
| `sheet-portal.svelte` | Teleports to `<body>` |
| `sheet-close.svelte` | Close button |
| `sheet-header.svelte` | Title + description slot |
| `sheet-footer.svelte` | Action buttons slot |

Sheet content/overlay/side positioning is handled in `sheet-portal.svelte`. No built-in `content.svelte` — compose manually via `portal`.

---

### `skeleton/skeleton.svelte`
Loading placeholder. `bg-accent animate-pulse rounded-md` — bind size via `class` or `style`.

| Prop | Type |
|---|---|
| `ref` | bindable |
| `class` | `string` |

---

### `sonner/sonner.svelte`
Toast notification renderer — wraps `svelte-sonner` `Toaster`.

- Mode-aware: reads `mode-watcher` theme → passes `light` or `dark` to Toaster
- Tokens: `--color-popover` (bg), `--color-border` (border)
- Custom icon snippets for all 5 states: `loading`, `success`, `error`, `info`, `warning`

No props — mount once at the app root (e.g. `+layout.svelte`). Trigger toasts via `import { toast } from 'svelte-sonner'`.

---

### `tabs/tabs.svelte`
**Primitive:** `bits-ui` `Tabs.Root` — `flex flex-col gap-2` layout.

| Prop | Type | Default |
|---|---|---|
| `ref` | bindable | `null` |
| `value` | `string` (bindable) | `""` |
| `class` | `string` | — |

Sub-components: `tabs-list.svelte` (flex row container), `tabs-trigger.svelte` (individual tab button), `tabs-content.svelte` (panel shown when tab is active).

---

### `textarea/textarea.svelte`
Native `<textarea>` with shared styling. `field-sizing-content` (auto-height), `min-h-16`, `rounded-md`.

| Prop | Type | Default |
|---|---|---|
| `ref` | bindable | `null` |
| `value` | `string` (bindable) | — |
| `class` | `string` | — |

`data-slot="textarea"`. Passes all native textarea attributes via `...restProps`.

---

### `toggle/toggle.svelte`
**Primitive:** `bits-ui` `Toggle.Root` — `tv()` styled, tracks `pressed` state.

| Prop | Values | Default |
|---|---|---|
| `variant` | `default` · `outline` | `default` |
| `size` | `default` (h-9) · `sm` (h-8) · `lg` (h-10) | `default` |
| `pressed` | `boolean` (bindable) | `false` |

`data-[state=on]` → `bg-accent text-accent-foreground`. Exports `toggleVariants` for use in `toggle-group-item.svelte`.

---

### `toggle-group/` (no root file — use `toggle-group-item.svelte`)
Group of mutually-exclusive or multi-select toggle buttons. Context provided by `toggle-group.svelte` (Svelte context module).

`toggle-group-item.svelte` — inherits `variant`, `size`, `spacing` from group context. `spacing=0` produces a connected pill strip (rounded only on first/last, no inner borders).

---

### `sidebar/` (composite system)
Full sidebar layout system with cookie-persisted open/closed state and keyboard shortcut.

| File | Role |
|---|---|
| `sidebar-provider.svelte` | Root context + `--sidebar-width` CSS vars + `Tooltip.Provider` wrapper; bindable `open`; persists state via cookie |
| `sidebar-inset.svelte` | Main content area beside sidebar |
| `sidebar-rail.svelte` | Narrow collapse/expand rail |
| `sidebar-trigger.svelte` | Button to toggle sidebar |
| `sidebar-footer.svelte` | Bottom section of sidebar |
| `sidebar-input.svelte` | Search/filter input inside sidebar |
| `sidebar-separator.svelte` | Divider between sidebar sections |
| `sidebar-group-action.svelte` | Action button on a sidebar group header |
| `sidebar-menu-button.svelte` | Individual menu item button |
| `sidebar-menu-action.svelte` | Secondary action on a menu item (e.g. "…" button) |
| `sidebar-menu-badge.svelte` | Badge count on a menu item |
| `sidebar-menu-skeleton.svelte` | Loading skeleton for menu items |

CSS vars: `--sidebar-width` (default from `constants.js`), `--sidebar-width-icon` (collapsed icon-only width).

---

### `form/` (sveltekit-superforms integration)
Form field primitives for use with `sveltekit-superforms` + `formsnap`.

| File | Role |
|---|---|
| `form-field.svelte` | `formsnap` `Field` wrapper — provides form context |
| `form-element-field.svelte` | `ElementField` for checkbox/radio arrays |
| `form-fieldset.svelte` | `Fieldset` for grouped fields |
| `form-label.svelte` | `Control`-aware label (auto-links to input id) |
| `form-legend.svelte` | Legend for fieldset |
| `form-description.svelte` | Helper text below input |
| `form-field-errors.svelte` | Validation error messages |
| `form-button.svelte` | Submit button with loading state |

---

## Business Components

All live in `control-panel/src/lib/components/stage/` or `cast/`.

### `stage/CharacterCard.svelte` + `CharacterCard.css`

**Root element:** `<article class="char-card card-base">`

| CSS class | What it does |
|---|---|
| `.char-card` | Layout shell. State variants: `.is-selected` (cyan), `.is-critical` (red). |
| `.hit-flash` | Overlay added by anime.js on damage |
| `.char-photo` | 80×80px avatar |
| `.char-name` | `font-display 1.75rem uppercase` |
| `.char-level` | Uses `.label-caps` + cyan border/bg |
| `.hp-cur` | `font-mono 2.25rem` — turns red when critical |
| `.hp-track` | 6px dark background bar |
| `.hp-fill` | Colored bar — gradient shifts with health state |
| `.char-controls` | 3-column grid: `[damage btn] [stepper] [heal btn]` |
| `.btn-damage` / `.btn-heal` | `.btn-base` + red/green accent overrides |
| `.conditions-row` | `flex-wrap` row of `ConditionPill` |
| `.pip` | Circular resource indicator (color-coded by type) |

**Component tree:**
```
CharacterCard
├── LevelPill         ← Pills.css
├── CardActions       ← Button
├── StatDisplay       ← tv() (inline variant)
├── Tooltip           ← bits-ui
└── ConditionPill[]   ← tv() (condition variant)
```

**Animations:** anime.js for `.hit-flash`, CSS transition for `.hp-fill` width.

---

### `stage/DiceRoller.svelte` + `DiceRoller.css`

**Root element:** `<div class="dice-panel card-base">`

| CSS class | What it does |
|---|---|
| `.dice-grid` | 2-column grid for dice buttons |
| `.dice-btn` | Individual die — grey border, black-card bg, purple hover |
| `.d20-btn` | Full-width d20 — purple accent |
| `.dice-icon` | Masked SVG icon |
| `.dice-label` | `font-mono 1.75rem` (2rem for d20) |
| `.roll-result` | Animated result card — cyan border-top, shadow-cyan |
| `.roll-number` | `font-mono 5rem` |
| `.is-crit` | Cyan glow on `.roll-result` |
| `.is-fail` | Red glow on `.roll-result` |
| `.modifier-stepper` | 80×60px (Stepper `size="lg"`) |

**Component tree:**
```
DiceRoller
├── Stepper (lg)     ← tv()
└── Button × 6       ← tv()
```

**Animations:** anime.js bounce/elastic on `.roll-result` appearance.

---

### `stage/CharacterCreationForm.svelte` + `CharacterCreationForm.css`

**Root element:** `<section class="character-create card-base">`

**Section layout (grid-area names inside `.create-fields`):**
```
photo → identity → stats → options → languages → equipment
```

| CSS class | Layout |
|---|---|
| `.identity-group` | 2-col grid: `[name] [player]` |
| `.stats-grid` | 3-col grid: `[hp] [ac] [vel]` |
| `.options-grid` | 2-col (3-col >1100px): class/subclass/level/background/feat/species/size/alignment |
| `.languages-grid` | 2-col: languages/rare/skills/tools/armor/weapons |
| `.equipment-grid` | `1fr 260px`: items + trinket |
| `.create-section` | Section wrapper — top border, vertical flex |
| `.create-field` | `flex-direction: column` label+input pair |
| `.form-input` | 44px min-height, black-elevated bg, focus pulse animation |
| `.create-submit` | Cyan border + bg, disabled: `opacity: 0.6` |
| `.create-feedback` | `.error` → red, `.success` → green |

**Breakpoints:**
- `<480px` → all grids collapse to 1 column
- `<720px` → languages/equipment collapse to 1 column
- `>1100px` → options-grid expands to 3 columns

**Component tree:**
```
CharacterCreationForm
├── Modal → PhotoSourcePicker  ← modal.css + PhotoSourcePicker.css
├── Input × 5                  ← tv() + form-input override
├── Label × 5                  ← tv()
├── MultiSelect × 7            ← MultiSelect.css
│   └── SelectionPillList      ← ConditionPill (tag)
└── Button (submit)            ← tv() + .create-submit override
```

---

### `stage/MultiSelect.svelte` + `MultiSelect.css`

**Root element:** `<div role="listbox" class="multiselect">`

| CSS class | What it does |
|---|---|
| `.multiselect` | Scrollable flex column, max-height ~4 rows |
| `.ms-option` | Flex row with space-between, grey text |
| `.ms-selected` | Cyan-dim bg, cyan text, checkmark (✓) visible |
| `.ms-focused` | Cyan outline (keyboard nav) |
| `.ms-empty` | Fallback text when `options=[]` |

Keyboard support: Arrow keys, Home/End, Enter/Space, type-to-jump.

---

### `stage/PhotoSourcePicker.svelte` + `PhotoSourcePicker.css`

Used inside `Modal`. Depends on `modal.css` for `.cp-modal-card` and `.photo-preview-inline`.

| Source mode | What shows |
|---|---|
| `preset` | Grid of preset avatar images |
| `url` | Text input for external URL |
| `local` | File upload / drag-drop zone |

---

### `cast/players/CharacterSheet.svelte`

**Root element:** `<div class="character-sheet">`
Full mobile-first character sheet. Tabs: Overview (ability scores, saves), Skills, Magic, Notes.

**Component tree:**
```
CharacterSheet
├── ResourceTracker[]   ← cast/players/ResourceTracker.svelte
└── ConditionPill[]     ← shared/condition-pill
```

---

### `cast/players/ResourceTracker.svelte`

Pool-based resource tracker for class features (Rage, Spell Slots, Second Wind, etc.).

| Prop | Type | Notes |
|---|---|---|
| `resources` | `ResourceSlot[]` | Array of pool resources from character record |

**`ResourceSlot` shape:**
```typescript
{ id, name, pool_max, pool_current, reset_on: 'long_rest' | 'short_rest' | 'turn' | 'dm' }
```

| CSS class | What it does |
|---|---|
| `.resource-tracker` | Container for all resource slots |
| `.resource-slot` | Individual resource row |
| `.pip` | Filled/empty pool indicator, color-coded by `reset_on` type |
| `.recharge-label` | Recharge type badge (Long / Short / Turn / DM) |

**Storybook:** `ResourceTracker.stories.svelte` — 4 variants: full rage, depleted slots, mixed, empty.

---

### `cast/dm/SessionCard.svelte` + `SessionCard.css`

**Root element:** `<article class="session-card">`
Compact version of `CharacterCard` used in the DM initiative tracker.

| CSS class | What it does |
|---|---|
| `.session-card` | Base card. State: `.is-active` (cyan glow), `.is-selected` (tint), `.is-critical` (red) |
| `.sc-photo` | 56×56px avatar |
| `.sc-name` | `font-display 1rem uppercase` |
| `.sc-hp-track` / `.sc-hp-fill` | 4px HP bar (same gradient as CharacterCard) |
| `.sc-hp-cur` | `font-mono 1rem` — red when critical |
| `.sc-condition-badge` | Red bg/border badge (larger than overlay version) |
| `.sc-pip` | 10×10px resource indicator, color-coded by type |

---

## Overlays

All routes under `(audience)/`. Served as OBS browser sources at 1920×1080.

**Main CSS file:** `control-panel/src/lib/components/overlays/overlays.css`

| Overlay route | Component | Key classes |
|---|---|---|
| `/persistent/hp` | `OverlayHP.svelte` | `.hp-bar-fill`, `.heal-flash`, `.is-{condition}` |
| `/persistent/conditions` | `OverlayConditions.svelte` | Condition state classes |
| `/moments/dice` | `OverlayDice.svelte` | Roll result animations |
| `/moments/player-down` | `OverlayPlayerDown.svelte` | — |
| `/moments/level-up` | `OverlayLevelUp.svelte` | — |
| `/persistent/turn-order` | `OverlayTurnOrder.svelte` | — |
| `/persistent/focus` | `OverlayCharacterFocus.svelte` | — |
| `/show/lower-third` | `OverlayLowerThird.svelte` | — |
| `/show/stats` | `OverlayStats.svelte` | — |
| `/show/recording-badge` | `OverlayRecordingBadge.svelte` | — |
| `/show/break` | `OverlayBreak.svelte` | — |

**DOM binding:** Overlays use `data-char-id` attributes. When `hp_updated` arrives, only the matching node is mutated — **never remove `data-char-id`**.

**Condition effect classes (from `overlays.css`):**

| Class | Effect |
|---|---|
| `.is-poisoned` | hue-rotate + shake |
| `.is-burning` | flicker filter |
| `.is-frozen` · `.is-paralyzed` · `.is-petrified` | static (no animation) |
| `.is-stunned` · `.is-cursed` · `.is-frightened` | filter combos |
| `.is-blinded` | opacity drop |
| `.is-invisible` | opacity near-zero |
| `.is-unconscious` | desaturate + dim |
| `.heal-flash` | brightness + saturation burst (800ms, JS-added) |

---

## Global CSS

**File:** `control-panel/src/app.css`

### Shared base classes

| Class | Used in | What it does |
|---|---|---|
| `.card-base` | CharacterCard, DiceRoller, CharacterCreationForm, Modal | Card shell: border, padding, box-shadow |
| `.btn-base` | CharacterCard (damage/heal), MultiSelect (trigger) | Button: transitions, cursor, sizing foundation |
| `.label-caps` | Everywhere labels need all-caps | `font-display 0.7rem uppercase grey` |
| `.mono-num` | HP numbers, stats | `font-mono tabular-nums` |
| `.sr-only` | Accessibility | Visually hidden, screen-reader only |

### App layout classes

```
.app-shell
├── .app-header (.brand-wordmark, .brand-block, .brand-script, .conn-dot, .header-menu)
├── .app-main
│   └── .app-sidebar (.sidebar-backdrop)
└── .bottom-nav
    └── .nav-tab (.nav-icon, .nav-label)   ← .active = red top-border
```

### State classes (BEM-style)

| Class | Meaning |
|---|---|
| `.is-critical` | HP ≤ 30% — red border/text |
| `.is-selected` | User-selected — cyan tint/border |
| `.is-active` | Currently active turn / session |
| `.is-synced` | Sync status indicator |

---

## Token Quick-Ref

Edit in `design/tokens.json` → run `bun run generate:tokens` → auto-writes `generated-tokens.css` and `public/tokens.css`.

**Never edit `generated-tokens.css` directly.**

### Colors

| Token | Value | Used for |
|---|---|---|
| `--black` | `#0a0a0a` | Page background |
| `--black-card` | `#111` | Card surfaces |
| `--black-elevated` | `#1a1a1a` | Elevated UI (modals, inputs) |
| `--grey` | `#888` | Labels, muted text |
| `--grey-dim` | `#333` | Borders, dividers |
| `--cyan` | `#00d4e8` | Primary accent |
| `--cyan-dim` | `rgba(0,212,232,0.12)` | Selected state bg |
| `--red` | `#e84040` | Danger, critical, conditions |
| `--red-dim` | `rgba(232,64,64,0.15)` | Damage btn bg |
| `--purple` | `#9b59b6` | d20 dice accent |
| `--purple-dim` | `rgba(155,89,182,0.15)` | Dice btn hover |
| `--hp-healthy` | `#4ade80` | HP bar > 60% |
| `--hp-injured` | `#facc15` | HP bar 30–60% |
| `--hp-critical` | `#ef4444` | HP bar ≤ 30% |

### Typography

| Token | Value |
|---|---|
| `--font-display` | Bebas Neue |
| `--font-script` | Dancing Script |
| `--font-mono` | JetBrains Mono |
| `--font-ui` | system-ui |

### Spacing (base: 4px)

`--space-1` = 4px · `--space-2` = 8px · `--space-3` = 12px · `--space-4` = 16px · `--space-6` = 24px · `--space-8` = 32px

### Radii

`--radius-sm` = 4px · `--radius-md` = 8px · `--radius-lg` = 12px · `--radius-pill` = 999px

### Shadows

`--shadow-card` · `--shadow-cyan` · `--shadow-red` · `--shadow-purple`

### Z-index layers (low → high)

`--z-sidebar-backdrop` → `--z-sidebar` → `--z-nav` → `--z-modal`

---

## File Map

```
control-panel/src/
├── app.css                          ← global classes + layout
├── generated-tokens.css             ← AUTO-GENERATED from design/tokens.json
├── overlays.css                     ← overlay condition effects
└── lib/components/
    ├── shared/                      ← headless primitives (bits-ui + tv() styled)
    │   ├── button/button.svelte
    │   ├── input/input.svelte
    │   ├── label/label.svelte
    │   ├── badge/badge.svelte
    │   ├── condition-pill/condition-pill.svelte
    │   ├── stat-display/stat-display.svelte
    │   ├── stepper/stepper.svelte
    │   ├── read-only-field/read-only-field.svelte
    │   ├── selection-pill-list/selection-pill-list.svelte
    │   ├── pills/LevelPill.svelte   ← Pills.css
    │   ├── pills/SelectionPills.svelte
    │   ├── modal/Modal.svelte       ← modal.css + card-base
    │   ├── accordion/               ← bits-ui Accordion
    │   ├── alert-dialog/            ← bits-ui AlertDialog
    │   ├── checkbox/checkbox.svelte ← bits-ui Checkbox
    │   ├── collapsible/             ← bits-ui Collapsible
    │   ├── dialog/                  ← bits-ui Dialog + Tailwind positioning
    │   ├── form/                    ← formsnap field primitives
    │   ├── radio-group/             ← bits-ui RadioGroup
    │   ├── scroll-area/             ← bits-ui ScrollArea
    │   ├── select/                  ← bits-ui Select
    │   ├── separator/separator.svelte ← bits-ui Separator
    │   ├── sheet/                   ← bits-ui Dialog as slide panel
    │   ├── sidebar/                 ← full sidebar system with cookie state
    │   ├── skeleton/skeleton.svelte ← animate-pulse placeholder
    │   ├── sonner/sonner.svelte     ← svelte-sonner Toaster
    │   ├── tabs/                    ← bits-ui Tabs
    │   ├── textarea/textarea.svelte ← native textarea, field-sizing-content
    │   ├── toggle/toggle.svelte     ← bits-ui Toggle (tv() variants)
    │   ├── toggle-group/            ← bits-ui ToggleGroup
    │   └── tooltip/                 ← bits-ui Tooltip
    ├── stage/                       ← control panel business components
    │   ├── CharacterCard.svelte     ← CharacterCard.css
    │   ├── DiceRoller.svelte        ← DiceRoller.css
    │   ├── CharacterCreationForm.svelte  ← CharacterCreationForm.css + Pills.css
    │   ├── MultiSelect.svelte       ← MultiSelect.css
    │   ├── PhotoSourcePicker.svelte ← PhotoSourcePicker.css + modal.css
    │   └── CardActions.svelte
    └── cast/
        ├── dm/
        │   ├── SessionCard.svelte   ← SessionCard.css
        │   ├── SessionBar.svelte    ← SessionBar.css
        │   └── InitiativeStrip.svelte ← InitiativeStrip.css
        └── players/
            ├── CharacterSheet.svelte
            └── ResourceTracker.svelte

design/tokens.json                   ← canonical token source (edit here)
```

---

## Common "Where Is That Style?" Answers

| Question | Answer |
|---|---|
| HP bar color | `.hp-fill` in `CharacterCard.css` + `--hp-healthy/injured/critical` tokens |
| Modal not centering | Check `dialog-content.svelte` Tailwind classes. Never add `position: relative` to `.cp-modal-card` |
| Button color variant | `buttonVariants` tv() in `button/button.svelte` |
| Card background / shadow | `.card-base` in `app.css` |
| Small uppercase label | `.label-caps` in `app.css` |
| Dice roll glow | `.is-crit` / `.is-fail` in `DiceRoller.css` |
| Condition effect animation | `.is-{condition}` in `overlays.css` |
| HP heal flash | `.heal-flash` in `overlays.css` (JS-added class) |
| Token variable | `design/tokens.json` → run `bun run generate:tokens` |
| New token not showing | Run `bun run generate:tokens` — never edit `generated-tokens.css` directly |
