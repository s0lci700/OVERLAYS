## What is a headless component library?

Traditional UI libraries (like Bootstrap) ship components with built-in styles you work around. Headless libraries like `bits-ui` provide **behaviour and accessibility** with no visual opinions. You own the styles entirely.

This matches OVERLAYS perfectly — the design language is custom and specific to the production context.

## bits-ui primitives

`bits-ui` provides composable primitive components for common UI patterns:

```svelte
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Confirm action</Dialog.Title>
      <Dialog.Description>This cannot be undone.</Dialog.Description>
      <Dialog.Close>Cancel</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

Each sub-component wires up ARIA roles, keyboard navigation, and focus trapping — you style them with your own CSS.

## The wrapper pattern in OVERLAYS

The `ui/` folder wraps bits-ui primitives with project-specific defaults:

```svelte
<!-- control-panel/src/lib/components/ui/Dialog/Dialog.svelte -->
<script lang="ts">
  import { Dialog as BitsDialog } from 'bits-ui';
  // ... export OVERLAYS-specific props
</script>

<BitsDialog.Root {...props}>
  {@render children()}
</BitsDialog.Root>
```

Now the rest of the app imports from `$lib/components/ui/Dialog`, not directly from `bits-ui`. This creates a single choke point for design decisions.

## tailwind-variants for variant styling

`tailwind-variants` composes class variants without manual string concatenation:

```typescript
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'btn-base',
  variants: {
    intent: { primary: 'btn-primary', ghost: 'btn-ghost' },
    size: { sm: 'btn-sm', md: 'btn-md' }
  },
  defaultVariants: { intent: 'primary', size: 'md' }
});

// Usage: button({ intent: 'ghost', size: 'sm' }) → 'btn-base btn-ghost btn-sm'
```
