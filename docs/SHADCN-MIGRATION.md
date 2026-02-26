# shadcn-svelte Migration Plan

**Date:** 2026-02-25 | **Project:** Dados & Risas Control Panel

---

## Executive Summary

shadcn-svelte provides unstyled, accessible headless components built on bits-ui primitives. The case for adopting it here is surgical: two specific patterns in this codebase have known, hard-to-fix accessibility gaps that shadcn-svelte solves out of the box — the modal focus trap and the multi-select listbox.

**The goal is not a full rewrite.** The existing design token system, dark aesthetic, and custom components are solid. shadcn-svelte should be introduced for the three component patterns where its headless primitives solve real problems, while the rest of the design system stays as-is.

**Prerequisites:** shadcn-svelte requires Tailwind CSS v4. This means adding Tailwind to the project, but it does not mean converting all existing CSS to Tailwind. The two systems can coexist — custom CSS stays in component `.css` files, Tailwind handles only shadcn component styling.

---

## Why shadcn-svelte Here

| Problem                 | Current implementation                                                                                     | shadcn-svelte solution                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Modal has no focus trap | `<dialog open>` without `showModal()` — keyboard escapes                                                   | `Dialog` component (bits-ui) has built-in focus trap, `Escape` key, aria-modal |
| Multi-select UX         | Custom `MultiSelect.svelte` — functional but no keyboard navigation (arrow keys, Home/End, type-to-filter) | `Combobox` or `Listbox` with full keyboard nav and ARIA                        |
| Disclosure / accordion  | `collapsed` state with manual height transitions                                                           | `Collapsible` with proper `aria-expanded` wiring                               |

**What stays custom:** CharacterCard, DiceRoller, HP bars, pip resources, CharacterBulkControls, PhotoSourcePicker. These are bespoke D&D mechanics with no off-the-shelf equivalent.

---

## Token Mapping

shadcn-svelte uses semantic CSS custom properties in oklch/hsl. The project's existing tokens map cleanly:

```css
/* In app.css — add these shadcn semantic aliases alongside existing tokens */
:root {
  /* shadcn/ui semantic names (required by its components) */
  --background: var(--black); /* #0A0A0A */
  --foreground: var(--white); /* #F0F0F0 */
  --card: var(--black-card); /* #111111 */
  --card-foreground: var(--white);
  --popover: var(--black-elevated); /* #1A1A1A */
  --popover-foreground: var(--white);
  --primary: var(--cyan); /* #00D4E8 */
  --primary-foreground: var(--black);
  --secondary: var(--black-elevated);
  --secondary-foreground: var(--grey);
  --muted: var(--black-elevated);
  --muted-foreground: var(--grey);
  --accent: var(--purple);
  --accent-foreground: var(--white);
  --destructive: var(--red); /* #FF4D6A */
  --destructive-foreground: var(--white);
  --border: var(--grey-dim);
  --input: var(--black-elevated);
  --ring: var(--cyan); /* focus ring = cyan */
  --radius: var(--radius-md); /* 8px */
}
```

This means shadcn components will inherit the existing brand colors automatically. **No theme file separate from `app.css` is needed.**

---

## Phase 1 — Install Tailwind + shadcn-svelte

### Step 1.1 — Add Tailwind CSS v4

```bash
# In control-panel/
npm install tailwindcss @tailwindcss/vite
```

Add to `vite.config.js`:

```js
import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [tailwindcss(), sveltekit()],
};
```

Add to `src/app.css` (top of file, before existing `:root`):

```css
@import "tailwindcss";
```

### Step 1.2 — Initialize shadcn-svelte

```bash
npx shadcn-svelte@latest init
```

Accept defaults:

- Style: **Default** (you will override with your own theme anyway)
- Base color: **Neutral** (overridden by your token mapping)
- CSS variables: **Yes**

This creates `src/lib/components/ui/` for generated component files.

### Step 1.3 — Add the semantic token aliases

Add the token mapping from §Token Mapping above to the `:root` block in `src/app.css`.

**Verify Tailwind and shadcn work:**

```bash
npx shadcn-svelte@latest add button
# Import the generated Button and use it in a test route
```

---

## Phase 2 — Component Replacement (Priority Order)

### P1 — Dialog (replaces Modal.svelte)

