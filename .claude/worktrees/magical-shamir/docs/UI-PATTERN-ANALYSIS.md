# UI Pattern Analysis — Migration Candidates for shadcn-svelte

**Date:** 2026-02-25 | **Project:** Dados & Risas Control Panel  
**Purpose:** Identify repeating UI patterns that could reduce code duplication and improve accessibility through shadcn-svelte component adoption.

---

## Executive Summary

Current codebase uses:

- **Base design tokens** in `src/app.css` (brand colors, spacing, typography)
- **Custom component CSS** for individual features (CharacterCard, DiceRoller, etc.)
- **bits-ui primitives** already in use (Dialog, Tooltip)
- **Tailwind CSS v4** already installed (via `@tailwindcss/vite`)

**Finding:** ~7 major UI patterns repeat across 5+ components. These are candidates for shadcn-svelte, which would:

- Reduce CSS duplication
- Add missing ARIA attributes and keyboard navigation
- Maintain your existing dark aesthetic (no breaking changes)
- Coexist with custom CSS (no forced conversion required)

**Recommendation:** Proceed with Phase 1 (install shadcn-svelte) + Phase 2 (P1–P2 migrations). This is a **surgical lift**, not a full redesign.

---

## Pattern 1: Button Variants (HIGH PRIORITY)

**Current Usage:** Repeats across ~8 components

| Component               | Button Class                                | Pattern                     | Instances  |
| ----------------------- | ------------------------------------------- | --------------------------- | ---------- |
| `CharacterCard`         | `.btn-damage`, `.btn-heal`, `.btn-rest`     | Base + color variant + size | 4 buttons  |
| `DiceRoller`            | `.dice-btn` (d4–d20)                        | Base + purple accent        | 6 buttons  |
| `CharacterBulkControls` | `.bulk-action` → damage/heal/rest           | Base + color variant        | 4 buttons  |
| `CharacterCreationForm` | `.create-submit`                            | Base + cyan primary         | 1 button   |
| `CharacterManagement`   | `.manage-edit-toggle`, `.manage-delete-btn` | Base + grey variant         | 2 buttons  |
| `PhotoSourcePicker`     | `.photo-clear-btn`                          | Base + grey variant         | 3 buttons  |
| Routes (control/manage) | Navigation buttons                          | Base + nav styling          | 6+ buttons |

**Duplication:** All buttons follow the same pattern:

```css
/* Repeated pattern across all button types */
.btn-* {
  border: 1px solid var(--color);
  color: var(--color);
  background: transparent;
  padding: var(--space-2) var(--space-3);
  min-height: 40px;
  border-radius: var(--radius-md);
  transition: all var(--t-fast);
}

.btn-*:hover {
  background: var(--color-dim);
  border-color: var(--color);
}

.btn-*:focused-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}

.btn-*:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

**shadcn-svelte Candidate:** `Button` component with variants

```svelte
<Button variant="destructive" size="md" disabled={isLoading}>
  − DAÑO
</Button>

<Button variant="ghost" size="sm">
  ✓ Confirm
</Button>
```

**Benefit:**

- ✅ Single source of truth for button styling
- ✅ Built-in `disabled` prop handling
- ✅ Avoids class utility sprawl
- ✅ Consistent focus states across all buttons
- ✅ Your dark theme and token colors automatically applied

---

## Pattern 2: Form Fields (HIGH PRIORITY)

**Current Usage:** 6 components repeat form field layout

| Component               | Field Type      | Pattern                    | Count     |
| ----------------------- | --------------- | -------------------------- | --------- |
| `CharacterCreationForm` | Text, Number    | Label + Input + Validation | 8 fields  |
| `CharacterManagement`   | Text, Number    | Label + Input + Edit mode  | 6 fields  |
| `PhotoSourcePicker`     | Text (readonly) | Label + Input + Clear btn  | 3 fields  |
| `DiceRoller`            | Number, Select  | Label + Input + Stepper    | 2 fields  |
| Control routes          | Text            | Search/filter inputs       | 2+ fields |
| Bulk controls           | Number          | Amount selector            | 1 field   |

**Duplication:** Identical layout repeated in CSS:

```css
/* CharacterCreationForm.css */
.create-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.create-field input {
  min-height: 44px;
  border: 1px solid var(--grey-dim);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3);
  background: var(--black-elevated);
  color: var(--white);
}

