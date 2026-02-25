# UI Pattern Locations — Quick Reference

**Purpose:** Find and refactor repeating UI patterns. This file maps each pattern to the exact files and line ranges where it appears.

---

## Pattern 1: Button Variants

### `.btn-base` Definition

- **File:** [src/app.css](src/app.css#L271)
- **Lines:** 271–298 (base button reset + focus styles)
- **Usage:** All buttons inherit this base class

### `.btn-damage` (Red/Damage buttons)

**Definition:**

- [src/app.css](src/app.css#L300) — `--shadow-red` token
- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L260) — `.btn-damage` styles

**Instances:**

1. [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L498) — "− DAÑO" button
2. [CharacterBulkControls.svelte](../control-panel/src/routes/control/characters/+page.svelte#L272) — Bulk damage button
3. [DiceRoller.svelte](../control-panel/src/lib/DiceRoller.svelte#L250) — (if recolored)

### `.btn-heal` (Cyan/Healing buttons)

**Definition:**

- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L270) — `.btn-heal` styles

**Instances:**

1. [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L506) — "+ CURAR" button
2. [CharacterBulkControls](../control-panel/src/routes/control/characters/+page.svelte#L278) — Bulk heal button

### `.btn-rest` (Grey/Rest buttons)

**Definition:**

- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L661) — `.btn-rest` styles

**Instances:**

1. [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L482) — "CORTO" rest button
2. [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L486) — "LARGO" rest button
3. [CharacterBulkControls](../control-panel/src/routes/control/characters/+page.svelte#L284) — Bulk rest button

### `.dice-btn` (Purple/Dice buttons)

**Definition:**

- [DiceRoller.css](../control-panel/src/lib/DiceRoller.css#L91) — `.dice-btn` styles

**Instances:**

1. [DiceRoller.svelte](../control-panel/src/lib/DiceRoller.svelte#L185) — 6× dice buttons (d4–d20)

### `.create-submit` (Cyan primary submit)

**Definition:**

- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L251) — `.create-submit` styles

**Instances:**

1. [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L698) — "CREAR PERSONAJE" button

### `.bulk-toggle` & `.bulk-action` (Bulk operations)

**Definition:**

- [CharacterBulkControls.css](../control-panel/src/lib/CharacterBulkControls.css#L65) — `.bulk-toggle`, `.bulk-action` styles

**Instances:**

1. [+page.svelte (control/characters)](../control-panel/src/routes/control/characters/+page.svelte#L260) — Clear selection toggle
2. [+page.svelte (control/characters)](../control-panel/src/routes/control/characters/+page.svelte#L272–284) — Bulk damage/heal/rest buttons

### `.manage-edit-toggle`, `.manage-delete-btn`

**Definition:**

- [CharacterManagement.css](../control-panel/src/lib/CharacterManagement.css#L110) — `.manage-edit-toggle` styles

**Instances:**

1. [CharacterManagement.svelte](../control-panel/src/lib/CharacterManagement.svelte#L134) — Edit toggle per character
2. [CharacterManagement.svelte](../control-panel/src/lib/CharacterManagement.svelte#L152) — Delete button per character

### Navigation Tab Buttons

**Definition:**

- [src/app.css](src/app.css#L380) — `.nav-tab` in `:where()` focus style

**Instances:**

1. [+layout.svelte (routes)](../control-panel/src/routes/+layout.svelte) — Sidebar nav tabs
2. [PhotoSourcePicker.svelte](../control-panel/src/lib/PhotoSourcePicker.svelte#L213) — Photo source selection buttons (act like tabs)

---

## Pattern 2: Form Fields (Label + Input + Validation)

### `.create-field` Layout (CharacterCreationForm)

**Definition:**

- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L218) — `.create-field` + `.create-field input` styles

**Instances in CharacterCreationForm.svelte:**

1. [Lines ~360–380](../control-panel/src/lib/CharacterCreationForm.svelte#L360) — Name field
2. [Lines ~385–405](../control-panel/src/lib/CharacterCreationForm.svelte#L385) — Player field
3. [Lines ~420–440](../control-panel/src/lib/CharacterCreationForm.svelte#L420) — HP Max field
4. [Lines ~453–473](../control-panel/src/lib/CharacterCreationForm.svelte#L453) — Armor Class field
5. [Lines ~490–510](../control-panel/src/lib/CharacterCreationForm.svelte#L490) — Speed field
6. Additional fields for alignment, level, challenge, etc.

**Error/Success Message Pattern:**

- [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L700) — Error message
- [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L704) — Success message
- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L264) — `.create-feedback` styles

### `.manage-field` Layout (CharacterManagement)

**Definition:**

- [CharacterManagement.css](../control-panel/src/lib/CharacterManagement.css#L145) — `.manage-field` + `.manage-field input` styles

**Instances in CharacterManagement.svelte:**

1. [Lines ~160–180](../control-panel/src/lib/CharacterManagement.svelte#L160) — Name field (edit mode)
2. [Lines ~185–205](../control-panel/src/lib/CharacterManagement.svelte#L185) — Player field (edit mode)
3. Additional stat fields in edit form

### Input Group Pattern (PhotoSourcePicker)

**Definition:**

- [PhotoSourcePicker.css](../control-panel/src/lib/PhotoSourcePicker.css#L293) — `.photo-input-row` + input styles

**Instances in PhotoSourcePicker.svelte:**

1. [Lines ~238–250](../control-panel/src/lib/PhotoSourcePicker.svelte#L238) — URL input row
2. [Lines ~256–273](../control-panel/src/lib/PhotoSourcePicker.svelte#L256) — Local file input row

### Stepper Input with Validation (DiceRoller, CharacterCard)

**Definition:**

- [DiceRoller.css](../control-panel/src/lib/DiceRoller.css#L143) — Modifier input + stepper
- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L510) — Amount input + stepper

**Instances:**

1. [DiceRoller.svelte](../control-panel/src/lib/DiceRoller.svelte#L165) — Modifier input with +/− buttons
2. [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L510) — HP amount input with +/− buttons

### Field Grid Layouts

**Definition (CharacterCreationForm):**

- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L68) — `.identity-group` (2 col)
- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L81) — `.stats-grid` (3 col)
- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L99) — `.create-grid--two` / `.create-grid--three`

**Instances:**

1. [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L330) — Identity group (Name + Player)
2. [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L350) — Stats grid (HP, AC, VEL)
3. [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L410) — Options grid (Languages, Skills, etc.)

### Number Input Focus/Validation

**Definition:**

- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L234) — `.create-field input:focus`
- [CharacterManagement.css](../control-panel/src/lib/CharacterManagement.css#L170) — `.manage-field input:focus`
- [PhotoSourcePicker.css](../control-panel/src/lib/PhotoSourcePicker.css#L318) — Input focus states

**Pattern:** All use same cyan border + shadow on focus

```css
border-color: var(--cyan);
box-shadow: 0 0 0 1px var(--cyan-dim);
```

---

## Pattern 3: Modal/Dialog (Focus Trap, Escape Key)

### Modal.svelte Wrapper

**File:** [Modal.svelte](../control-panel/src/lib/Modal.svelte) — Custom modal implementation

**Current Issues:**

- No focus trap (Tab can escape)
- No automatic Escape key handling
- No built-in `aria-modal="true"` wiring

### Dialog Import in CharacterCreationForm

**File:** [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L17)
**Lines:** 17 (imports bits-ui Dialog already)

**Usage for Photo Modal:**

```svelte
<Dialog.Root bind:open={showPhotoModal}>
  <Dialog.Trigger>Agregar foto</Dialog.Trigger>
  <Dialog.Content class="modal-panel">
    <PhotoSourcePicker ... />
  </Dialog.Content>
</Dialog.Root>
```

### Modal.svelte in PhotoSourcePicker

**File:** [PhotoSourcePicker.svelte](../control-panel/src/lib/PhotoSourcePicker.svelte#L206) — Uses custom Modal wrapper
**Lines:** 206–280 (modal markup)

**Modal Styling:**

- [app.css](src/app.css#L400) — `.modal-backdrop`, `.modal-panel` base styles
- Custom modal CSS in PhotoSourcePicker.css

### Dialog-Related Styling

**Definition:**

- [app.css](src/app.css#L395) — Modal token definitions
- [PhotoSourcePicker.css](../control-panel/src/lib/PhotoSourcePicker.css#L55) — Modal-specific overrides

---

## Pattern 4: Multi-Select / Listbox

### MultiSelect.svelte Component

**File:** [MultiSelect.svelte](../control-panel/src/lib/MultiSelect.svelte)
**Lines:** 1–123

**Current Implementation:**

- Custom keyboard navigation (arrows, Home/End, type-to-jump)
- ARIA: `role="listbox"`, `aria-multiselectable="true"`, `aria-activedescendant`
- **Missing:** Full bits-ui Listbox integration for enhanced ARIA

### Multi-Select Instances in CharacterCreationForm

**File:** [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte)

1. [Lines ~540–560](../control-panel/src/lib/CharacterCreationForm.svelte#L540) — Languages selector
2. [Lines ~570–590](../control-panel/src/lib/CharacterCreationForm.svelte#L570) — Rare Languages selector
3. [Lines ~600–620](../control-panel/src/lib/CharacterCreationForm.svelte#L600) — Skills selector
4. [Lines ~630–650](../control-panel/src/lib/CharacterCreationForm.svelte#L630) — Tools selector
5. [Lines ~660–680](../control-panel/src/lib/CharacterCreationForm.svelte#L660) — Armor Proficiencies selector
6. [Lines ~690–710](../control-panel/src/lib/CharacterCreationForm.svelte#L690) — Weapon Proficiencies selector
7. [Lines ~720–740](../control-panel/src/lib/CharacterCreationForm.svelte#L720) — Items selector

### MultiSelect CSS

**Definition:**

- [MultiSelect.css](../control-panel/src/lib/MultiSelect.css) — `.ms-listbox`, `.ms-option`, `.ms-check` styles

### Photo Source Selector (Acts Like Listbox)

**File:** [PhotoSourcePicker.svelte](../control-panel/src/lib/PhotoSourcePicker.svelte#L213)
**Lines:** 213–225 (preset, URL, local photo tabs)

**Issue:** Should have `role="tablist"` + `aria-selected` on buttons
**Current:** Manual button group with no semantic role

---

## Pattern 5: Collapsible Sections

### CharacterCard Collapse

**File:** [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte)

**Collapse Toggle Button:**

- [Lines 363–373](../control-panel/src/lib/CharacterCard.svelte#L363) — `.collapse-toggle` button
- [Lines 371–372](../control-panel/src/lib/CharacterCard.svelte#L371) — Arrow icon + SR text

**Collapse State Management:**

- [Lines 49–50](../control-panel/src/lib/CharacterCard.svelte#L49) — `isCollapsed` state
- [Lines 79–85](../control-panel/src/lib/CharacterCard.svelte#L79) — Animation effect

**Collapsible Content:**

- [Lines 398–530](../control-panel/src/lib/CharacterCard.svelte#L398) — `.char-body` (animated section)
- Contents: Stats, Conditions, Resources, Rest buttons, HP Controls

### Collapse Animation (anime.js)

**File:** [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L79)
**Pattern:**

```svelte
$effect(() => {
  if (!charBodyEl) return;
  animate(charBodyEl, {
    height: isCollapsed ? 0 : `${target}px`,
    duration: 350,
    ease: "easeInOutCubic"
  });
});
```

### Collapse CSS

**Definition:**

- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L181) — `.collapse-toggle` styles
- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L200) — `.char-body` overflow handling

---

## Pattern 6: Condition Pills / Badges

### Condition Pill Instances

**File:** [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L448)

```svelte
/* Lines 448–456 */
{#each character.conditions as condition (condition.id)}
  <button
    class="condition-pill"
    onclick={() => removeCondition(condition.id)}
  >
    {condition.condition_name} ×
  </button>
{/each}
```

### Condition Pill CSS

**Definition:**

- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L591) — `.condition-pill` styles
- Uses red color, padding, border-radius from tokens

### Level Pill Component

**File:** [LevelPill.svelte](../control-panel/src/lib/components/ui/pills/LevelPill.svelte)
**Lines:** 1–30

**Styling:**

- Custom component with hardcoded colors
- Not a reusable badge component

### Where Pills Would Be Useful (Future)

1. Dashboard status indicators
2. Character tags/labels
3. Spell schools/types
4. Equipment rarity badges

---

## Pattern 7: Select / Dropdown

### Character Selector (DiceRoller)

**File:** [DiceRoller.svelte](../control-panel/src/lib/DiceRoller.svelte#L140)

```svelte
/* Lines 140–150 */
<select bind:value={selectedCharId} class="selector">
  {#each $characters as char}
    <option value={char.id}>{char.name}</option>
  {/each}
</select>
```

### Select CSS

**Definition:**

- [app.css](src/app.css#L310) — `.selector` base styles (dark elevated, custom chevron)
- [app.css](src/app.css#L330) — `.selector:focus` (cyan border)

### Photo Source Tabs (Acts Like Select)

**File:** [PhotoSourcePicker.svelte](../control-panel/src/lib/PhotoSourcePicker.svelte#L213)
**Issue:** Should use semantic select or tablist; currently just button group

---

## Pattern 8: Loading & Error States

### Disabled Button Pattern

**Used across all button types:**

- Definition: [app.css](src/app.css#L288) — `:disabled` focus-visible rule
- Pattern: All buttons use `disabled={isUpdating}` or similar

**Instances:**

1. [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L478) — HP buttons disabled during update
2. [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L482) — Rest buttons disabled during update
3. [DiceRoller.svelte](../control-panel/src/lib/DiceRoller.svelte#L250) — Dice buttons disabled during roll
4. [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L698) — Submit button disabled during POST

### Error Message Pattern

**Files:**

- [CharacterCreationForm.svelte](../control-panel/src/lib/CharacterCreationForm.svelte#L700) — Error feedback div
- [CharacterCard.svelte](../control-panel/src/lib/CharacterCard.svelte#L325) — Card-level error toast
- [CharacterBulkControls.svelte](../control-panel/src/routes/control/characters/+page.svelte) — Bulk operation errors

**CSS:**

- [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L264) — `.create-feedback` styles (red/green)
- [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L129) — `.card-toast` styles

---

## Pattern 9: Input Focus States (Repeated)

### Focus Ring Pattern

**Repeated across all inputs and controls:**

```css
:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 1px var(--cyan-dim);
}
```

**Files with this pattern:**

1. [app.css](src/app.css#L330) — `.selector:focus`
2. [CharacterCreationForm.css](../control-panel/src/lib/CharacterCreationForm.css#L234) — `.create-field input:focus`
3. [CharacterManagement.css](../control-panel/src/lib/CharacterManagement.css#L170) — `.manage-field input:focus`
4. [PhotoSourcePicker.css](../control-panel/src/lib/PhotoSourcePicker.css#L318) — Input focus states
5. [DiceRoller.css](../control-panel/src/lib/DiceRoller.css#L160) — Modifier input focus
6. [CharacterCard.css](../control-panel/src/lib/CharacterCard.css#L512) — Amount input focus

**Opportunity:** Could be consolidated into `.form-control:focus` base rule

---

## Summary Table

| Pattern         | Instances              | Total Lines Duplicated | Priority |
| --------------- | ---------------------- | ---------------------- | -------- |
| Button variants | 8 files, 20+ instances | ~200 lines CSS         | High     |
| Form fields     | 5 files, 20+ instances | ~250 lines CSS         | High     |
| Modal/Dialog    | 2 files                | ~50 lines CSS          | High     |
| MultiSelect     | 1 file, 7 instances    | ~100 lines CSS         | Medium   |
| Collapsible     | 1 file                 | ~80 lines CSS          | Medium   |
| Pills/Badges    | 2 files                | ~40 lines CSS          | Low      |
| Selects         | 2 files                | ~30 lines CSS          | Low      |
| Error states    | 3 files                | ~80 lines CSS          | Low      |

**Total CSS Duplication:** ~830 lines (excluding JS logic, which is custom per component)