**Why first:** The missing focus trap is a P1 accessibility issue and a regression risk. It's also the simplest replacement — Dialog has a nearly identical API to the current Modal.

```bash
npx shadcn-svelte@latest add dialog
```

**Current usage in `CharacterManagement.svelte`:**

```svelte
{#if showModal}
  <div class="modal-backdrop" onclick={closeModal}>
    <div class="modal-panel">
      <!-- content -->
    </div>
  </div>
{/if}
```

**Replacement:**

```svelte
<script>
  import { Dialog } from "$lib/components/ui/dialog";
  let open = $state(false);
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <!-- content — focus trap and Escape key are automatic -->
  </Dialog.Content>
</Dialog.Root>
```

**Styling:** shadcn's Dialog backdrop and panel will be overridden with your existing `.modal-backdrop` and `.modal-panel` CSS. Add `class="modal-panel"` to `<Dialog.Content>` and the existing CSS takes over.

**Expected effort:** 1–2 hours.

---

### P2 — Combobox / Listbox (enhances MultiSelect.svelte)

**Why second:** `MultiSelect.svelte` works visually but lacks full keyboard navigation. The bits-ui `Listbox` primitive adds arrow-key navigation, Home/End, type-to-jump, and proper `aria-selected` / `aria-multiselectable` attributes.

```bash
npx shadcn-svelte@latest add combobox
```

**Approach:** Rather than replacing the entire `MultiSelect.svelte`, wrap the bits-ui `Listbox.Root` inside the existing component to get accessible keyboard behavior while keeping your visual design (`.ms-option`, `.ms-selected`, `.ms-check` classes).

```svelte
<script>
  import { Listbox } from "bits-ui";
</script>

<Listbox.Root type="multiple" bind:value={selected}>
  <Listbox.Content class="multiselect">
    {#each options as option}
      <Listbox.Item value={option.value} class="ms-option">
        <span class="ms-label">{option.label}</span>
        <Listbox.ItemIndicator>
          <span class="ms-check">✓</span>
        </Listbox.ItemIndicator>
      </Listbox.Item>
    {/each}
  </Listbox.Content>
</Listbox.Root>
```

All existing `.multiselect`, `.ms-option`, etc. CSS stays unchanged. The bits-ui primitives add the ARIA attributes and keyboard handling underneath.

**Expected effort:** 2–3 hours.

---

### P3 — Collapsible (replaces manual collapse in CharacterCard)

**Why third:** Lower urgency — the existing collapse works and is accessible (button with aria-expanded). The bits-ui `Collapsible` adds `aria-controls` wiring and smoother height animation via `data-state` attributes.

```bash
npx shadcn-svelte@latest add collapsible
```

**Change:** Replace the manual `collapsed` boolean + height animation with:

```svelte
<Collapsible.Root bind:open={!collapsed}>
  <Collapsible.Trigger class="collapse-toggle" aria-label="...">
    <!-- icon -->
  </Collapsible.Trigger>
  <Collapsible.Content class="char-body">
    <!-- collapsible card body -->
  </Collapsible.Content>
</Collapsible.Root>
```

CSS: Add `[data-state="closed"] { display: none; }` or keep the existing height transition using `data-state="open/closed"` for CSS targeting.

This also fixes the `.collapsed` vs `.is-collapsed` naming issue — state is managed by `data-state` attribute now.

**Expected effort:** 1–2 hours.

---

## Phase 3 — Optional Enhancements

These are lower-priority additions that improve the management UX:

### Tooltip (for condition pills + stat abbreviations)

```bash
npx shadcn-svelte@latest add tooltip
```

Add tooltips to condition pill abbreviations (STUN → "Stunned"), AC stat (what it stands for), and the drag handle. Minimal effort, high clarity gain.

### Alert / AlertDialog (for destructive actions)

```bash
npx shadcn-svelte@latest add alert-dialog
```

Replace the delete confirmation in `CharacterManagement` — currently no confirmation exists. An AlertDialog with "Eliminar personaje — ¿estás seguro?" would prevent accidental deletion.

### Command palette (for bulk character search)

```bash
npx shadcn-svelte@latest add command
```

When 10+ characters are active, a keyboard-searchable command palette for quickly selecting characters to bulk-operate on would be a power-user feature.

---

## What NOT to Migrate

These components should **not** be replaced with shadcn equivalents:

