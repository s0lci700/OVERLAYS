---
name: component-migrate
description: Migrate a Svelte component to use shadcn-svelte / bits-ui v2. Verifies actual installed API before writing, updates all import references, runs lint and build.
argument-hint: /component-migrate <ComponentName or file path>
---

# Component Migrate Skill

Migrate a Svelte component to use `bits-ui` v2 headless primitives + `tailwind-variants`.

**Never assume API shapes. Always verify the installed version first.**

---

## Argument

`$ARGUMENTS` is the component to migrate — e.g. `MultiSelect`, `Dialog`, `src/lib/components/stage/CharacterCard.svelte`.

---

## Workflow

### Step 1 — Verify installed APIs (mandatory, do this before touching any code)

```bash
# From control-panel/
cat package.json | grep -E "bits-ui|shadcn|tailwind-variants"
```

Then grep the actual installed source to confirm which components exist:
```bash
ls node_modules/bits-ui/dist/components/
```

**Do NOT assume any component, prop, or slot exists.** If you can't find it in the installed source, it doesn't exist in this version. Common v2 gotchas:
- `Listbox` does not exist in bits-ui v2 — use `Combobox` instead
- `Select` trigger prop is `asChild`, not `slot="trigger"`
- `Dialog.Overlay` is `Dialog.Backdrop` in some versions — check the source
- All components use Svelte 5 snippets (`{#snippet}`) not slots

### Step 2 — Read the current component

Re-read the component file fresh. Do not rely on any in-context knowledge of what it contains.

Extract:
- What the component does (props, events, behavior)
- Which bits-ui primitives it currently uses (if any)
- Which CSS classes / token vars it references
- Where it is imported across the codebase

```bash
# Find all import sites
grep -r "ComponentName" control-panel/src --include="*.svelte" --include="*.ts" --include="*.js" -l
```

### Step 3 — Plan the migration

Write out:
1. Which bits-ui v2 primitive maps to this component
2. Props that change name/shape
3. Any behavior that bits-ui doesn't cover (must stay as custom code)
4. Files that import this component and need updating

Show the plan and ask for confirmation before writing any code.

### Step 4 — Migrate

Apply changes following the conventions below. Work one file at a time.

After each file: read it back to confirm the changes look correct before moving on.

### Step 5 — Update import sites

For each file that imports the migrated component:
1. Read it fresh
2. Update only what changed (prop names, event names, slot → snippet syntax)
3. Do not refactor surrounding code

### Step 6 — Verify

From `control-panel/`:
```bash
bun run lint
```
Then:
```bash
bun run build
```

Fix all errors before reporting done. Do NOT claim success until both commands pass clean.

---

## Migration Conventions

### Component file location
- `src/lib/components/stage/` — Stage surface components
- `src/lib/components/cast/` — DM/Player components
- `src/lib/components/shared/` — Headless primitives (Dialog, Select, etc.)
- `src/lib/components/ui/` — Design-system primitives (ConditionPill, StatDisplay, etc.)

### CSS
- Stage/cast/overlay components: paired `.css` file (e.g. `MultiSelect.svelte` + `MultiSelect.css`)
- UI primitives (`components/ui/`): scoped `<style>` block inside the `.svelte` file
- State classes use `is-` prefix: `.is-open`, `.is-selected`, `.is-critical`
- Always use token vars — never hardcode colors: `var(--red)` not `#ff4d6a`
- Never edit `generated-tokens.css` — source is `design/tokens.json`

### Svelte 5 patterns
```svelte
<!-- Props -->
let { value = $bindable(), onchange, class: className = "", ...restProps } = $props();

<!-- Snippets (replaces slots) -->
{#snippet trigger()}
  <button>Open</button>
{/snippet}

<!-- State -->
let open = $state(false);
let derived = $derived(open ? "active" : "idle");
```

### bits-ui v2 pattern
```svelte
<script>
  import { Select } from "bits-ui";
</script>

<Select.Root bind:value={selected}>
  <Select.Trigger>
    {selected ?? "Choose..."}
  </Select.Trigger>
  <Select.Content>
    {#each options as opt}
      <Select.Item value={opt.value}>{opt.label}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
```

### TypeScript contracts
- Import all domain types from `$lib/contracts` — never define ad-hoc inline types
- Character types: `$lib/contracts/records`
- Socket event types: `$lib/contracts/events`

### Socket flow (do not break this)
- Components send REST first, never mutate stores directly
- `characters` and `lastRoll` stores come from `$lib/services/socket.js`
- Overlays import from `$lib/components/overlays/shared/overlaySocket.svelte.js` — not socket.js

---

## Common Bits-UI v2 Component Map

| Old pattern | bits-ui v2 equivalent |
|-------------|----------------------|
| Custom dropdown | `Select` or `Combobox` |
| Custom modal | `Dialog` |
| Custom tooltip | `Tooltip` |
| Custom checkbox | `Checkbox` |
| Custom radio | `RadioGroup` |
| Custom listbox / multi-select | `Combobox` with multiple |
| Custom accordion | `Accordion` |
| Custom popover | `Popover` |

---

## Hard Rules

- **Verify before assuming** — check `node_modules/bits-ui/dist/` before using any component or prop
- **One component at a time** — do not batch multiple component migrations in one pass
- **No silent refactors** — only change what is required for the migration; leave surrounding code alone
- **Both commands must pass** — `bun run lint` AND `bun run build` before done
- **Never break socket flow** — if a component touches `characters` or `lastRoll`, verify store usage is unchanged
