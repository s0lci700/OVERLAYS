## The four styling layers

### 1. Design tokens — `design/tokens.json` → `generated-tokens.css`

The canonical source. JSON tokens are compiled to CSS custom properties by `bun run generate:tokens`. **Never edit the generated file directly.**

```json
// design/tokens.json (source)
{ "color": { "hp-full": "#4ade80", "hp-critical": "#ef4444" } }

// generated-tokens.css (output — do not edit)
:root { --color-hp-full: #4ade80; --color-hp-critical: #ef4444; }
```

Use tokens for: brand colours, semantic colours, spacing scale, border radii, typography scale.

### 2. app.css — global base styles

Project-wide resets, typography defaults, shared utility classes (`.card-base`, `.btn-base`, `.label-caps`), and layout primitives. Changes here affect every component.

Only add to `app.css` when the style is genuinely universal — not "I'll probably reuse this".

### 3. utilities.css — semantic shared utilities

Shared classes that are domain-aware: `.is-critical`, `.is-selected`, `.overlay-safe`. These are BEM-style state classes applied in templates across components.

### 4. Local component CSS — `<style>` block or paired `.css` file

For wrapper structure and component-specific layout that belongs to exactly one component. This is always valid — don't fight it with global classes.

```svelte
<style>
  .card { display: grid; grid-template-columns: 1fr auto; }
  .card.is-collapsed { height: 48px; overflow: hidden; }
</style>
```

## Decision guide

| Question | Layer |
|----------|-------|
| Is this a reusable design value (colour, size)? | Token |
| Is this a reset or truly universal utility? | `app.css` |
| Is this a shared state class used in multiple components? | `utilities.css` |
| Is this the structure of exactly one component? | Local CSS |