| Component                 | Reason to keep custom                                              |
| ------------------------- | ------------------------------------------------------------------ |
| CharacterCard             | Bespoke D&D mechanics, HP states, pip system — no equivalent       |
| DiceRoller                | Custom dice icon layout, elastic animation, d20 featured treatment |
| CharacterBulkControls     | Domain-specific bulk action toolbar                                |
| PhotoSourcePicker         | Multi-source avatar picker — no close shadcn equivalent            |
| HP bar + pips             | Pure game mechanics, custom visual language                        |
| Bottom navigation         | Custom brand nav with specific tab behavior                        |
| `.card-base`, `.btn-base` | Core design system primitives — keep as CSS                        |

---

## Risk Assessment

| Risk                                           | Likelihood | Mitigation                                                                           |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| Tailwind purge removes existing CSS            | Low        | Tailwind v4 doesn't touch non-Tailwind CSS; scoped component CSS is safe             |
| shadcn default styles conflict with dark theme | Medium     | shadcn components are minimally styled; semantic tokens in app.css override defaults |
| Bundle size increase                           | Low        | shadcn components are tree-shaken; bits-ui is lightweight                            |
| Breaking the existing visual design            | Low        | Migration is additive — old components stay until new ones are verified              |

---

## Rollout Checklist

```
Phase 1
[ ] npm install tailwindcss @tailwindcss/vite
[ ] Add Tailwind plugin to vite.config.js
[ ] Add @import "tailwindcss" to app.css
[ ] Add semantic token aliases to :root in app.css
[ ] npx shadcn-svelte@latest init
[ ] Verify: existing components render correctly with Tailwind active

Phase 2a — Dialog
[ ] npx shadcn-svelte@latest add dialog
[ ] Replace Modal.svelte usage in CharacterManagement.svelte
[ ] Test: focus trap (Tab stays inside modal)
[ ] Test: Escape key closes modal
[ ] Test: backdrop click closes modal

Phase 2b — Listbox (MultiSelect upgrade)
[ ] npm install bits-ui (if not already installed by shadcn)
[ ] Wrap Listbox.Root inside MultiSelect.svelte
[ ] Test: arrow key navigation through options
[ ] Test: Space/Enter to toggle selection
[ ] Test: aria-multiselectable announced by screen reader

Phase 2c — Collapsible (optional)
[ ] npx shadcn-svelte@latest add collapsible
[ ] Replace manual collapse in CharacterCard.svelte
[ ] Test: aria-expanded updates on toggle
[ ] Test: animation still works

Phase 3 — Optional
[ ] Tooltip for condition pills
[ ] AlertDialog for character deletion confirmation
```

---

## Token Conflict Resolution

If shadcn-svelte's generated CSS variables conflict with existing tokens, the fix is simple: shadcn reads from the semantic aliases (`--primary`, `--destructive`, etc.) that point back to your existing tokens. If any shadcn component renders in unexpected colors, check which semantic token it references and update the alias in `app.css`.

The existing tokens (`--red`, `--cyan`, `--purple`, `--black-card`, etc.) are **never touched or renamed**.

---

_Migration plan prepared 2026-02-25_

---

## Storybook Integration & Component Documentation

To validate the migration and make components discoverable for designers and engineers, add a small Storybook catalog that documents each migrated component and the high-value custom components that must remain bespoke.

Goals:

- Provide interactive examples for Dialog, Listbox (MultiSelect), and Collapsible after migration.
- Document visual tokens, aria behaviors, and the classes that must be preserved to retain brand styling (e.g. `.card-base`, `.btn-base`, `.condition-pill`).
- Include usage notes showing how to wrap shadcn primitives with existing CSS classes so visual parity is preserved.

Quick checklist (Storybook setup)

1. In `control-panel/`, add Storybook if missing: `npx storybook@latest init` (select Svelte).
2. Install the shadcn Storybook addon if useful: `npm install @storybook/addon-mcp` (optional — used in this repo tooling).
3. Create `control-panel/.storybook/main.js` with Svelte support and include `src/lib/components` in stories glob.
4. Add a `stories` folder: `control-panel/src/lib/stories/` for component stories.

Story templates (examples)

- Dialog (Modal replacement) — `Dialog.stories.svelte`
  - Story should show: open/close, focus-trap verification (tab order), and a variant with `class="modal-panel"` so existing CSS applies.

