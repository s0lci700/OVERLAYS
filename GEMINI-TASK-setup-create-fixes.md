# GEMINI TASK — `/setup/create` Fix Plan
> Self-contained brief. All context is here — do not explore the codebase beyond the files listed.

---

## Project Context

- **App:** SvelteKit + Svelte 5 (runes: `$state`, `$derived`, `$props`, `$effect`)
- **Package manager:** `bun` (never npm)
- **OS:** Windows 11, PowerShell
- **Working directory:** `C:\Users\Sol\Desktop\PITCH\OVERLAYS\control-panel`
- **Framework:** Svelte 5 runes — use `$state()`, `$derived()`, NOT `writable()` stores inside components
- **Design system tokens** (CSS vars, dark theme):
  - `--cyan` / `--cyan-dim` / `--shadow-cyan` → live state / accents
  - `--amber` → **reserved for focused element visual cues only — do NOT use for buttons**
  - `--red` → damage/critical
  - `--white`, `--grey`, `--grey-dim`, `--black`, `--black-elevated`
  - `--font-display` → display heading font
  - `--space-1` through `--space-8` → spacing scale (4pt base)
  - `--radius-md`, `--radius-sm`, `--radius-pill`

---

## Files to Edit

| File | Path |
|------|------|
| CharacterCreationForm.svelte | `src/lib/components/stage/character-creation-form/CharacterCreationForm.svelte` |
| CharacterCreationForm.css | `src/lib/components/stage/character-creation-form/CharacterCreationForm.css` |
| character-form.ts | `src/lib/services/character-form.ts` |

**Do not edit any other files.**

---

## Fix 1 — Typo: "Thiefling" → "Tiefling"

**File:** `CharacterCreationForm.svelte`

In the `AVAILABLE_PHOTOS` array, find:
```js
{ label: "Thiefling", value: "/assets/img/thiefling-256.webp" },
```
Change `label` to `"Tiefling"`. The `value` (file path) stays the same.

---

## Fix 2 — Submit button: ghost → solid primary

**File:** `CharacterCreationForm.css`

The current `.create-submit` is a ghost button (outline + dim background). It must read as a primary filled action.

Replace:
```css
.create-submit {
  border: 2px solid var(--cyan) !important;
  background: var(--cyan-dim) !important;
  color: var(--cyan) !important;
  box-shadow: var(--shadow-cyan);
  border-radius: var(--radius-md) !important;
}
.create-submit:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}
```

With (solid fill — cyan background, dark text, no glow):
```css
.create-submit {
  border: 2px solid var(--cyan) !important;
  background: var(--cyan) !important;
  color: var(--black) !important;
  font-weight: 700;
  letter-spacing: 0.1em;
  border-radius: var(--radius-md) !important;
  transition: opacity 150ms ease, transform 100ms ease !important;
}
.create-submit:hover:not(:disabled) {
  opacity: 0.88 !important;
  transform: translateY(-1px);
}
.create-submit:disabled {
  cursor: not-allowed;
  opacity: 0.4 !important;
  background: var(--cyan-dim) !important;
  color: var(--grey) !important;
}
```

---

## Fix 3 — Required field indicators

**File:** `CharacterCreationForm.svelte` + `CharacterCreationForm.css`

Fields `name`, `player`, and `hpMax` are required (gated by `isFormValid`). They must be visually distinguishable from optional fields.

### Svelte change — add required marker to the three labels:

Find the name label:
```svelte
<Label for="name-input" class="label-caps">Nombre</Label>
```
Replace with:
```svelte
<Label for="name-input" class="label-caps">Nombre <span class="required-mark" aria-hidden="true">*</span></Label>
```

Find the player label:
```svelte
<Label for="player-input" class="label-caps">Jugador</Label>
```
Replace with:
```svelte
<Label for="player-input" class="label-caps">Jugador <span class="required-mark" aria-hidden="true">*</span></Label>
```

Find the hp-max label:
```svelte
<Label for="hp-max-input" class="label-caps">HP MAX</Label>
```
Replace with:
```svelte
<Label for="hp-max-input" class="label-caps">HP MAX <span class="required-mark" aria-hidden="true">*</span></Label>
```

Also add a legend below the subtitle (inside `.create-header`, after the `<p class="create-subtitle">`):
```svelte
<p class="create-legend"><span class="required-mark" aria-hidden="true">*</span> Campo obligatorio</p>
```

### CSS change — add to `CharacterCreationForm.css`:
```css
.required-mark {
  color: var(--cyan);
  font-size: 0.75em;
  vertical-align: super;
  line-height: 1;
  margin-left: 1px;
}

.create-legend {
  font-size: 0.72rem;
  color: var(--grey);
  letter-spacing: 0.06em;
  margin-top: var(--space-1);
}
```

---

## Fix 4 — Stats section heading

**File:** `CharacterCreationForm.svelte`

The HP/AC/VEL stats grid has no section heading, unlike Clase and Especie. Wrap the `.stats-grid` in a `.create-section` with a heading.

Find:
```svelte
        <!-- Combat stats -->
        <div class="stats-grid">
```

Replace with:
```svelte
        <!-- Combat stats -->
        <div class="create-section">
          <h3 class="section-title">Combate</h3>
          <div class="stats-grid">
```

And close the new wrapper div after the last `.field-vel`:
```svelte
          </div>
        </div>
```