.create-field input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 1px var(--cyan-dim);
}

/* Nearly identical in CharacterManagement.css, PhotoSourcePicker.css, DiceRoller.css */
```

**Validation Message Pattern:** Repeated in multiple places:

```svelte
{#if errorMessage}
  <p class="create-feedback error">{errorMessage}</p>
{/if}
```

**shadcn-svelte Candidates:** `Form` + `Input` + `Label`

```svelte
<script>
  import { Form, Input, Label } from "$lib/components/ui";
</script>

<Form.Field>
  <Label for="char-name">Nombre</Label>
  <Input
    id="char-name"
    type="text"
    bind:value={name}
    error={nameError}
  />
  {#if nameError}
    <Form.ErrorMessage>{nameError}</Form.ErrorMessage>
  {/if}
</Form.Field>
```

**Benefit:**

- ✅ Eliminates 200+ lines of `.css` duplication (same 5–7 rules in 6 files)
- ✅ Consistent label-input-error message layout
- ✅ Automatic `aria-describedby` linking for error messages
- ✅ Built-in required field indicator styling
- ✅ Your dark colors automatically applied

---

## Pattern 3: Modal/Dialog with Focus Trap (HIGH PRIORITY)

**Current Usage:** 3 components

| Component                      | Use Case            | Current Implementation  | Issue                               |
| ------------------------------ | ------------------- | ----------------------- | ----------------------------------- |
| `CharacterCreationForm`        | Photo picker modal  | `Modal.svelte`          | No focus trap; Tab escapes modal    |
| `PhotoSourcePicker`            | Photo modal overlay | `Modal.svelte`          | No focus trap; Escape doesn't close |
| `CharacterManagement` (future) | Delete confirmation | Manual `div` + backdrop | No modal semantics                  |

**Current Code Pattern (Modal.svelte):**

```svelte
<script>
  import * as Dialog from "./components/ui/dialog/index.js";
</script>

<Dialog.Root bind:open={showPhotoModal}>
  <Dialog.Trigger>Agregar foto</Dialog.Trigger>
  <Dialog.Content class="modal-panel">
    <!-- content -->
  </Dialog.Content>
</Dialog.Root>
```

**shadcn-svelte Candidate:** Already partially using bits-ui `Dialog` (in your imports). The `shadcn-svelte` wrapper adds:

- ✅ Focus trap: Tab stays within modal
- ✅ Escape key: Closes modal automatically
- ✅ `aria-modal="true"` + `aria-label` wiring
- ✅ Click-outside-to-close (optional)
- ✅ Smooth transitions via `data-state` attributes

**Action needed:** Ensure all modal usages in `CharacterCreationForm` and `PhotoSourcePicker` are using the proper `Dialog` wrapper and calling `.showModal()` instead of just setting `open = true`.

---

## Pattern 4: Multi-Select / Listbox (MEDIUM PRIORITY)

**Current Usage:** 2 components

| Component                  | Use Case                       | Pattern                     | Issue                                         |
| -------------------------- | ------------------------------ | --------------------------- | --------------------------------------------- |
| `CharacterCreationForm`    | Languages, Skills, Tools, etc. | Custom `MultiSelect.svelte` | No keyboard nav; `aria-activedescendant` only |
| `PhotoSourcePicker` (tabs) | Photo source selection         | Manual button group         | No `role="tablist"` or `aria-selected`        |

**Current Implementation (MultiSelect.svelte):**

```svelte
<!-- Has keyboard support but limited ARIA -->
<div
  class="ms-listbox"
  role="listbox"
  aria-multiselectable="true"
  aria-activedescendant={focusedIndex >= 0 ? optionId(focusedIndex) : ""}
>
  {#each options as option, i}
    <button
      class="ms-option"
      role="option"
      aria-selected={selected.includes(option.key)}
      onclick={() => toggle(option.key)}
    >
      {#if selected.includes(option.key)}
        <span class="ms-check">✓</span>
      {/if}
      {option.label}
    </button>
  {/each}
</div>
```

**shadcn-svelte Candidate:** `Listbox` from bits-ui (via shadcn)

```svelte
<script>
  import { Listbox } from "$lib/components/ui/listbox";
</script>

<Listbox.Root multiple bind:value={selectedSkills}>
  <Listbox.Content>
    {#each skillOptions as skill}
      <Listbox.Item value={skill.key} class="ms-option">
        <span>{skill.label}</span>
        <Listbox.ItemIndicator>✓</Listbox.ItemIndicator>
      </Listbox.Item>
    {/each}
  </Listbox.Content>
</Listbox.Root>
```

**Benefit:**

- ✅ Full keyboard navigation (arrows, Home/End, type-to-jump)
- ✅ Proper `aria-selected`, `aria-disabled` wiring
- ✅ Screen reader announces "X of Y items selected"
- ✅ Keeps your `.ms-option` and `.ms-check` CSS unchanged
- ✅ Improves mobile accessibility with touch-friendly focus management

---

## Pattern 5: Collapsible Sections (MEDIUM PRIORITY)

**Current Usage:** 1 component template reused

| Component       | Use Case                          | Current Implementation                                   | Issue                                            |
| --------------- | --------------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| `CharacterCard` | Expand/collapse stats & resources | Manual `collapsed` boolean + `anime.js` height animation | `aria-expanded` only; no `aria-controls` linking |

**Current Pattern (CharacterCard.svelte):**

```svelte
<script>
  let isCollapsed = $state(false);

  $effect(() => {
    // Manual anime.js height animation
    animate(charBodyEl, { height: isCollapsed ? 0 : targetHeight, ... });
  });
</script>

<button
  class="collapse-toggle"
  onclick={() => (isCollapsed = !isCollapsed)}
  aria-expanded={!isCollapsed}
>
  ▾
</button>

<div bind:this={charBodyEl} class="char-body">
  <!-- Content -->
</div>
```

**shadcn-svelte Candidate:** `Collapsible` from bits-ui (via shadcn)

```svelte
<script>
  import { Collapsible } from "$lib/components/ui/collapsible";
</script>

<Collapsible.Root bind:open={isExpanded}>
  <Collapsible.Trigger class="collapse-toggle">
    ▾ <span class="sr-only">{isExpanded ? "Colapsar" : "Expandir"}</span>
  </Collapsible.Trigger>

  <Collapsible.Content class="char-body">
    <!-- Content — automatic aria-labelledby + aria-controls wiring -->
  </Collapsible.Content>
</Collapsible.Root>
```

**Benefit:**

- ✅ Automatic `aria-controls` linking (content ID ↔ button)
- ✅ Built-in CSS custom properties for animate (`:data-state="open"` / `closed`)
- ✅ Removes anime.js dependency for this one use case
- ✅ Your height animation CSS stays in `.char-card.css`

---

## Pattern 6: Condition Pills / Badges (LOW–MEDIUM PRIORITY)

**Current Usage:** 2+ components

| Component                | Pattern         | Current CSS                      | Issues                            |
| ------------------------ | --------------- | -------------------------------- | --------------------------------- |
| `CharacterCard`          | Condition pills | `.condition-pill` (button style) | Visual only; no component reuse   |
| `LevelPill`              | Level display   | `.level-pill` (span style)       | Hardcoded styles; not a component |
| `DashboardCard` (future) | Status badges   | Would need custom CSS            | Duplicates pill patterns          |

**Current Implementation:**

```svelte
<!-- CharacterCard -->
{#each character.conditions as condition}
  <button
    class="condition-pill"
    onclick={() => removeCondition(condition.id)}
  >
    {condition.condition_name} ×
  </button>
{/each}

<!-- Would repeat for other badge-like displays -->
```

**shadcn-svelte Candidate:** `Badge` component

```svelte
<script>
  import { Badge } from "$lib/components/ui/badge";
</script>

{#each character.conditions as condition}
  <Badge
    variant="secondary"
    class="condition-pill"
    onclick={() => removeCondition(condition.id)}
  >
    {condition.condition_name} <span class="ml-1">×</span>
  </Badge>
{/each}
```

**Benefit:**

- ✅ Semantic pill component with consistent padding/radius
- ✅ Pre-built variants (default, secondary, destructive, outline)
- ✅ Reusable for future status/category displays
- ✅ Keeps your `.condition-pill` color overrides via CSS

---

## Pattern 7: Card / Panel Wrapper (LOW PRIORITY)

**Current Usage:** 5+ components

| Component               | Class                              | Current CSS              | Note                      |
| ----------------------- | ---------------------------------- | ------------------------ | ------------------------- |
| `CharacterCard`         | `.card-base`                       | Base card styling        | Solid, reused effectively |
| `DashboardCard`         | Extends `.card-base`               | Base + dashboard variant | Minimal duplication       |
| `CharacterCreationForm` | `.character-create` → `.card-base` | Works well               | No change needed          |

**Assessment:** This pattern is already well-abstracted via `.card-base` in `app.css`. shadcn-svelte `Card` component would add:

- Semantic `<article>` or `<section>` wrapping
- Built-in `Card.Header`, `Card.Content`, `Card.Footer` slots

**Recommendation:** Low priority. Current `.card-base` + custom layouts are working well. Migrate only if refactoring CardCharacter or DashboardCard for other reasons.

---

## Pattern 8: Input Steppers (LOW PRIORITY)

**Current Usage:** 2 components

| Component       | Use Case                      | Current Implementation                  |
| --------------- | ----------------------------- | --------------------------------------- |
| `DiceRoller`    | Modifier stepper (−20 to +20) | Manual `+` / `−` buttons + number input |
| `CharacterCard` | HP amount stepper (1–999)     | Manual `+` / `−` buttons + number input |

**Current Pattern:**

```svelte
<!-- DiceRoller -->
<button onclick={() => decrementModifier()}>−</button>
<input type="number" bind:value={modifier} />
<button onclick={() => incrementModifier()}>+</button>

<!-- CharacterCard (similar) -->
<button onclick={() => (amount = Math.max(1, amount - 1))}>−</button>
<input type="number" bind:value={amount} min="1" max="999" />
<button onclick={() => (amount = Math.min(999, amount + 1))}>+</button>
```

**CSS (CharacterCard.css):**

```css
.stepper {
  display: flex;
  align-items: center;
  border: 1px solid var(--grey-dim);
  border-radius: var(--radius-md);
}

.stepper button {
  flex: 0 0 40px;
  height: 40px;
}

.amount-input {
  flex: 1;
  text-align: center;
  border: none;
  background: transparent;
}
```

**shadcn-svelte Candidate:** `Input` component with custom stepper wrapper

```svelte
<script>
  import { Input } from "$lib/components/ui/input";
</script>

<div class="stepper">
  <button onclick={decrement}>−</button>
  <Input type="number" bind:value={amount} class="amount-input" />
  <button onclick={increment}>+</button>
</div>
```

**Recommendation:** Low priority. These are working well currently. shadcn has a `NumberInput` in the docs but it's not a core component. Keep current implementation.

---

## Pattern 9: Select / Dropdown (LOW PRIORITY)

**Current Usage:** 2 components

| Component           | Use Case           | Current Implementation                   |
| ------------------- | ------------------ | ---------------------------------------- |
| `DiceRoller`        | Character selector | Native `<select>` with `.selector` class |
| `PhotoSourcePicker` | Photo source tabs  | Manual button group (acts like select)   |

**Current CSS Pattern:**

```css
.selector {
  min-height: 44px;
  border: 1px solid var(--grey-dim);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3);
  background-color: var(--black-elevated);
  background-image: url("...chevron...");
  color: var(--white);
}

.selector:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 1px var(--cyan-dim);
}
```

**shadcn-svelte Candidate:** `Select` component (if PhotoSourcePicker tabs become a proper select)

```svelte
<script>
  import { Select } from "$lib/components/ui/select";
</script>

<Select.Root {value} onValueChange={handleChange}>
  <Select.Trigger class="selector">
    <Select.Value placeholder="Choose character..." />
  </Select.Trigger>
  <Select.Content>
    {#each characters as char}
      <Select.Item value={char.id}>{char.name}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
```

**Recommendation:** Low priority. Native `<select>` is fine for DiceRoller. PhotoSourcePicker tab buttons are intentionally styled differently (not a hidden select). No change needed.

---

## Implementation Timeline

### Phase 0: Setup (Already Complete ✅)

- ✅ Tailwind CSS v4 installed
- ✅ `@tailwindcss/vite` in `vite.config.js`
- ✅ bits-ui in `package.json`
- ✅ Token mapping exists in SHADCN-MIGRATION.md

### Phase 1: Install shadcn-svelte Components (2–3 hours)

```bash
cd control-panel

# Add semantic token aliases to src/app.css (copy from SHADCN-MIGRATION.md)

# Initialize shadcn-svelte
npx shadcn-svelte@latest init

# Add core components
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add input
npx shadcn-svelte@latest add label
npx shadcn-svelte@latest add form
npx shadcn-svelte@latest add dialog
npx shadcn-svelte@latest add listbox
npx shadcn-svelte@latest add collapsible
npx shadcn-svelte@latest add badge
```

### Phase 2a: Priority 1 Migrations (6–8 hours total)

1. **Button Component** (2 hrs)
   - Create wrapper or extend shadcn `Button`
   - Replace `.btn-base` + color variants in 8 files
   - Update CharacterCard, DiceRoller, CharacterBulkControls, etc.

2. **Form Fields** (3 hrs)
   - Create `FormField.svelte` wrapper combining `Form`, `Label`, `Input`
   - Replace field patterns in CharacterCreationForm, CharacterManagement, PhotoSourcePicker
   - Remove 200+ lines of duplicated `.css`

3. **Modal/Dialog** (2 hrs)
   - Verify CharacterCreationForm using proper `Dialog.Root` + `.showModal()`
   - Verify PhotoSourcePicker focus trap works
   - Test keyboard navigation (Tab, Escape)

### Phase 2b: Priority 2 Migrations (4–6 hours)

4. **MultiSelect/Listbox** (2–3 hrs)
   - Wrap bits-ui `Listbox.Root` inside existing `MultiSelect.svelte`
   - Add keyboard nav (arrows, Home/End, type-to-jump)
   - Keep your `.ms-option`, `.ms-check` CSS unchanged

5. **Collapsible** (1–2 hrs)
   - Replace manual `collapsed` state + anime.js in CharacterCard
   - Use `Collapsible.Root` + `aria-controls` wiring
   - Keep height animation CSS

---

## Migration Checklist

- [ ] Add token mapping to `src/app.css`
- [ ] Run `npx shadcn-svelte@latest init`
- [ ] Install core components (button, input, label, form, dialog, listbox, collapsible, badge)
- [ ] Create `src/lib/components/shadcn/Button.svelte` wrapper (if needed for custom variants)
- [ ] Create `src/lib/components/shadcn/FormField.svelte` wrapper
- [ ] Migrate CharacterCard buttons → `Button` component
- [ ] Migrate DiceRoller buttons → `Button` component
- [ ] Migrate CharacterBulkControls buttons → `Button` component
- [ ] Migrate CharacterCreationForm fields → `FormField` component
- [ ] Migrate CharacterManagement fields → `FormField` component
- [ ] Verify Modal/Dialog focus trap in CharacterCreationForm
- [ ] Verify Modal/Dialog focus trap in PhotoSourcePicker
- [ ] Enhance MultiSelect with Listbox primitives
- [ ] Update CharacterCard collapse with Collapsible primitive
- [ ] Remove duplicated CSS from `.css` files
- [ ] Test accessibility: keyboard nav, screen readers, focus management
- [ ] Update component documentation

---

## Risk Assessment

| Risk                                              | Likelihood | Mitigation                                                                           |
| ------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| Tailwind CSS conflicts with custom CSS            | Low        | Both systems can coexist; shadcn components apply CSS variables, not class utilities |
| Token mapping doesn't apply to shadcn components  | Low        | CSS variable aliases are standard; test one component first                          |
| Modal focus trap breaks existing behavior         | Low        | bits-ui Dialog is well-tested; test in PhotoSourcePicker first                       |
| Keyboard nav in MultiSelect breaks existing logic | Low        | Wrap bits-ui inside existing component; keep data flow unchanged                     |

---

## Conclusion

This project has 7–9 strong candidates for shadcn-svelte migration, organized by priority:

- **P1 (Do First):** Buttons, Form Fields, Modal Focus Trap — high duplication, high accessibility impact
- **P2 (Do Next):** MultiSelect keyboard nav, Collapsible — medium duplication, medium UX impact
- **P3 (Optional):** Pills/Badges, Cards — low duplication, low priority

**Total effort estimate:** 12–16 hours of development + testing  
**ROI:** ~300 lines of duplicated CSS removed, 3 accessibility gaps fixed, improved DX for future features

Proceed with Phase 1 setup when ready; no breaking changes to UI or token system.