- MultiSelect (Listbox wrapper) — `MultiSelect.stories.svelte`
  - Show keyboard nav, multi-selection and how `.ms-option` / `.ms-check` classes map onto shadcn markup.

- CharacterCard (design doc only) — `CharacterCard.stories.svelte`
  - Because `CharacterCard` is bespoke, create a Story that exposes props (hp_current, hp_max, conditions, isSelected, isCollapsed) so designers can iterate without running the whole app.

Storybook doc block examples (short)

1. `Dialog.stories.svelte` — usage:

```svelte
<script>
  import { Dialog } from '$lib/components/ui/dialog';
  let open = false;
</script>

<Story name="Modal (branded)" args={{open}}>
  <Dialog.Root bind:open>
    <Dialog.Trigger class="btn-base">Open modal</Dialog.Trigger>
    <Dialog.Content class="modal-panel">
      <h3 class="label-caps">Title</h3>
      <p>Body copy</p>
    </Dialog.Content>
  </Dialog.Root>
</Story>
```

2. `MultiSelect.stories.svelte` — show how to keep `.ms-option` classes while sourcing keyboard behavior from `Listbox`.

Documentation notes to include in each story file:

- Tokens referenced (e.g. `--cyan`, `--red`, `--black-card`) and the equivalent `--primary` / `--destructive` shadcn semantic mapping.
- Accessibility checklist: focus-visible, aria-expanded / aria-controls, aria-multiselectable, Escape to close.
- CSS preservation note: include `class` attribute on shadcn primitives (e.g. `<Listbox.Content class="multiselect">`) to use existing CSS selectors.

Deliverable: add `control-panel/src/lib/stories/` with at least three seed stories (Dialog, MultiSelect, CharacterCard) and a `README` summarizing migration patterns for story authors.

---

If you want, I can now:

- scaffold the Storybook config and the three seed stories, or
- implement the `Dialog` migration first (highest-impact P1 accessibility fix).

---

## Storybook Coverage — Current Snapshot

I scanned the `control-panel` stories and components and generated the following coverage list. Use this as the canonical "storybook-read" checklist for future migrations and docs work.

- Components with Storybook stories (present):
  - `CharacterCard` — [control-panel/src/lib/CharacterCard.stories.svelte]
  - `DiceRoller` — [control-panel/src/lib/DiceRoller.stories.svelte]
  - `DashboardCard` — [control-panel/src/lib/DashboardCard.stories.svelte]
  - `MultiSelect` — [control-panel/src/lib/MultiSelect.stories.svelte]
  - `Stepper` — [control-panel/src/lib/components/ui/stepper/Stepper.stories.svelte]
  - `StatDisplay` — [control-panel/src/lib/components/ui/stat-display/StatDisplay.stories.svelte]
  - `SelectionPillList` — [control-panel/src/lib/components/ui/selection-pill-list/SelectionPillList.stories.svelte]
  - `ReadOnlyField` — [control-panel/src/lib/components/ui/read-only-field/ReadOnlyField.stories.svelte]
  - `LevelPill` — [control-panel/src/lib/components/ui/pills/LevelPill.stories.svelte]
  - `ConditionPill` — [control-panel/src/lib/components/ui/condition-pill/ConditionPill.stories.svelte]
  - `Button` — [control-panel/src/lib/components/ui/button/Button.stories.svelte]
  - `Badge` — [control-panel/src/lib/components/ui/badge/Badge.stories.svelte]
  - `Page`, `Header` — [control-panel/src/stories]

- Components missing stories / docs (recommended to add):
  - `Dialog` (Dialog.stories.svelte added in `components/ui/dialog`) — now present
  - `AlertDialog` / delete-confirm — no direct story found (add AlertDialog story)
  - `Modal` legacy wrapper — file no longer present; ensure any remaining consumers use `Dialog`
  - `PhotoSourcePicker` — no dedicated story (add to allow visual QA of photo picker flows)
  - `CharacterBulkControls` — no dedicated story (useful for multi-select/bulk actions)

Notes:

- I added `Dialog.stories.svelte` at `control-panel/src/lib/components/ui/dialog/Dialog.stories.svelte` to cover the P1 Dialog case and demonstrate using `.modal-panel` + `card-base` classes.
- Next recommended stories to add: `AlertDialog`, `PhotoSourcePicker`, `CharacterBulkControls`. I can scaffold these now if you want.