So the final structure is:
```svelte
        <div class="create-section">
          <h3 class="section-title">Combate</h3>
          <div class="stats-grid">
            <div class="create-field field-hp">...</div>
            <div class="create-field field-ac">...</div>
            <div class="create-field field-vel">...</div>
          </div>
        </div>
```

---

## Fix 5 — Disable subclass until class is chosen

**File:** `CharacterCreationForm.svelte`

Subclasses array in the data is currently empty, but the select should still be disabled until a class is selected to prevent invalid combinations when data is added later.

Find the subclass select:
```svelte
            <select id="subclass-input" bind:value={classSubclass} class="form-select">
              <option value="">— Seleccionar —</option>
              {#each optionSets.subclassOptions as opt (opt.key)}
                <option value={opt.key}>{opt.label}</option>
              {/each}
            </select>
```

Replace with:
```svelte
            <select
              id="subclass-input"
              bind:value={classSubclass}
              class="form-select"
              disabled={!classPrimary}
            >
              <option value="">{classPrimary ? "— Seleccionar —" : "Elige clase primero"}</option>
              {#each optionSets.subclassOptions as opt (opt.key)}
                <option value={opt.key}>{opt.label}</option>
              {/each}
            </select>
```

Also add a CSS rule for the disabled state in `CharacterCreationForm.css`:
```css
.form-select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

---

## Fix 6 — Autofocus first field

**File:** `CharacterCreationForm.svelte`

Add `autofocus` to the name input so focus lands there on page load:

Find:
```svelte
            <Input
              class="name-input form-input"
              id="name-input"
              type="text"
              placeholder="Ej. Valeria"
              bind:value={name}
              maxlength="40"
              required
              variant="dark"
            />
```

Add `autofocus`:
```svelte
            <Input
              class="name-input form-input"
              id="name-input"
              type="text"
              placeholder="Ej. Valeria"
              bind:value={name}
              maxlength="40"
              required
              autofocus
              variant="dark"
            />
```

---

## Fix 7 — Success state: promote "Ver ficha" to a button

**File:** `CharacterCreationForm.svelte`

Find the success feedback block:
```svelte
    {#if successMessage}
      <p class="create-feedback success">
        {successMessage}
        {#if lastCreatedId}
          <a href={resolve(`/players/${lastCreatedId}`, {})} class="success-link">Ver ficha</a>
        {/if}
      </p>
    {/if}
```

Replace with:
```svelte
    {#if successMessage}
      <div class="create-success-block">
        <p class="create-feedback success">{successMessage}</p>
        {#if lastCreatedId}
          <div class="create-success-actions">
            <a href={resolve(`/players/${lastCreatedId}`, {})} class="create-success-primary">
              VER FICHA
            </a>
            <button
              type="button"
              class="create-success-secondary"
              onclick={() => { successMessage = ""; lastCreatedId = ""; lastCreatedName = ""; }}
            >
              CREAR OTRO
            </button>
          </div>
        {/if}
      </div>
    {/if}
```

And add to `CharacterCreationForm.css`:
```css
.create-success-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.create-success-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.create-success-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 var(--space-4);
  background: var(--cyan);
  color: var(--black);
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: opacity 150ms ease;
}
.create-success-primary:hover {
  opacity: 0.85;
}

.create-success-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 var(--space-4);
  background: transparent;
  color: var(--grey);
  border: 1px solid var(--grey-dim);
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}
.create-success-secondary:hover {
  border-color: var(--grey);
  color: var(--white);
}
```

Also remove the now-unused `.success-link` rule from the CSS file.

---

## Fix 8 — Remove dead `skills` state (or stub it)

**File:** `CharacterCreationForm.svelte`

The `skills` variable is in `$state(getDefaultFormValues())` but never rendered in the form UI. Remove it from the destructuring:

Find:
```js
  let {
    name,
    player,
    hpMax,
    armorClass,
    speedWalk,
    classPrimary,
    classSubclass,
    classLevel,
    speciesName,
    skills,
  } = $state(getDefaultFormValues());
```

Remove `skills,` from the destructuring (it's still passed via `buildCharacterPayload` which handles it gracefully when empty).

Also update the reset block in `submitCharacter` (after success) — remove `skills` from both the destructuring reset and the explicit reset:
```js
      ({
        name, player, hpMax, armorClass, speedWalk,
        classPrimary, classSubclass, classLevel,
        speciesName,
      } = getDefaultFormValues());
```

---

## Fix 9 — Replace redundant subtitle copy

**File:** `CharacterCreationForm.svelte`

Find:
```svelte
    <p class="create-subtitle">Crea el perfil base del personaje para esta sesión</p>
```

Replace with (shows live character count from the socket store):
```svelte
    <p class="create-subtitle">{$characters.length} personaje{$characters.length === 1 ? '' : 's'} en sesión</p>
```

This requires importing `characters` at the top of the script block. Find the existing imports and add:
```js
  import { characters, SERVER_URL } from "$lib/services/socket.svelte.js";
```

(If `SERVER_URL` is already imported from elsewhere, keep the existing import and add only `characters`.)

---

## Verification

After all edits, run from `control-panel/`:
```bash
bun run svelte-check 2>&1 | grep -E "CharacterCreationForm|character-form" | grep -v stories
```

Expected: no errors. Warnings about `$state` reference captures in unrelated files are pre-existing — ignore them.

Do not run the dev server. Do not commit. Report back any svelte-check errors found.
